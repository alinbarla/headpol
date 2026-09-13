import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { RANGE_MS } from "@/lib/analytics/constants";
import { getAnalyticsSettings } from "@/lib/analytics/settings";
import {
  countVisitors,
  listVisitorChartRows,
  listVisitors,
} from "@/lib/analytics/store";
import { VisitorCharts } from "@/components/admin/VisitorCharts";
import {
  parseSessionListOrder,
  type HeatmapDevice,
  type HeatmapRange,
  type SessionListOrder,
} from "@/lib/analytics/types";
import { ACQUISITION_LABELS } from "@/lib/admin/labels";
import type { AcquisitionChannel } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { CsvDownloadButton } from "@/components/admin/CsvDownloadButton";
import RecordsTable from "@/components/ui/records-table";
import {
  SESSION_STRENGTH_LABELS,
  sessionCsvRows,
  visitorToRecord,
} from "@/lib/admin/recordsRows";
import { Button } from "@/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { IncludeOwnIpCheckbox } from "@/components/admin/IncludeOwnIpCheckbox";
import { SessionOrderSelect } from "@/components/admin/SessionOrderSelect";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

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

function parseChannel(
  value: string | undefined
): AcquisitionChannel | "all" {
  if (
    value === "google_ads" ||
    value === "organic_search" ||
    value === "direct" ||
    value === "referral" ||
    value === "unknown"
  ) {
    return value;
  }
  return "all";
}

function parsePage(value: string | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function hrefFor(opts: {
  range: HeatmapRange;
  device: HeatmapDevice | "all";
  channel: AcquisitionChannel | "all";
  order: SessionListOrder;
  includeMine?: boolean;
  page?: number;
}): string {
  const search = new URLSearchParams();
  search.set("range", opts.range);
  if (opts.device !== "all") search.set("device", opts.device);
  if (opts.channel !== "all") search.set("channel", opts.channel);
  if (opts.order !== "newest") search.set("order", opts.order);
  if (opts.includeMine) search.set("includeMine", "1");
  if (opts.page && opts.page > 1) search.set("page", String(opts.page));
  return `/admin/visitors?${search.toString()}`;
}

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await searchParams;
  const settings = await getAnalyticsSettings();

  const range = parseRange(readParam(params, "range"));
  const device = parseDevice(readParam(params, "device"));
  const channel = parseChannel(readParam(params, "channel"));
  const order = parseSessionListOrder(readParam(params, "order"));
  const includeMine = readParam(params, "includeMine") === "1";
  const page = parsePage(readParam(params, "page"));
  const fromIso = new Date(Date.now() - RANGE_MS[range]).toISOString();
  const offset = (page - 1) * PAGE_SIZE;

  let visitors: Awaited<ReturnType<typeof listVisitors>> = [];
  let total = 0;
  let chartRows: Awaited<ReturnType<typeof listVisitorChartRows>> = [];
  let loadError: string | null = null;

  try {
    [visitors, total, chartRows] = await Promise.all([
      listVisitors({
        fromIso,
        device,
        channel,
        order,
        includeExcludedIps: includeMine,
        limit: PAGE_SIZE,
        offset,
      }),
      countVisitors({ fromIso, device, channel, includeExcludedIps: includeMine }),
      listVisitorChartRows({ fromIso, device, channel, includeExcludedIps: includeMine }),
    ]);
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load visitors";
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Visitors</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every recorded visit with device, IP and traffic source. Uses the
            same Heatmap collection switch in Settings
            {settings.enabled ? " (collection on)" : " (collection off)"}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CsvDownloadButton
            filename="visitors.csv"
            rows={sessionCsvRows(visitors)}
          />
          {!settings.enabled && (
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/settings">Enable in Settings</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["24h", "7d", "30d"] as const).map((value) => (
          <Link
            key={value}
            href={hrefFor({ range: value, device, channel, order, includeMine })}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs",
              range === value
                ? "border-primary bg-secondary text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {value}
          </Link>
        ))}
        <span className="mx-1 self-center text-border">|</span>
        {(["all", "desktop", "tablet", "mobile"] as const).map((value) => (
          <Link
            key={value}
            href={hrefFor({ range, device: value, channel, order, includeMine })}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs capitalize",
              device === value
                ? "border-primary bg-secondary text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {value}
          </Link>
        ))}
        <span className="mx-1 self-center text-border">|</span>
        {(
          [
            "all",
            "google_ads",
            "organic_search",
            "direct",
            "referral",
            "unknown",
          ] as const
        ).map((value) => (
          <Link
            key={value}
            href={hrefFor({ range, device, channel: value, order, includeMine })}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs",
              channel === value
                ? "border-primary bg-secondary text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {value === "all"
              ? "All sources"
              : ACQUISITION_LABELS[value]}
          </Link>
        ))}
      </div>

      <div className="mt-3">
        <Suspense fallback={null}>
          <IncludeOwnIpCheckbox checked={includeMine} />
        </Suspense>
      </div>

      {!loadError ? <VisitorCharts rows={chartRows} range={range} /> : null}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">
            Visits{total > 0 ? ` (${total})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <Suspense fallback={null}>
              <SessionOrderSelect value={order} resetPageOnChange />
            </Suspense>
          </div>
          {loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : visitors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {settings.enabled
                ? "No visitors in this range yet."
                : "Turn on Heatmap collection in Settings to start recording visitors."}
            </p>
          ) : (
            <RecordsTable
              key={order}
              rows={visitors.map(visitorToRecord)}
              nameLabel="Visitor"
              categoriesLabel="Source"
              lastLabel="When"
              strengthLabel="Session depth"
              linksLabel="Session"
              strengthLabels={SESSION_STRENGTH_LABELS}
              listOrder={order}
              emptyLabel="No visitors in this range yet."
            />
          )}

          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-between">
              {page > 1 ? (
                <Link
                  href={hrefFor({
                    range,
                    device,
                    channel,
                    order,
                    includeMine,
                    page: page - 1,
                  })}
                  className="text-sm text-primary hover:underline"
                >
                  Previous
                </Link>
              ) : (
                <span className="text-sm text-muted-foreground opacity-40">
                  Previous
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                Page {page} of {pageCount}
              </span>
              {page < pageCount ? (
                <Link
                  href={hrefFor({
                    range,
                    device,
                    channel,
                    order,
                    includeMine,
                    page: page + 1,
                  })}
                  className="text-sm text-primary hover:underline"
                >
                  Next
                </Link>
              ) : (
                <span className="text-sm text-muted-foreground opacity-40">
                  Next
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
