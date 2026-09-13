"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import type {
  HeatmapDevice,
  HeatmapRange,
  SessionListOrder,
} from "@/lib/analytics/types";

export function HeatmapFilters({
  page,
  pages,
  range,
  device,
  mode,
  order = "newest",
  includeMine = false,
}: {
  page: string;
  pages: string[];
  range: HeatmapRange;
  device: HeatmapDevice | "all";
  mode: string;
  /** Kept so page/range/device changes preserve the session-list order. */
  order?: SessionListOrder;
  includeMine?: boolean;
}) {
  const router = useRouter();
  const options = pages.includes(page) ? pages : [page, ...pages];

  function replace(next: {
    page?: string;
    range?: string;
    device?: string;
  }) {
    const search = new URLSearchParams();
    search.set("page", next.page ?? page);
    search.set("range", next.range ?? range);
    search.set("device", next.device ?? device);
    search.set("mode", mode);
    if (order !== "newest") search.set("order", order);
    if (includeMine) search.set("includeMine", "1");
    router.replace(`/admin/heatmap?${search.toString()}`);
  }

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <Select value={page} onValueChange={(value) => replace({ page: value })}>
        <SelectTrigger className="sm:w-56" aria-label="Heatmap page">
          <SelectValue placeholder="Page" />
        </SelectTrigger>
        <SelectContent>
          {options.map((path) => (
            <SelectItem key={path} value={path}>
              {path}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={range} onValueChange={(value) => replace({ range: value })}>
        <SelectTrigger className="sm:w-36" aria-label="Range">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="24h">Last 24 hours</SelectItem>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
        </SelectContent>
      </Select>

      <Select value={device} onValueChange={(value) => replace({ device: value })}>
        <SelectTrigger className="sm:w-36" aria-label="Device">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All devices</SelectItem>
          <SelectItem value="desktop">Desktop</SelectItem>
          <SelectItem value="tablet">Tablet</SelectItem>
          <SelectItem value="mobile">Mobile</SelectItem>
        </SelectContent>
      </Select>
      <p className="w-full text-xs text-muted-foreground sm:pl-0.5">
        Page filter applies to the heatmap grid. Session list includes every
        visit in range for the device filter.
      </p>
    </div>
  );
}
