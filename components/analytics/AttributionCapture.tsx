"use client";

import { useEffect } from "react";
import { parseLandingAttribution } from "@/lib/attribution/classify";
import { captureLandingAttribution } from "@/lib/attribution/storage";

/**
 * Captures marketing touch (UTM / gclid / referrer) into localStorage on each
 * public page view. Mount once in the locale layout.
 */
export function AttributionCapture() {
  useEffect(() => {
    try {
      const siteHost = window.location.hostname;
      const input = parseLandingAttribution({
        href: window.location.href,
        referrer: document.referrer || "",
        siteHost,
      });
      captureLandingAttribution(input);
    } catch {
      // Never block the page for attribution failures.
    }
  }, []);

  return null;
}
