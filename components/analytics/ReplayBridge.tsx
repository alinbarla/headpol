"use client";

import { useEffect } from "react";
import { HEATMAP_PREVIEW_PARAM } from "@/lib/analytics/constants";

type ReadyMessage = {
  type: "heatmap-ready";
  documentH: number;
  viewportW: number;
  viewportH: number;
};

type ScrollMessage = {
  type: "heatmap-scroll";
  scrollY: number;
};

function isScrollMessage(value: unknown): value is ScrollMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return message.type === "heatmap-scroll" && typeof message.scrollY === "number";
}

export function ReplayBridge({ adminOrigins }: { adminOrigins: string[] }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;
    if (new URLSearchParams(window.location.search).get(HEATMAP_PREVIEW_PARAM) !== "1") {
      return;
    }

    const allowed = new Set(adminOrigins);
    const doc = document.documentElement;

    const ready: ReadyMessage = {
      type: "heatmap-ready",
      documentH: Math.max(doc.scrollHeight, doc.offsetHeight, 1),
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
    };

    for (const origin of adminOrigins) {
      window.parent.postMessage(ready, origin);
    }

    function onMessage(event: MessageEvent) {
      if (!allowed.has(event.origin)) return;
      if (!isScrollMessage(event.data)) return;
      window.scrollTo({ top: Math.max(0, event.data.scrollY), behavior: "auto" });
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [adminOrigins]);

  return null;
}
