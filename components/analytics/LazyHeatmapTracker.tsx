"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const HeatmapTracker = dynamic(
  () =>
    import("@/components/analytics/HeatmapTracker").then((m) => ({
      default: m.HeatmapTracker,
    })),
  { ssr: false }
);

/**
 * Idle-loads heatmap JS from the first landing. First-party collection is not
 * gated on the Analys cookie checkbox (that toggle is cosmetic for GTM only).
 */
export function LazyHeatmapTracker() {
  const [idleReady, setIdleReady] = useState(false);

  useEffect(() => {
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
  }, []);

  if (!idleReady) return null;
  return <HeatmapTracker />;
}
