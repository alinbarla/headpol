"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  allowsFirstPartyAnalytics,
  CONSENT_UPDATED_EVENT,
  readStoredPrefs,
} from "@/lib/analytics/consent";

const HeatmapTracker = dynamic(
  () =>
    import("@/components/analytics/HeatmapTracker").then((m) => ({
      default: m.HeatmapTracker,
    })),
  { ssr: false }
);

/**
 * Idle-loads heatmap JS only after the visitor grants Analys in the cookie
 * banner. Without that checkbox, no sessions/events are collected.
 */
export function LazyHeatmapTracker() {
  const [allowed, setAllowed] = useState(false);
  const [idleReady, setIdleReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      const next = allowsFirstPartyAnalytics(readStoredPrefs());
      setAllowed(next);
      if (!next) setIdleReady(false);
    };
    const frame = requestAnimationFrame(sync);
    window.addEventListener(CONSENT_UPDATED_EVENT, sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(CONSENT_UPDATED_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    if (!allowed) return;

    let idleId: number | undefined;
    let timeoutId: number | undefined;
    let cancelled = false;

    const enable = () => {
      if (!cancelled) setIdleReady(true);
    };

    const schedule = () => {
      const ric = window.requestIdleCallback;
      if (typeof ric === "function") {
        idleId = ric(() => enable(), { timeout: 3000 });
      } else {
        timeoutId = window.setTimeout(enable, 3000);
      }
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [allowed]);

  if (!allowed || !idleReady) return null;
  return <HeatmapTracker />;
}
