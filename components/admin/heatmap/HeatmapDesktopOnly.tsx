"use client";

import { useEffect, useState, type ReactNode } from "react";
import { HeatmapEmptyState } from "@/components/admin/heatmap/HeatmapLegend";

/**
 * Heatmap preview/replay mounts iframes and canvases that can OOM mobile
 * browsers. Keep those trees unmounted below the md breakpoint.
 */
export function HeatmapDesktopOnly({
  children,
  title = "Preview on desktop",
  body = "The visual heatmap preview is desktop-only. Filters, stats and sessions stay available here.",
}: {
  children: ReactNode;
  title?: string;
  body?: string;
}) {
  const [desktop, setDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (desktop === null) {
    return <div className="min-h-24" aria-hidden="true" />;
  }

  if (!desktop) {
    return <HeatmapEmptyState title={title} body={body} />;
  }

  return <>{children}</>;
}
