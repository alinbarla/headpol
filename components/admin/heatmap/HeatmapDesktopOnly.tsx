"use client";

import { useEffect, useState, type ReactNode } from "react";
import { HeatmapEmptyState } from "@/components/admin/heatmap/HeatmapLegend";

/**
 * Heatmap preview/replay mounts iframes and canvases that can OOM mobile
 * browsers. Keep those trees unmounted below the md breakpoint.
 */
export function HeatmapDesktopOnly({
  children,
  title = "Desktop only",
  body = "Open heatmap on a computer. It is hidden on phones to keep the browser stable.",
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
    return <div className="mt-6 min-h-40" aria-hidden="true" />;
  }

  if (!desktop) {
    return (
      <div className="mt-6">
        <HeatmapEmptyState title={title} body={body} />
      </div>
    );
  }

  return <>{children}</>;
}
