"use client";

import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Pie,
  PieChart,
  XAxis,
} from "recharts";

import { Badge } from "@/components/shadcn/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/shadcn/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { ACQUISITION_LABELS } from "@/lib/admin/labels";
import type { VisitorChartRow } from "@/lib/analytics/store";
import type { HeatmapRange } from "@/lib/analytics/types";
import type { AcquisitionChannel } from "@/lib/supabase/server";

type BarMetric = "visits" | "uniques";
type BarBucket = "auto" | "hour" | "day";
type BarSeries = "total" | "device" | "channel";
type PieDimension =
  | "channel"
  | "device"
  | "utm_source"
  | "page"
  | "country"
  | "referrer";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

const DEVICE_KEYS = ["desktop", "tablet", "mobile"] as const;
const CHANNEL_KEYS = [
  "google_ads",
  "organic_search",
  "direct",
  "referral",
  "unknown",
] as const;

function channelLabel(value: string | null | undefined): string {
  if (!value) return "Unknown";
  return ACQUISITION_LABELS[value as AcquisitionChannel] ?? value;
}

function slugKey(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 40) || "other"
  );
}

function resolveBucket(
  range: HeatmapRange,
  choice: BarBucket
): "hour" | "day" {
  if (choice !== "auto") return choice;
  return range === "24h" ? "hour" : "day";
}

function bucketKey(iso: string, mode: "hour" | "day"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  if (mode === "hour") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:00`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatBucketLabel(key: string, mode: "hour" | "day"): string {
  if (mode === "hour") {
    const hour = key.slice(-5, -3);
    return `${Number(hour)}:00`;
  }
  const date = new Date(`${key}T12:00:00`);
  if (Number.isNaN(date.getTime())) return key;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function percentDelta(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

function buildBarModel(
  rows: VisitorChartRow[],
  range: HeatmapRange,
  metric: BarMetric,
  bucketChoice: BarBucket,
  series: BarSeries
) {
  const mode = resolveBucket(range, bucketChoice);
  const map = new Map<string, Record<string, number | string>>();
  const uniqueTracker = new Map<string, Set<string>>();

  const ensure = (key: string) => {
    let row = map.get(key);
    if (!row) {
      row = { bucket: key, label: formatBucketLabel(key, mode), visits: 0 };
      if (series === "device") {
        for (const device of DEVICE_KEYS) row[device] = 0;
      }
      if (series === "channel") {
        for (const channel of CHANNEL_KEYS) row[channel] = 0;
      }
      map.set(key, row);
    }
    return row;
  };

  for (const visit of rows) {
    const key = bucketKey(visit.started_at, mode);
    const row = ensure(key);
    const seriesKey =
      series === "total"
        ? "total"
        : series === "device"
          ? visit.device
          : (visit.acquisition_channel ?? "unknown");

    if (metric === "uniques") {
      const setKey = `${key}::${seriesKey}`;
      let set = uniqueTracker.get(setKey);
      if (!set) {
        set = new Set();
        uniqueTracker.set(setKey, set);
      }
      if (set.has(visit.visitor_id)) continue;
      set.add(visit.visitor_id);
    }

    row.visits = Number(row.visits) + 1;
    if (series === "device") {
      row[visit.device] = Number(row[visit.device] ?? 0) + 1;
    }
    if (series === "channel") {
      const channel = visit.acquisition_channel ?? "unknown";
      row[channel] = Number(row[channel] ?? 0) + 1;
    }
  }

  const data = [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);

  const totals = data.map((row) => Number(row.visits) || 0);
  const mid = Math.ceil(totals.length / 2) || 1;
  const firstHalf = totals.slice(0, mid).reduce((a, b) => a + b, 0);
  const secondHalf = totals.slice(mid).reduce((a, b) => a + b, 0);

  return {
    data,
    mode,
    delta: percentDelta(secondHalf, firstHalf),
    total: totals.reduce((a, b) => a + b, 0),
  };
}

function buildPieModel(rows: VisitorChartRow[], dimension: PieDimension) {
  const counts = new Map<string, { label: string; value: number }>();

  for (const visit of rows) {
    let label = "Unknown";
    switch (dimension) {
      case "channel":
        label = channelLabel(visit.acquisition_channel);
        break;
      case "device":
        label = visit.device;
        break;
      case "utm_source":
        label = visit.utm_source?.trim() || "(none)";
        break;
      case "page":
        label = visit.page || "/";
        break;
      case "country":
        label = visit.country?.trim() || "Unknown";
        break;
      case "referrer":
        label = visit.referrer_host?.trim() || "(direct)";
        break;
    }
    const key = slugKey(label);
    const existing = counts.get(key);
    if (existing) existing.value += 1;
    else counts.set(key, { label, value: 1 });
  }

  const sorted = [...counts.entries()]
    .map(([key, item]) => ({ key, ...item }))
    .sort((a, b) => b.value - a.value);

  const top = sorted.slice(0, 6);
  const rest = sorted.slice(6);
  if (rest.length > 0) {
    top.push({
      key: "other",
      label: "Other",
      value: rest.reduce((sum, item) => sum + item.value, 0),
    });
  }

  const config: ChartConfig = {
    visitors: { label: "Visitors" },
  };
  const data = top.map((item, index) => {
    const chartColor = CHART_COLORS[index % CHART_COLORS.length];
    config[item.key] = {
      label: item.label,
      color: chartColor,
    };
    return {
      key: item.key,
      label: item.label,
      visitors: item.value,
      chartColor,
      fill: `var(--color-${item.key})`,
    };
  });

  const total = data.reduce((sum, item) => sum + item.visitors, 0);
  const leader = data[0] ?? null;
  const leaderShare =
    leader && total > 0 ? Math.round((leader.visitors / total) * 100) : null;

  return { data, config, total, leader, leaderShare };
}

function TrendBadge({ delta }: { delta: number | null }) {
  if (delta == null) {
    return (
      <Badge
        variant="outline"
        className="ml-2 border-none bg-muted text-muted-foreground"
      >
        —
      </Badge>
    );
  }
  const up = delta >= 0;
  return (
    <Badge
      variant="outline"
      className={
        up
          ? "ml-2 border-none bg-emerald-500/10 text-emerald-400"
          : "ml-2 border-none bg-red-500/10 text-red-400"
      }
    >
      {up ? (
        <TrendingUp className="h-3.5 w-3.5" />
      ) : (
        <TrendingDown className="h-3.5 w-3.5" />
      )}
      <span>
        {up ? "+" : ""}
        {delta.toFixed(1)}%
      </span>
    </Badge>
  );
}

function DottedBackgroundPattern() {
  return (
    <pattern
      id="visitor-pattern-dots"
      x="0"
      y="0"
      width="10"
      height="10"
      patternUnits="userSpaceOnUse"
    >
      <circle
        className="text-muted dark:text-muted/40"
        cx="2"
        cy="2"
        r="1"
        fill="currentColor"
      />
    </pattern>
  );
}

export function VisitorCharts({
  rows,
  range,
}: {
  rows: VisitorChartRow[];
  range: HeatmapRange;
}) {
  const [barMetric, setBarMetric] = React.useState<BarMetric>("visits");
  const [barBucket, setBarBucket] = React.useState<BarBucket>("auto");
  const [barSeries, setBarSeries] = React.useState<BarSeries>("total");
  const [pieDimension, setPieDimension] =
    React.useState<PieDimension>("channel");
  const [pieDeviceFilter, setPieDeviceFilter] = React.useState<
    "all" | "desktop" | "tablet" | "mobile"
  >("all");

  const pieRows = React.useMemo(
    () =>
      pieDeviceFilter === "all"
        ? rows
        : rows.filter((row) => row.device === pieDeviceFilter),
    [rows, pieDeviceFilter]
  );

  const bar = React.useMemo(
    () => buildBarModel(rows, range, barMetric, barBucket, barSeries),
    [rows, range, barMetric, barBucket, barSeries]
  );

  const pie = React.useMemo(
    () => buildPieModel(pieRows, pieDimension),
    [pieRows, pieDimension]
  );

  const barConfig = React.useMemo((): ChartConfig => {
    if (barSeries === "device") {
      return {
        desktop: { label: "Desktop", color: "var(--chart-1)" },
        tablet: { label: "Tablet", color: "var(--chart-2)" },
        mobile: { label: "Mobile", color: "var(--chart-3)" },
      };
    }
    if (barSeries === "channel") {
      return {
        google_ads: { label: "Google Ads", color: "var(--chart-1)" },
        organic_search: { label: "Organic", color: "var(--chart-2)" },
        direct: { label: "Direct", color: "var(--chart-3)" },
        referral: { label: "Referral", color: "var(--chart-4)" },
        unknown: { label: "Unknown", color: "var(--chart-5)" },
      };
    }
    return {
      visits: {
        label: barMetric === "uniques" ? "Unique visitors" : "Visits",
        color: "var(--chart-1)",
      },
    };
  }, [barSeries, barMetric]);

  const rangeLabel =
    range === "24h"
      ? "Last 24 hours"
      : range === "7d"
        ? "Last 7 days"
        : "Last 30 days";

  if (rows.length === 0) return null;

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex flex-wrap items-center text-base">
              Traffic over time
              <TrendBadge delta={bar.delta} />
            </CardTitle>
            <CardDescription>
              {rangeLabel} · {bar.total.toLocaleString()}{" "}
              {barMetric === "uniques" ? "unique visitors" : "visits"}
              {bar.mode === "hour" ? " by hour" : " by day"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={barMetric}
              onValueChange={(value) => setBarMetric(value as BarMetric)}
            >
              <SelectTrigger className="h-8 w-[130px]" aria-label="Bar metric">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visits">Visits</SelectItem>
                <SelectItem value="uniques">Uniques</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={barBucket}
              onValueChange={(value) => setBarBucket(value as BarBucket)}
            >
              <SelectTrigger className="h-8 w-[120px]" aria-label="Bar bucket">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto buckets</SelectItem>
                <SelectItem value="hour">By hour</SelectItem>
                <SelectItem value="day">By day</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={barSeries}
              onValueChange={(value) => setBarSeries(value as BarSeries)}
            >
              <SelectTrigger className="h-8 w-[140px]" aria-label="Bar series">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Single series</SelectItem>
                <SelectItem value="device">Stack by device</SelectItem>
                <SelectItem value="channel">Stack by channel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="aspect-[2/1] w-full">
            <BarChart accessibilityLayer data={bar.data}>
              <defs>
                <DottedBackgroundPattern />
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="85%"
                fill="url(#visitor-pattern-dots)"
              />
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                minTickGap={24}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              {barSeries === "total" ? (
                <Bar dataKey="visits" fill="var(--color-visits)" radius={4} />
              ) : barSeries === "device" ? (
                DEVICE_KEYS.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={`var(--color-${key})`}
                    radius={index === DEVICE_KEYS.length - 1 ? 4 : 0}
                  />
                ))
              ) : (
                CHANNEL_KEYS.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={`var(--color-${key})`}
                    radius={index === CHANNEL_KEYS.length - 1 ? 4 : 0}
                  />
                ))
              )}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col lg:col-span-2">
        <CardHeader className="items-stretch gap-3 pb-0">
          <div>
            <CardTitle className="flex flex-wrap items-center text-base">
              Mix
              {pie.leaderShare != null ? (
                <Badge
                  variant="outline"
                  className="ml-2 border-none bg-primary/10 text-primary"
                >
                  {pie.leaderShare}% {pie.leader?.label}
                </Badge>
              ) : null}
            </CardTitle>
            <CardDescription>
              {pie.total.toLocaleString()} visits in this slice
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={pieDimension}
              onValueChange={(value) => setPieDimension(value as PieDimension)}
            >
              <SelectTrigger
                className="h-8 w-[150px]"
                aria-label="Pie dimension"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="channel">By channel</SelectItem>
                <SelectItem value="device">By device</SelectItem>
                <SelectItem value="utm_source">By UTM source</SelectItem>
                <SelectItem value="page">By page</SelectItem>
                <SelectItem value="country">By country</SelectItem>
                <SelectItem value="referrer">By referrer</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={pieDeviceFilter}
              onValueChange={(value) =>
                setPieDeviceFilter(
                  value as "all" | "desktop" | "tablet" | "mobile"
                )
              }
            >
              <SelectTrigger
                className="h-8 w-[140px]"
                aria-label="Pie device filter"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All devices</SelectItem>
                <SelectItem value="desktop">Desktop only</SelectItem>
                <SelectItem value="tablet">Tablet only</SelectItem>
                <SelectItem value="mobile">Mobile only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-center pb-4">
          <ChartContainer
            config={pie.config}
            className="mx-auto aspect-square max-h-[260px] w-full [&_.recharts-text]:fill-background"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="key" hideLabel />}
              />
              <Pie
                data={pie.data}
                dataKey="visitors"
                nameKey="label"
                innerRadius={36}
                paddingAngle={3}
                cornerRadius={6}
              >
                <LabelList
                  dataKey="visitors"
                  stroke="none"
                  fontSize={11}
                  fontWeight={600}
                  fill="currentColor"
                  formatter={(value) =>
                    typeof value === "number" ? String(value) : ""
                  }
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="mt-2 grid gap-1.5 text-xs text-muted-foreground">
            {pie.data.slice(0, 4).map((item) => (
              <li
                key={item.key}
                className="flex items-center justify-between gap-3"
              >
                <span className="flex min-w-0 items-center gap-2 truncate">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{ background: item.chartColor }}
                    aria-hidden
                  />
                  <span className="truncate text-foreground">{item.label}</span>
                </span>
                <span className="font-mono tabular-nums text-foreground">
                  {item.visitors}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
