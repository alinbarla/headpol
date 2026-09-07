"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DeviceFrame } from "@/components/admin/heatmap/DeviceFrame";
import { HEATMAP_PREVIEW_PARAM, REPLAY_FRAME } from "@/lib/analytics/constants";
import type {
  AnalyticsEventRow,
  AnalyticsSession,
  HeatmapDevice,
} from "@/lib/analytics/types";
import { Button } from "@/components/shadcn/button";

/** Resolve the device class for chrome + iframe breakpoints. */
function replayDevice(session: AnalyticsSession): HeatmapDevice {
  if (session.device === "mobile" || session.viewport_w < 768) return "mobile";
  if (session.device === "tablet" || session.viewport_w < 1024) return "tablet";
  return "desktop";
}

/**
 * Canonical frame sizes:
 * - mobile  → iPhone (390×844) so the page always hits mobile CSS
 * - desktop → desktop window so the page always hits desktop CSS
 */
function replayViewport(device: HeatmapDevice, session: AnalyticsSession) {
  if (device === "mobile") {
    return { w: REPLAY_FRAME.mobile.w, h: REPLAY_FRAME.mobile.h };
  }
  if (device === "tablet") {
    return { w: REPLAY_FRAME.tablet.w, h: REPLAY_FRAME.tablet.h };
  }
  return {
    w:
      session.viewport_w >= 1024
        ? Math.round(session.viewport_w)
        : REPLAY_FRAME.desktop.w,
    h:
      session.viewport_h >= 600
        ? Math.round(session.viewport_h)
        : REPLAY_FRAME.desktop.h,
  };
}

/** Map recorded page scrollY into the live iframe document. */
function mapScrollY(
  scrollY: number,
  recordedDocumentH: number,
  liveDocumentH: number
): number {
  const recorded = Math.max(1, recordedDocumentH);
  const live = Math.max(1, liveDocumentH);
  return Math.max(0, scrollY * (live / recorded));
}

export function ReplayPlayer({
  siteUrl,
  session,
  events,
}: {
  siteUrl: string;
  session: AnalyticsSession;
  events: AnalyticsEventRow[];
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const indexRef = useRef(0);
  const liveDocHRef = useRef(Math.max(1, session.document_h));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [index, setIndex] = useState(0);
  const [liveDocumentH, setLiveDocumentH] = useState(
    Math.max(1, session.document_h)
  );
  const [frameReady, setFrameReady] = useState(false);
  const [cursor, setCursor] = useState({
    x: 24,
    y: 24,
    visible: false,
    click: false,
  });

  const times = useMemo(
    () => events.map((event) => new Date(event.ts).getTime()),
    [events]
  );
  const start = times[0] ?? 0;
  const end = times[times.length - 1] ?? start;
  const duration = Math.max(1, end - start);
  const current = events[index];
  const device = useMemo(() => replayDevice(session), [session]);
  const view = useMemo(
    () => replayViewport(device, session),
    [device, session]
  );
  const recordedViewportW = Math.max(1, session.viewport_w || view.w);
  const recordedViewportH = Math.max(1, session.viewport_h || view.h);
  const src = `${siteUrl}${session.page === "/" ? "/" : session.page}?${HEATMAP_PREVIEW_PARAM}=1`;

  const typedValues = useMemo(() => {
    const values: Record<string, string> = {};
    for (const event of events.slice(0, index + 1)) {
      if (event.type === "input" && event.field) {
        values[event.field] = event.value ?? "";
      }
    }
    return values;
  }, [events, index]);

  function postScroll(scrollY: number, event?: AnalyticsEventRow | null) {
    const frame = frameRef.current?.contentWindow;
    if (!frame) return;
    const recordedDocumentH = Math.max(
      1,
      event?.document_h || session.document_h || liveDocHRef.current
    );
    const mapped = mapScrollY(
      scrollY,
      recordedDocumentH,
      liveDocHRef.current
    );
    // "*" so scroll still applies if SITE_URL host differs slightly from the iframe.
    frame.postMessage({ type: "heatmap-scroll", scrollY: mapped }, "*");
  }

  function postInputs(values: Record<string, string>) {
    const frame = frameRef.current?.contentWindow;
    if (!frame) return;
    frame.postMessage({ type: "heatmap-inputs", values }, "*");
  }

  useEffect(() => {
    liveDocHRef.current = liveDocumentH;
  }, [liveDocumentH]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    setFrameReady(false);
  }, [src, view.w, view.h]);

  useEffect(() => {
    if (!current || !frameReady) return;

    if (current.x != null && current.y != null) {
      const eventW = Math.max(1, current.viewport_w || recordedViewportW);
      const eventH = Math.max(1, current.viewport_h || recordedViewportH);
      setCursor({
        x: current.x * (view.w / eventW),
        y: (current.y - current.scroll_y) * (view.h / eventH),
        visible: true,
        click: current.type === "click",
      });
    }

    postScroll(current.scroll_y, current);
    postInputs(typedValues);
  }, [
    current,
    frameReady,
    liveDocumentH,
    recordedViewportH,
    recordedViewportW,
    typedValues,
    view.h,
    view.w,
  ]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as {
        type?: string;
        documentH?: number;
      } | null;
      if (!data) return;

      if (data.type === "heatmap-ready" || data.type === "heatmap-viewport") {
        if (typeof data.documentH === "number" && data.documentH > 0) {
          setLiveDocumentH((prev) => {
            if (Math.abs(prev - data.documentH!) < 2) return prev;
            liveDocHRef.current = data.documentH!;
            return data.documentH!;
          });
        }
      }

      if (data.type === "heatmap-ready") {
        setFrameReady(true);
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!playing || events.length === 0) return;

    let cancelled = false;
    let last = performance.now();
    let elapsed = (times[indexRef.current] ?? start) - start;

    function tick(now: number) {
      if (cancelled) return;
      elapsed += (now - last) * speed;
      last = now;

      let nextIndex = 0;
      while (
        nextIndex < events.length - 1 &&
        times[nextIndex + 1] - start <= elapsed
      ) {
        nextIndex += 1;
      }

      if (nextIndex !== indexRef.current) {
        indexRef.current = nextIndex;
        setIndex(nextIndex);
      }

      if (elapsed >= duration) {
        setPlaying(false);
        setIndex(events.length - 1);
        return;
      }

      requestAnimationFrame(tick);
    }

    const frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [playing, speed, events.length, duration, start, times]);

  const typedEntries = Object.entries(typedValues);

  return (
    <div className="space-y-3">
      <DeviceFrame viewportW={view.w} viewportH={view.h} device={device}>
        <iframe
          ref={frameRef}
          src={src}
          title={`Replay of ${session.page}`}
          width={view.w}
          height={view.h}
          className="block bg-background"
          style={{ width: view.w, height: view.h, border: 0 }}
          sandbox="allow-scripts allow-same-origin"
        />
        {cursor.visible ? (
          <div
            className="pointer-events-none absolute left-0 top-0 z-10"
            style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
          >
            <div
              className={`-translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow ${
                device === "mobile" ? "size-5" : "size-4"
              } ${cursor.click ? "scale-125" : ""}`}
            />
            {cursor.click ? (
              <div className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/70" />
            ) : null}
          </div>
        ) : null}
      </DeviceFrame>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={() => setPlaying((value) => !value)}>
          {playing ? "Pause" : "Play"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setPlaying(false);
            setIndex(0);
          }}
        >
          Reset
        </Button>
        <Button
          type="button"
          size="sm"
          variant={speed === 1 ? "secondary" : "outline"}
          onClick={() => setSpeed(1)}
        >
          1x
        </Button>
        <Button
          type="button"
          size="sm"
          variant={speed === 2 ? "secondary" : "outline"}
          onClick={() => setSpeed(2)}
        >
          2x
        </Button>
        <input
          type="range"
          min={0}
          max={Math.max(0, events.length - 1)}
          value={index}
          onChange={(event) => {
            setPlaying(false);
            setIndex(Number(event.target.value));
          }}
          className="min-w-40 flex-1 accent-[var(--primary)]"
          aria-label="Scrub replay"
        />
        <span className="text-xs text-muted-foreground">
          {events.length === 0 ? "0/0" : `${index + 1}/${events.length}`}
        </span>
      </div>

      <div className="rounded-lg border border-border p-3">
        <p className="text-sm font-medium">Typed in form</p>
        {typedEntries.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Nothing typed yet at this point in the session.
          </p>
        ) : (
          <dl className="mt-2 space-y-1.5 text-sm">
            {typedEntries.map(([field, value]) => (
              <div key={field} className="grid gap-0.5 sm:grid-cols-[10rem_1fr]">
                <dt className="font-mono text-xs text-muted-foreground">{field}</dt>
                <dd className="break-words">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
