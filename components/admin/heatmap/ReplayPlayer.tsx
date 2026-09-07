"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DeviceFrame } from "@/components/admin/heatmap/DeviceFrame";
import { HEATMAP_PREVIEW_PARAM, REPLAY_FRAME } from "@/lib/analytics/constants";
import type { AnalyticsEventRow, AnalyticsSession } from "@/lib/analytics/types";
import { Button } from "@/components/shadcn/button";

/** Pick a stable device frame so the iframe hits the right CSS breakpoints. */
function replayViewport(session: AnalyticsSession) {
  if (session.device === "mobile") {
    // Prefer the recorded phone size when it is already phone-class; otherwise
    // fall back to a canonical iPhone frame so the page does not reflow as desktop.
    const recordedPhone =
      session.viewport_w > 0 &&
      session.viewport_w < 768 &&
      session.viewport_h > 0;
    return {
      w: recordedPhone ? Math.round(session.viewport_w) : REPLAY_FRAME.mobile.w,
      h: recordedPhone ? Math.round(session.viewport_h) : REPLAY_FRAME.mobile.h,
    };
  }

  if (session.device === "tablet") {
    const recordedTablet =
      session.viewport_w >= 768 &&
      session.viewport_w < 1024 &&
      session.viewport_h > 0;
    return {
      w: recordedTablet ? Math.round(session.viewport_w) : REPLAY_FRAME.tablet.w,
      h: recordedTablet ? Math.round(session.viewport_h) : REPLAY_FRAME.tablet.h,
    };
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

function mapScrollY(
  scrollY: number,
  recordedDocumentH: number,
  recordedViewportH: number,
  liveDocumentH: number,
  liveViewportH: number
): number {
  const recordedTravel = Math.max(1, recordedDocumentH - recordedViewportH);
  const liveTravel = Math.max(1, liveDocumentH - liveViewportH);
  const pct = Math.min(1, Math.max(0, scrollY / recordedTravel));
  return pct * liveTravel;
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
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [index, setIndex] = useState(0);
  const [liveDocumentH, setLiveDocumentH] = useState(session.document_h);
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
  const start = times[0] ?? Date.now();
  const end = times[times.length - 1] ?? start;
  const duration = Math.max(1, end - start);
  const current = events[index];
  const view = useMemo(() => replayViewport(session), [session]);
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
      event?.document_h || session.document_h || liveDocumentH
    );
    const recordedH = Math.max(1, event?.viewport_h || recordedViewportH);
    const mapped = mapScrollY(
      scrollY,
      recordedDocumentH,
      recordedH,
      Math.max(liveDocumentH, recordedDocumentH),
      view.h
    );
    frame.postMessage({ type: "heatmap-scroll", scrollY: mapped }, siteUrl);
  }

  function postInputs(values: Record<string, string>) {
    const frame = frameRef.current?.contentWindow;
    if (!frame) return;
    frame.postMessage({ type: "heatmap-inputs", values }, siteUrl);
  }

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (!current) return;
    if (current.x != null && current.y != null) {
      const eventW = Math.max(1, current.viewport_w || recordedViewportW);
      const eventH = Math.max(1, current.viewport_h || recordedViewportH);
      const viewportX = current.x;
      const viewportY = current.y - current.scroll_y;
      setCursor({
        x: viewportX * (view.w / eventW),
        y: viewportY * (view.h / eventH),
        visible: true,
        click: current.type === "click",
      });
    }
    postScroll(current.scroll_y, current);
    postInputs(typedValues);
  }, [
    current,
    liveDocumentH,
    recordedViewportH,
    recordedViewportW,
    siteUrl,
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
          setLiveDocumentH((prev) =>
            Math.abs(prev - data.documentH!) < 2 ? prev : data.documentH!
          );
        }
      }
      if (data.type !== "heatmap-ready") return;
      if (current) postScroll(current.scroll_y, current);
      postInputs(typedValues);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [current, typedValues, siteUrl, liveDocumentH, view.h]);

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
      <DeviceFrame viewportW={view.w} viewportH={view.h} device={session.device}>
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
                session.device === "mobile" ? "size-5" : "size-4"
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
