"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  HEATMAP_PREVIEW_PARAM,
  SESSION_STORAGE_KEY,
  VISITOR_STORAGE_KEY,
} from "@/lib/analytics/constants";
import { deviceFromViewport } from "@/lib/analytics/device";
import { parseLandingAttribution } from "@/lib/attribution/classify";
import {
  attributionForBookingPost,
  captureLandingAttribution,
} from "@/lib/attribution/storage";

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const r = (Math.random() * 16) | 0;
    const v = char === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
    const uuid = randomId();
    sessionStorage.setItem(SESSION_STORAGE_KEY, uuid);
    return uuid;
  } catch {
    return randomId();
  }
}

function referrerPath(): string | null {
  if (!document.referrer) return null;
  try {
    return new URL(document.referrer).pathname;
  } catch {
    return null;
  }
}

function sendVisitBeacon() {
  const doc = document.documentElement;
  const visual = window.visualViewport;
  const body = JSON.stringify({
    sessionId: readOrCreateSessionId(),
    visitorId: readOrCreateVisitorId(),
    page: window.location.pathname || "/",
    referrer: referrerPath(),
    viewportW: Math.max(1, Math.round(visual?.width || window.innerWidth || 1)),
    viewportH: Math.max(1, Math.round(visual?.height || window.innerHeight || 1)),
    documentH: Math.max(doc.scrollHeight, doc.offsetHeight, 1),
    device: deviceFromViewport(),
    attribution: attributionForBookingPost(),
  });

  void fetch("/api/hp/visit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Visit logging must never break the public site.
  });
}

/**
 * Stores marketing touch in localStorage for bookings and sends visit beacons
 * (Visitors / Channels) from the first landing — not gated on Analys consent.
 */
export function AttributionCapture() {
  const pathname = usePathname();

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
      sendVisitBeacon();
    } catch {
      // Never block the page for attribution failures.
    }
  }, [pathname]);

  return null;
}
