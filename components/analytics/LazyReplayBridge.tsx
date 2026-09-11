"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { HEATMAP_PREVIEW_PARAM } from "@/lib/analytics/constants";

const ReplayBridge = dynamic(
  () =>
    import("@/components/analytics/ReplayBridge").then((m) => ({
      default: m.ReplayBridge,
    })),
  { ssr: false }
);

/** Only load replay bridge when embedded preview mode is active. */
export function LazyReplayBridge({ adminOrigins }: { adminOrigins: string[] }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;
    if (new URLSearchParams(window.location.search).get(HEATMAP_PREVIEW_PARAM) !== "1") {
      return;
    }
    setActive(true);
  }, []);

  if (!active) return null;
  return <ReplayBridge adminOrigins={adminOrigins} />;
}
