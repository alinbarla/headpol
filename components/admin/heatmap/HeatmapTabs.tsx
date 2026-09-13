"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  HeatmapDevice,
  HeatmapMode,
  HeatmapRange,
  SessionListOrder,
} from "@/lib/analytics/types";

const TABS: Array<{ mode: HeatmapMode; label: string }> = [
  { mode: "click", label: "Clicks" },
  { mode: "move", label: "Mouse" },
  { mode: "scroll", label: "Scroll" },
  { mode: "attention", label: "Attention" },
];

export function HeatmapTabs({
  page,
  range,
  device,
  mode,
  order = "newest",
  includeMine = false,
}: {
  page: string;
  range: HeatmapRange;
  device: HeatmapDevice | "all";
  mode: HeatmapMode;
  order?: SessionListOrder;
  includeMine?: boolean;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-1 rounded-lg bg-muted p-1">
      {TABS.map((tab) => {
        const search = new URLSearchParams({
          page,
          range,
          device,
          mode: tab.mode,
        });
        if (order !== "newest") search.set("order", order);
        if (includeMine) search.set("includeMine", "1");
        const active = tab.mode === mode;
        return (
          <Link
            key={tab.mode}
            href={`/admin/heatmap?${search.toString()}`}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm",
              active
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
