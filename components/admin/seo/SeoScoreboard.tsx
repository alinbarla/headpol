import {
  buildGauges,
  buildSnapshotStats,
  keywordVolumeBars,
  rankedPositionBars,
  sparkFromHistory,
  type SparkPoint,
} from "@/lib/seo/overview";
import type { SeoAuditLogRecord, SeoAuditType } from "@/lib/seo/types";
import { SeoBarList, SeoSparkline } from "./SeoCharts";
import { SeoGauge } from "./SeoGauge";

export function SeoScoreboard({
  logs,
  backlinkHistory,
  labsHistory,
}: {
  logs: Partial<Record<SeoAuditType, SeoAuditLogRecord>>;
  backlinkHistory: SparkPoint[];
  labsHistory: SparkPoint[];
}) {
  const gauges = buildGauges(logs);
  const stats = buildSnapshotStats(logs);
  const volumeBars = keywordVolumeBars(logs["dfs-keywords"]);
  const rankBars = rankedPositionBars(logs["dfs-labs"]);

  return (
    <section className="mt-6 space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {gauges.map((gauge) => (
          <SeoGauge key={gauge.label} model={gauge} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-3"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <SeoBarList
          title="Keyword volume"
          empty="Run Keyword data to chart Sweden search volume."
          rows={volumeBars}
        />
        <SeoBarList
          title="Best ranked keywords"
          empty="Run Labs to chart organic positions."
          rows={rankBars}
          invert
          maxHint={100}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <SeoSparkline
          title="Backlinks"
          empty="Sparklines appear after the daily job has run more than once."
          points={backlinkHistory}
        />
        <SeoSparkline
          title="Estimated traffic"
          empty="Sparklines appear after Labs has more than one run."
          points={labsHistory}
        />
      </div>
    </section>
  );
}

export function historyToSparks(
  rows: SeoAuditLogRecord[],
  field: "backlinks" | "etv"
): SparkPoint[] {
  return sparkFromHistory(rows, (summary) => {
    const value = summary[field];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (field === "backlinks" && typeof summary.total === "number") {
      return summary.total;
    }
    return null;
  });
}
