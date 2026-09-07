"use client";

import { useEffect } from "react";
import {
  ATTENTION_MIN_DWELL_MS,
  BATCH_SIZE,
  FLUSH_INTERVAL_MS,
  HEATMAP_PREVIEW_PARAM,
  MAX_INPUT_FIELD_LENGTH,
  MAX_INPUT_VALUE_LENGTH,
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

const SKIPPED_INPUT_TYPES = new Set([
  "password",
  "hidden",
  "file",
  "button",
  "submit",
  "reset",
  "image",
]);

function fieldKey(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string | null {
  const raw = (el.name || el.id || "").trim();
  if (!raw || raw.length > MAX_INPUT_FIELD_LENGTH) return null;
  if (!/^[\w.:#-]+$/.test(raw)) return null;
  return raw;
}

function shouldRecordField(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
): boolean {
  if (el.closest("[data-no-track]")) return false;
  if (el instanceof HTMLInputElement) {
    if (SKIPPED_INPUT_TYPES.has(el.type)) return false;
    const autocomplete = (el.autocomplete || "").toLowerCase();
    if (
      autocomplete.includes("cc-") ||
      autocomplete.includes("password") ||
      autocomplete === "new-password" ||
      autocomplete === "current-password"
    ) {
      return false;
    }
  }
  return fieldKey(el) !== null;
}

function fieldValue(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
): string {
  if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
    return el.checked ? el.value || "true" : "";
  }
  return el.value.slice(0, MAX_INPUT_VALUE_LENGTH);
}

function formControls(): Array<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
> {
  return [
    ...document.querySelectorAll("input, textarea, select"),
  ].filter(
    (node): node is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
      node instanceof HTMLInputElement ||
      node instanceof HTMLTextAreaElement ||
      node instanceof HTMLSelectElement
  );
}

function layoutScrollY(): number {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

function pointFromEvent(event: MouseEvent | PointerEvent) {
  const size = metrics();
  const pageX = Number.isFinite(event.pageX) ? event.pageX : event.clientX + size.scrollX;
  const pageY = Number.isFinite(event.pageY) ? event.pageY : event.clientY + size.scrollY;
  return { x: pageX, y: pageY, scrollY: size.scrollY };
}

function metrics() {
  const doc = document.documentElement;
  const visual = window.visualViewport;
  return {
    viewportW: Math.round(visual?.width ?? window.innerWidth),
    viewportH: Math.round(visual?.height ?? window.innerHeight),
    documentH: Math.max(doc.scrollHeight, doc.offsetHeight, 1),
    scrollX: window.scrollX || doc.scrollLeft || 0,
    scrollY: layoutScrollY(),
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
    const queue: UserEvent[] = [];
    let lastMove = 0;
    let lastScroll = 0;
    const lastValues = new Map<string, string>();
    let attentionCell: { gx: number; gy: number; x: number; y: number; since: number } | null =
      null;
    let flushTimer: number | undefined;
    let pollTimer: number | undefined;
    let autofillStyle: HTMLStyleElement | null = null;
    let sessionId = "";
    let visitorId = "";
    // Touch move streams during scroll can OOM low-memory mobile browsers.
    const coarsePointer =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
    const moveSampleMs = coarsePointer ? MOVE_SAMPLE_MS * 4 : MOVE_SAMPLE_MS;
    const maxQueue = BATCH_SIZE * 4;

    function flush(beacon = false) {
      if (queue.length === 0) return;
      const batch = queue.splice(0, BATCH_SIZE);
      sendBatch(sessionId, visitorId, batch, beacon);
      if (queue.length > 0) sendBatch(sessionId, visitorId, queue.splice(0, BATCH_SIZE), beacon);
    }

    function push(event: UserEvent) {
      if (queue.length >= maxQueue) {
        // Drop oldest non-click noise first so taps still flush.
        const dropAt = queue.findIndex((item) => item.type === "move" || item.type === "attention");
        queue.splice(dropAt >= 0 ? dropAt : 0, 1);
      }
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

    function emitField(
      el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    ) {
      if (!shouldRecordField(el)) return;
      const field = fieldKey(el);
      if (!field) return;
      const value = fieldValue(el);
      if (lastValues.get(field) === value) return;
      lastValues.set(field, value);
      push({
        type: "input",
        field,
        value,
        timestamp: Date.now(),
      });
    }

    function snapshotFields() {
      for (const el of formControls()) emitField(el);
    }

    function onPointerMove(event: PointerEvent) {
      // Finger-drag on phones is scroll, not a cursor path — skip to avoid
      // flooding the queue and crashing low-memory browsers on long pages.
      if (event.pointerType === "touch" || coarsePointer) return;

      const now = Date.now();
      const point = pointFromEvent(event);
      const gx = Math.floor(point.x / 50);
      const gy = Math.floor(point.y / 50);

      if (!attentionCell || attentionCell.gx !== gx || attentionCell.gy !== gy) {
        flushAttention(now);
        attentionCell = { gx, gy, x: point.x, y: point.y, since: now };
      }

      if (now - lastMove < moveSampleMs) return;
      lastMove = now;
      push({
        type: "move",
        x: point.x,
        y: point.y,
        scrollY: point.scrollY,
        timestamp: now,
      });
    }

    let lastTap = 0;

    function recordTap(x: number, y: number, scrollY: number) {
      lastTap = Date.now();
      push({
        type: "click",
        x,
        y,
        scrollY,
        timestamp: lastTap,
      });
      window.setTimeout(snapshotFields, 0);
      window.setTimeout(snapshotFields, 50);
      window.setTimeout(snapshotFields, 200);
    }

    function onPointerUp(event: PointerEvent) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const point = pointFromEvent(event);
      recordTap(point.x, point.y, point.scrollY);
    }

    function onClick(event: MouseEvent) {
      if (event.button !== 0) return;
      if (Date.now() - lastTap < 450) return;
      const point = pointFromEvent(event);
      recordTap(point.x, point.y, point.scrollY);
    }

    function onScroll() {
      const now = Date.now();
      if (now - lastScroll < 200) return;
      lastScroll = now;
      push({
        type: "scroll",
        scrollY: layoutScrollY(),
        timestamp: now,
      });
    }

    function onInput() {
      snapshotFields();
    }

    function onAutofillStart(event: AnimationEvent) {
      if (event.animationName !== "hp-autofill") return;
      snapshotFields();
      window.setTimeout(snapshotFields, 30);
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

        autofillStyle = document.createElement("style");
        autofillStyle.dataset.heatmapAutofill = "1";
        autofillStyle.textContent =
          "@keyframes hp-autofill{from{opacity:.99}to{opacity:1}}input:-webkit-autofill,textarea:-webkit-autofill,select:-webkit-autofill{animation-name:hp-autofill;animation-duration:.001s}";
        document.head.append(autofillStyle);

        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("pointerup", onPointerUp, { capture: true });
        window.addEventListener("click", onClick, { capture: true });
        window.addEventListener("scroll", onScroll, { passive: true });
        window.visualViewport?.addEventListener("scroll", onScroll);
        window.visualViewport?.addEventListener("resize", onScroll);
        document.addEventListener("input", onInput, true);
        document.addEventListener("change", onInput, true);
        document.addEventListener("focusin", snapshotFields, true);
        document.addEventListener("focusout", snapshotFields, true);
        document.addEventListener("animationstart", onAutofillStart, true);
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("pagehide", onHidden);

        snapshotFields();
        flushTimer = window.setInterval(() => flush(false), FLUSH_INTERVAL_MS);
        // Autofill polling is cheaper on a longer interval for phones.
        pollTimer = window.setInterval(snapshotFields, coarsePointer ? 1200 : 400);
      })
      .catch(() => {
        // Stay silent if the config endpoint is down.
      });

    return () => {
      cancelled = true;
      window.clearInterval(flushTimer);
      window.clearInterval(pollTimer);
      autofillStyle?.remove();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp, true);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll);
      window.visualViewport?.removeEventListener("scroll", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("change", onInput, true);
      document.removeEventListener("focusin", snapshotFields, true);
      document.removeEventListener("focusout", snapshotFields, true);
      document.removeEventListener("animationstart", onAutofillStart, true);
      window.removeEventListener("pagehide", onHidden);
      if (sessionId) {
        flushAttention(Date.now());
        flush(true);
      }
    };
  }, []);

  return null;
}
