"use client";

import { useEffect } from "react";
import { parseLandingAttribution } from "@/lib/attribution/classify";
import { captureLandingAttribution } from "@/lib/attribution/storage";

/**
 * Persists marketing touch (UTM / referrer) into localStorage for the booking
 * form. Does not send beacons or store visitor identifiers server-side.
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
