import type { SeoAuditLogRecord, SeoAuditType } from "./types";

export type ToolStatus = "ok" | "issues" | "skipped" | "never";

export type GaugeTone = "idle" | "good" | "mid" | "bad";

export type GaugeModel = {
  label: string;
  value: number | null;
  display: string;
  caption: string;
  tone: GaugeTone;
};

export type SnapshotStat = {
  label: string;
  value: string;
};

export type BarRow = {
  label: string;
  value: number;
};

export type SparkPoint = {
  at: string;
  value: number;
};

export type ToolHeadline = {
  value: string;
  hint: string;
};

function asRecord(summary?: Record<string, unknown>): Record<string, unknown> {
  return summary ?? {};
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function strList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function isSkipped(summary?: Record<string, unknown>): boolean {
  return asRecord(summary).skipped === true;
}

export function siteIssueCounts(logs: Partial<Record<SeoAuditType, SeoAuditLogRecord>>): {
  sitemap: number | null;
  meta: number | null;
  broken: number | null;
  jsonld: number | null;
  ran: boolean;
} {
  const sitemapLog = logs["sitemap-check"];
  const metaLog = logs["meta-audit"];
  const brokenLog = logs["broken-links"];
  const jsonldLog = logs["structured-data"];

  const sitemap =
    sitemapLog && !isSkipped(sitemapLog.summary)
      ? strList(sitemapLog.summary.issues).length
      : null;
  const meta =
    metaLog && !isSkipped(metaLog.summary)
      ? (num(metaLog.summary.issueCount) ?? 0)
      : null;
  const broken =
    brokenLog && !isSkipped(brokenLog.summary)
      ? (num(brokenLog.summary.brokenCount) ?? 0)
      : null;
  const jsonld =
    jsonldLog && !isSkipped(jsonldLog.summary)
      ? (num(jsonldLog.summary.issueCount) ?? 0)
      : null;

  return {
    sitemap,
    meta,
    broken,
    jsonld,
    ran: [sitemap, meta, broken, jsonld].some((value) => value != null),
  };
}

export function siteHealthScore(
  logs: Partial<Record<SeoAuditType, SeoAuditLogRecord>>
): { score: number | null; caption: string } {
  const counts = siteIssueCounts(logs);
  if (!counts.ran) return { score: null, caption: "Site checks have not run" };

  const penalty =
    Math.min(30, (counts.sitemap ?? 0) * 15) +
    Math.min(25, (counts.meta ?? 0) * 2) +
    Math.min(25, (counts.broken ?? 0) * 8) +
    Math.min(20, (counts.jsonld ?? 0) * 4);
  const score = Math.max(0, Math.round(100 - penalty));
  const bits = [
    counts.broken != null ? `${counts.broken} broken` : null,
    counts.meta != null ? `${counts.meta} meta` : null,
    counts.sitemap != null ? `${counts.sitemap} sitemap` : null,
  ].filter(Boolean);
  return {
    score,
    caption: bits.length > 0 ? bits.join(" · ") : "No issue counts yet",
  };
}

export function onPageScore(log?: SeoAuditLogRecord): {
  score: number | null;
  caption: string;
} {
  if (!log || isSkipped(log.summary)) {
    return { score: null, caption: "OnPage has not run" };
  }
  const score = num(log.summary.score);
  const issues = strList(log.summary.issues).length;
  return {
    score,
    caption:
      score == null
        ? "No score stored"
        : issues > 0
          ? `${issues} flagged check${issues === 1 ? "" : "s"}`
          : "No flagged checks",
  };
}

export function pageSpeedAverage(log?: SeoAuditLogRecord): {
  score: number | null;
  caption: string;
} {
  if (!log || isSkipped(log.summary)) {
    return { score: null, caption: "PageSpeed has not run" };
  }
  const pages = strList(log.summary.pages) as Array<{
    performance?: number | null;
  }>;
  const scores = pages
    .map((page) => num(page.performance))
    .filter((value): value is number => value != null);
  if (scores.length === 0) {
    return { score: null, caption: "No Lighthouse scores stored" };
  }
  const avg = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
  return { score: avg, caption: `Avg of ${scores.length} key pages` };
}

export function serpCoverage(log?: SeoAuditLogRecord): {
  score: number | null;
  caption: string;
} {
  if (!log || isSkipped(log.summary)) {
    return { score: null, caption: "SERP ranks have not run" };
  }
  const found = num(log.summary.found) ?? 0;
  const tracked = num(log.summary.tracked) ?? strList(log.summary.ranks).length;
  if (tracked === 0) return { score: null, caption: "No keywords stored" };
  return {
    score: Math.round((found / tracked) * 100),
    caption: `${found} of ${tracked} in top 10`,
  };
}

export function gaugeTone(score: number | null): GaugeTone {
  if (score == null) return "idle";
  if (score >= 80) return "good";
  if (score >= 50) return "mid";
  return "bad";
}

export function buildGauges(
  logs: Partial<Record<SeoAuditType, SeoAuditLogRecord>>
): GaugeModel[] {
  const site = siteHealthScore(logs);
  const onpage = onPageScore(logs["dfs-onpage"]);
  const speed = pageSpeedAverage(logs.pagespeed);
  const serp = serpCoverage(logs["dfs-serp"]);

  const pack = [
    { label: "Site health", ...site },
    { label: "OnPage", ...onpage },
    { label: "PageSpeed", ...speed },
    { label: "SERP coverage", ...serp },
  ];

  return pack.map((item) => ({
    label: item.label,
    value: item.score,
    display: item.score == null ? "—" : String(item.score),
    caption: item.caption,
    tone: gaugeTone(item.score),
  }));
}

export function buildSnapshotStats(
  logs: Partial<Record<SeoAuditType, SeoAuditLogRecord>>
): SnapshotStat[] {
  const backlinks = logs["backlink-check"]?.summary;
  const labs = logs["dfs-labs"]?.summary;
  const keywords = logs["dfs-keywords"]?.summary;
  const content = logs["dfs-content"]?.summary;
  const business = logs["dfs-business"]?.summary;
  const billing = logs["dfs-billing"]?.summary;

  const volumeRows = strList(keywords?.keywords) as Array<{
    searchVolume?: number | null;
  }>;
  const withVolume =
    num(keywords?.withVolume) ??
    volumeRows.filter((row) => (row.searchVolume ?? 0) > 0).length;

  return [
    {
      label: "Backlinks",
      value: formatCount(num(backlinks?.backlinks) ?? num(backlinks?.total)),
    },
    {
      label: "Ref. domains",
      value: formatCount(num(backlinks?.referringDomains)),
    },
    {
      label: "Organic KW",
      value: formatCount(num(labs?.organicCount)),
    },
    {
      label: "Est. traffic",
      value: formatCount(num(labs?.etv), { decimals: 0 }),
    },
    {
      label: "KW with volume",
      value: formatCount(withVolume || null),
    },
    {
      label: "Citations",
      value: formatCount(num(content?.total)),
    },
    {
      label: "GBP listings",
      value: formatCount(num(business?.count)),
    },
    {
      label: "DFS balance",
      value:
        num(billing?.balance) != null
          ? `$${num(billing?.balance)!.toFixed(2)}`
          : "—",
    },
  ];
}

export function keywordVolumeBars(log?: SeoAuditLogRecord): BarRow[] {
  if (!log || isSkipped(log.summary)) return [];
  const rows = strList(log.summary.keywords) as Array<{
    keyword?: string;
    searchVolume?: number | null;
  }>;
  return rows
    .filter((row) => row.keyword && (row.searchVolume ?? 0) > 0)
    .sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0))
    .slice(0, 8)
    .map((row) => ({
      label: row.keyword ?? "",
      value: row.searchVolume ?? 0,
    }));
}

export function rankedPositionBars(log?: SeoAuditLogRecord): BarRow[] {
  if (!log || isSkipped(log.summary)) return [];
  const rows = strList(log.summary.ranked) as Array<{
    keyword?: string;
    position?: number | null;
  }>;
  return rows
    .filter((row) => row.keyword && row.position != null)
    .sort((a, b) => (a.position ?? 100) - (b.position ?? 100))
    .slice(0, 8)
    .map((row) => ({
      label: row.keyword ?? "",
      value: row.position ?? 100,
    }));
}

export function sparkFromHistory(
  rows: SeoAuditLogRecord[],
  pick: (summary: Record<string, unknown>) => number | null
): SparkPoint[] {
  return rows
    .filter((row) => !isSkipped(row.summary))
    .map((row) => {
      const value = pick(row.summary);
      return value == null ? null : { at: row.created_at, value };
    })
    .filter((point): point is SparkPoint => point != null);
}

export function toolStatus(log?: SeoAuditLogRecord): ToolStatus {
  if (!log) return "never";
  if (isSkipped(log.summary)) return "skipped";
  if (toolHasIssues(log)) return "issues";
  return "ok";
}

function toolHasIssues(log: SeoAuditLogRecord): boolean {
  const summary = log.summary;
  switch (log.type) {
    case "sitemap-check":
      return strList(summary.issues).length > 0;
    case "meta-audit":
    case "structured-data":
      return (num(summary.issueCount) ?? 0) > 0;
    case "broken-links":
      return (num(summary.brokenCount) ?? 0) > 0;
    case "pagespeed":
      return (strList(summary.pages) as Array<{ error?: string }>).some(
        (page) => Boolean(page.error)
      );
    case "dfs-onpage":
      return strList(summary.issues).length > 0;
    case "dfs-serp": {
      const tracked = num(summary.tracked) ?? strList(summary.ranks).length;
      const found = num(summary.found) ?? 0;
      return tracked > 0 && found === 0;
    }
    default:
      return Boolean(summary.error);
  }
}

export function toolHeadline(
  type: SeoAuditType,
  log?: SeoAuditLogRecord
): ToolHeadline {
  if (!log) return { value: "—", hint: "Never run" };
  if (isSkipped(log.summary)) {
    return {
      value: "Skipped",
      hint: typeof log.summary.reason === "string" ? log.summary.reason : "Not configured",
    };
  }

  const summary = log.summary;
  switch (type) {
    case "sitemap-check":
      return {
        value: formatCount(num(summary.urlCount)),
        hint: "URLs in sitemap",
      };
    case "meta-audit":
      return {
        value: formatCount(num(summary.issueCount)),
        hint: "Meta issues",
      };
    case "broken-links":
      return {
        value: formatCount(num(summary.brokenCount)),
        hint: `${formatCount(num(summary.checked))} checked`,
      };
    case "structured-data":
      return {
        value: formatCount(num(summary.issueCount)),
        hint: "JSON-LD issues",
      };
    case "pagespeed": {
      const avg = pageSpeedAverage(log);
      return {
        value: avg.score == null ? "—" : String(avg.score),
        hint: "Avg Lighthouse",
      };
    }
    case "backlink-check":
      return {
        value: formatCount(num(summary.backlinks) ?? num(summary.total)),
        hint:
          num(summary.newCount) != null
            ? `${summary.newCount} new · ${summary.lostCount ?? 0} lost`
            : "Referring pages",
      };
    case "dfs-serp":
      return {
        value: `${num(summary.found) ?? 0}/${num(summary.tracked) ?? strList(summary.ranks).length}`,
        hint: "In top 10",
      };
    case "dfs-keywords":
      return {
        value: formatCount(
          num(summary.withVolume) ??
            (strList(summary.keywords) as Array<{ searchVolume?: number }>).filter(
              (row) => (row.searchVolume ?? 0) > 0
            ).length
        ),
        hint: "Keywords with volume",
      };
    case "dfs-domain":
      return {
        value: String(summary.domainRank ?? "—"),
        hint: "Domain rank",
      };
    case "dfs-labs":
      return {
        value: formatCount(num(summary.organicCount)),
        hint:
          num(summary.etv) != null
            ? `ETV ${formatCount(num(summary.etv), { decimals: 0 })}`
            : "Organic keywords",
      };
    case "dfs-onpage":
      return {
        value: formatCount(num(summary.score), { decimals: 0 }),
        hint: "OnPage score",
      };
    case "dfs-content":
      return {
        value: formatCount(num(summary.total) ?? strList(summary.items).length),
        hint: "Citations",
      };
    case "dfs-ai": {
      const mentions = strList(summary.mentions) as Array<{
        mentions?: number | null;
      }>;
      const total = mentions.reduce((sum, row) => sum + (row.mentions ?? 0), 0);
      return {
        value: formatCount(total || null),
        hint: "LLM mentions",
      };
    }
    case "dfs-business":
      return {
        value: formatCount(num(summary.count) ?? strList(summary.listings).length),
        hint: "Google listings",
      };
    case "dfs-billing":
      return {
        value:
          num(summary.balance) != null ? `$${num(summary.balance)!.toFixed(2)}` : "—",
        hint: "Account balance",
      };
  }
}

function formatCount(
  value: number | null | undefined,
  options?: { decimals?: number }
): string {
  if (value == null || Number.isNaN(value)) return "—";
  const decimals = options?.decimals;
  if (decimals != null) {
    return new Intl.NumberFormat("sv-SE", {
      maximumFractionDigits: decimals,
    }).format(value);
  }
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(
    Math.round(value)
  );
}
