import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { buildHeatmapGrid } from "@/lib/analytics/aggregate";
import { RANGE_MS } from "@/lib/analytics/constants";
import { getAnalyticsSettings } from "@/lib/analytics/settings";
import { buildScrollDepth } from "@/lib/analytics/scrollStats";
import {
  countEventsSince,
  listEventsForGrid,
  listRecentSessions,
  listSessionScrolls,
  listTrackedPages,
} from "@/lib/analytics/store";
import type {
  HeatmapDevice,
  HeatmapMode,
  HeatmapRange,
} from "@/lib/analytics/types";
import { SITE_URL } from "@/lib/seo";
import { AdminShell } from "@/components/admin/AdminShell";
import { HeatmapEmptyState, HeatmapLegend } from "@/components/admin/heatmap/HeatmapLegend";
import { HeatmapFilters } from "@/components/admin/heatmap/HeatmapFilters";
import { HeatmapTabs } from "@/components/admin/heatmap/HeatmapTabs";
import { HeatmapViewer } from "@/components/admin/heatmap/HeatmapViewer";
import { ScrollDepthChart } from "@/components/admin/heatmap/ScrollDepthChart";
import { SessionTable } from "@/components/admin/heatmap/SessionTable";
import { Button } from "@/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseRange(value: string | undefined): HeatmapRange {
  if (value === "24h" || value === "7d" || value === "30d") return value;
  return "7d";
}

function parseDevice(value: string | undefined): HeatmapDevice | "all" {
  if (value === "mobile" || value === "tablet" || value === "desktop") return value;
  return "all";
}

function parseMode(value: string | undefined): HeatmapMode {
  if (
    value === "click" ||
    value === "move" ||
    value === "scroll" ||
    value === "attention"
  ) {
    return value;
  }
  return "click";
}

export default async function HeatmapPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await searchParams;
  const settings = await getAnalyticsSettings();

  const range = parseRange(readParam(params, "range"));
  const device = parseDevice(readParam(params, "device"));
  const mode = parseMode(readParam(params, "mode"));
  const fromIso = new Date(Date.now() - RANGE_MS[range]).toISOString();

  const pages = await listTrackedPages(fromIso).catch(() => []);
  const page = readParam(params, "page") ?? pages[0] ?? "/";

  const [sessions, scrolls, eventCount] = await Promise.all([
    listRecentSessions({ page, fromIso, device }).catch(() => []),
    listSessionScrolls({ page, fromIso, device }).catch(() => []),
    countEventsSince(fromIso).catch(() => 0),
  ]);

  const gridType = mode === "scroll" ? "click" : mode;
  const gridRows =
    mode === "scroll"
      ? []
      : await listEventsForGrid({
          page,
          type: gridType,
          fromIso,
          device,
        }).catch(() => []);

  const grid = buildHeatmapGrid(gridRows, mode === "attention");
  const depth = buildScrollDepth(scrolls);

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold">Heatmap</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Clicks, cursor movement, scroll depth and attention on the public site.
      </p>

      {!settings.enabled ? (
        <div className="mt-6">
          <HeatmapEmptyState
            title="Collection is off"
            body="Turn on heatmap collection in Settings to start recording anonymous interaction events."
          />
          <Button asChild className="mt-4">
            <Link href="/admin/settings">Open settings</Link>
          </Button>
        </div>
      ) : (
        <>
          <HeatmapFilters
            page={page}
            pages={pages.length > 0 ? pages : [page]}
            range={range}
            device={device}
            mode={mode}
          />
          <HeatmapTabs page={page} range={range} device={device} mode={mode} />

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatCard label="Events in range" value={String(eventCount)} />
            <StatCard label="Sessions on this page" value={String(sessions.length)} />
            <StatCard
              label="Grid points"
              value={mode === "scroll" ? "—" : String(grid.eventCount)}
            />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">
                {mode === "click"
                  ? "Click heatmap"
                  : mode === "move"
                    ? "Mouse-movement heatmap"
                    : mode === "attention"
                      ? "Attention heatmap"
                      : "Scroll depth"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mode === "scroll" ? (
                scrolls.length === 0 ? (
                  <HeatmapEmptyState
                    title="No events yet"
                    body="Browse the public site after enabling collection to fill this chart."
                  />
                ) : (
                  <ScrollDepthChart bins={depth} />
                )
              ) : grid.cells.length === 0 ? (
                <HeatmapEmptyState
                  title="No events yet"
                  body="Interact with the public site, then refresh this page."
                />
              ) : (
                <>
                  <HeatmapViewer
                    siteUrl={SITE_URL}
                    page={page}
                    cells={grid.cells}
                    maxCount={grid.maxCount}
                    sourceWidth={grid.viewportW || 1200}
                    sourceHeight={grid.documentH || 2000}
                  />
                  <HeatmapLegend />
                </>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Recent sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <SessionTable sessions={sessions} />
            </CardContent>
          </Card>
        </>
      )}
    </AdminShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
