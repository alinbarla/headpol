"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import type { HeatmapDevice, HeatmapRange } from "@/lib/analytics/types";

export function HeatmapFilters({
  page,
  pages,
  range,
  device,
  mode,
}: {
  page: string;
  pages: string[];
  range: HeatmapRange;
  device: HeatmapDevice | "all";
  mode: string;
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
    router.replace(`/admin/heatmap?${search.toString()}`);
  }

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <Select value={page} onValueChange={(value) => replace({ page: value })}>
        <SelectTrigger className="sm:w-56" aria-label="Page">
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
    </div>
  );
}
