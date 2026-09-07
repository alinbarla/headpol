"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DeviceFrame } from "@/components/admin/heatmap/DeviceFrame";
import { HeatmapDesktopOnly } from "@/components/admin/heatmap/HeatmapDesktopOnly";
import { HEATMAP_PREVIEW_PARAM } from "@/lib/analytics/constants";
import type { AnalyticsEventRow, AnalyticsSession } from "@/lib/analytics/types";
import { Button } from "@/components/shadcn/button";

function sessionViewport(session: AnalyticsSession) {
  return {
    w: Math.max(session.viewport_w, 1),
    h: Math.max(session.viewport_h, 1),
  };
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
  const view = sessionViewport(session);
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

  function postScroll(scrollY: number) {
    const frame = frameRef.current?.contentWindow;
    if (!frame) return;
    frame.postMessage({ type: "heatmap-scroll", scrollY }, siteUrl);
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
      setCursor({
        x: current.x,
        y: current.y - current.scroll_y,
        visible: true,
        click: current.type === "click",
      });
    }
    postScroll(current.scroll_y);
    postInputs(typedValues);
  }, [current, siteUrl, typedValues]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as { type?: string } | null;
      if (!data || data.type !== "heatmap-ready") return;
      if (current) postScroll(current.scroll_y);
      postInputs(typedValues);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [current, typedValues, siteUrl]);

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

  const finalTypedEntries = useMemo(() => {
    const values: Record<string, string> = {};
    for (const event of events) {
      if (event.type === "input" && event.field) {
        values[event.field] = event.value ?? "";
      }
    }
    return Object.entries(values);
  }, [events]);

  return (
    <div className="space-y-3">
      <HeatmapDesktopOnly
        title="Replay on desktop"
        body="The visual session replay is desktop-only. Form text from this session is still listed below."
      >
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

        <div className="mt-3 flex flex-wrap items-center gap-2">
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
      </HeatmapDesktopOnly>

      <div className="rounded-lg border border-border p-3">
        <p className="text-sm font-medium">Typed in form</p>
        {finalTypedEntries.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Nothing typed in this session.
          </p>
        ) : (
          <dl className="mt-2 space-y-1.5 text-sm">
            {finalTypedEntries.map(([field, value]) => (
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
