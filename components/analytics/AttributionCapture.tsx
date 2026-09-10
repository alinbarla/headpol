"use client";

import { useEffect } from "react";
import {
  HEATMAP_PREVIEW_PARAM,
  SESSION_STORAGE_KEY,
  VISITOR_STORAGE_KEY,
} from "@/lib/analytics/constants";
import type { HeatmapDevice } from "@/lib/analytics/types";
import { parseLandingAttribution } from "@/lib/attribution/classify";
import {
  attributionForBookingPost,
  captureLandingAttribution,
} from "@/lib/attribution/storage";

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `hp_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function readOrCreateVisitorId(): string {
  try {
    const existing = sessionStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing) return existing;
    const next = randomId();
    sessionStorage.setItem(VISITOR_STORAGE_KEY, next);
    return next;
  } catch {
    return randomId();
  }
}

function readOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (
      existing &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        existing
      )
    ) {
      return existing;
    }
    const uuid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
            const r = (Math.random() * 16) | 0;
            const v = char === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
    sessionStorage.setItem(SESSION_STORAGE_KEY, uuid);
    return uuid;
  } catch {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : "00000000-0000-4000-8000-000000000001";
  }
}

function deviceFromViewport(): HeatmapDevice {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function referrerPath(): string | null {
  if (!document.referrer) return null;
  try {
    return new URL(document.referrer).pathname;
  } catch {
    return null;
  }
}

/**
 * Captures marketing touch into localStorage and records a visit (device, IP
 * via server, traffic source) when Heatmap collection is enabled.
 */
export function AttributionCapture() {
  useEffect(() => {
    try {
      if (
        new URLSearchParams(window.location.search).get(HEATMAP_PREVIEW_PARAM) ===
        "1"
      ) {
        return;
      }

      const siteHost = window.location.hostname;
      const input = parseLandingAttribution({
        href: window.location.href,
        referrer: document.referrer || "",
        siteHost,
      });
      captureLandingAttribution(input);

      const doc = document.documentElement;
      const visual = window.visualViewport;
      const body = JSON.stringify({
        sessionId: readOrCreateSessionId(),
        visitorId: readOrCreateVisitorId(),
        page: window.location.pathname || "/",
        referrer: referrerPath(),
        viewportW: Math.round(visual?.width ?? window.innerWidth),
        viewportH: Math.round(visual?.height ?? window.innerHeight),
        documentH: Math.max(doc.scrollHeight, doc.offsetHeight, 1),
        device: deviceFromViewport(),
        attribution: attributionForBookingPost(),
      });

      void fetch("/api/analytics/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        // Visit logging must never break the public site.
      });
    } catch {
      // Never block the page for attribution failures.
    }
  }, []);

  return null;
}
