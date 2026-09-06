"use client";

import { useEffect } from "react";
import {
  ATTENTION_MIN_DWELL_MS,
  BATCH_SIZE,
  FLUSH_INTERVAL_MS,
  HEATMAP_PREVIEW_PARAM,
  MOVE_SAMPLE_MS,
  SAMPLE_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  VISITOR_STORAGE_KEY,
} from "@/lib/analytics/constants";
import type { AnalyticsConfig, HeatmapDevice, UserEvent } from "@/lib/analytics/types";

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `hp_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function readOrCreate(key: string): string {
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const next = randomId();
    sessionStorage.setItem(key, next);
    return next;
  } catch {
    return randomId();
  }
}

function deviceFromViewport(): HeatmapDevice {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function shouldSkipTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest("input, textarea, select, [contenteditable='true'], [data-no-track]")
  );
}

function metrics() {
  const doc = document.documentElement;
  return {
    viewportW: window.innerWidth,
    viewportH: window.innerHeight,
    documentH: Math.max(doc.scrollHeight, doc.offsetHeight, 1),
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  };
}

function pagePath(): string {
  return window.location.pathname || "/";
}

function referrerPath(): string | null {
  if (!document.referrer) return null;
  try {
    return new URL(document.referrer).pathname;
  } catch {
    return null;
  }
}

function passedSample(sampleRate: number): boolean {
  if (sampleRate >= 1) return true;
  if (sampleRate <= 0) return false;
  try {
    const stored = sessionStorage.getItem(SAMPLE_STORAGE_KEY);
    if (stored === "1") return true;
    if (stored === "0") return false;
    const pass = Math.random() < sampleRate;
    sessionStorage.setItem(SAMPLE_STORAGE_KEY, pass ? "1" : "0");
    return pass;
  } catch {
    return Math.random() < sampleRate;
  }
}

function sendBatch(
  sessionId: string,
  visitorId: string,
  events: UserEvent[],
  beacon: boolean
): void {
  if (events.length === 0) return;

  const size = metrics();
  const body = JSON.stringify({
    sessionId,
    visitorId,
    page: pagePath(),
    referrer: referrerPath(),
    viewportW: size.viewportW,
    viewportH: size.viewportH,
    documentH: size.documentH,
    device: deviceFromViewport(),
    events,
  });

  if (beacon && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "text/plain" });
    navigator.sendBeacon("/api/analytics/events", blob);
    return;
  }

  void fetch("/api/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Collection must never break the public site.
  });
}

export function HeatmapTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get(HEATMAP_PREVIEW_PARAM) === "1") {
      return;
    }

    let cancelled = false;
    let queue: UserEvent[] = [];
    let lastMove = 0;
    let lastScroll = 0;
    let attentionCell: { gx: number; gy: number; x: number; y: number; since: number } | null =
      null;
    let flushTimer: number | undefined;
    let sessionId = "";
    let visitorId = "";

    function flush(beacon = false) {
      if (queue.length === 0) return;
      const batch = queue.splice(0, BATCH_SIZE);
      sendBatch(sessionId, visitorId, batch, beacon);
      if (queue.length > 0) sendBatch(sessionId, visitorId, queue.splice(0, BATCH_SIZE), beacon);
    }

    function push(event: UserEvent) {
      queue.push(event);
      if (queue.length >= BATCH_SIZE) flush(false);
    }

    function flushAttention(now: number) {
      if (!attentionCell) return;
      const dwell = now - attentionCell.since;
      if (dwell >= ATTENTION_MIN_DWELL_MS) {
        const size = metrics();
        push({
          type: "attention",
          x: attentionCell.x,
          y: attentionCell.y,
          scrollY: size.scrollY,
          dwellMs: dwell,
          timestamp: now,
        });
      }
      attentionCell = null;
    }

    function onPointerMove(event: PointerEvent) {
      const now = Date.now();
      const size = metrics();
      const x = event.clientX + size.scrollX;
      const y = event.clientY + size.scrollY;
      const gx = Math.floor(x / 50);
      const gy = Math.floor(y / 50);

      if (!attentionCell || attentionCell.gx !== gx || attentionCell.gy !== gy) {
        flushAttention(now);
        attentionCell = { gx, gy, x, y, since: now };
      }

      if (now - lastMove < MOVE_SAMPLE_MS) return;
      lastMove = now;
      push({ type: "move", x, y, scrollY: size.scrollY, timestamp: now });
    }

    function onClick(event: MouseEvent) {
      if (event.button !== 0) return;
      if (shouldSkipTarget(event.target)) return;
      const size = metrics();
      push({
        type: "click",
        x: event.clientX + size.scrollX,
        y: event.clientY + size.scrollY,
        scrollY: size.scrollY,
        timestamp: Date.now(),
      });
    }

    function onScroll() {
      const now = Date.now();
      if (now - lastScroll < 200) return;
      lastScroll = now;
      push({
        type: "scroll",
        scrollY: window.scrollY,
        timestamp: now,
      });
    }

    function onHidden() {
      flushAttention(Date.now());
      flush(true);
    }

    void fetch("/api/analytics/config")
      .then((response) => (response.ok ? response.json() : null))
      .then((config: AnalyticsConfig | null) => {
        if (cancelled || !config?.enabled) return;
        if (!passedSample(config.sampleRate)) return;

        visitorId = readOrCreate(VISITOR_STORAGE_KEY);
        sessionId = readOrCreate(SESSION_STORAGE_KEY);

        function onVisibility() {
          if (document.visibilityState === "hidden") onHidden();
        }

        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("click", onClick, { capture: true });
        window.addEventListener("scroll", onScroll, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("pagehide", onHidden);

        flushTimer = window.setInterval(() => flush(false), FLUSH_INTERVAL_MS);
      })
      .catch(() => {
        // Stay silent if the config endpoint is down.
      });

    return () => {
      cancelled = true;
      window.clearInterval(flushTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onHidden);
      if (sessionId) {
        flushAttention(Date.now());
        flush(true);
      }
    };
  }, []);

  return null;
}
