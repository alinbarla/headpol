export const SEO_AUDIT_TYPES = [
  "backlink-check",
  "sitemap-check",
  "meta-audit",
  "broken-links",
  "structured-data",
  "pagespeed",
  "dfs-serp",
  "dfs-keywords",
  "dfs-domain",
  "dfs-labs",
  "dfs-onpage",
  "dfs-content",
  "dfs-ai",
  "dfs-business",
  "dfs-billing",
] as const;

export type SeoAuditType = (typeof SEO_AUDIT_TYPES)[number];

/** Cheap/fast DataForSEO calls the daily 60s job can afford. */
export const DAILY_SEO_TYPES: SeoAuditType[] = [
  "backlink-check",
  "sitemap-check",
  "meta-audit",
  "broken-links",
  "structured-data",
  "pagespeed",
  "dfs-keywords",
  "dfs-labs",
  "dfs-domain",
  "dfs-billing",
];

/** Slow or quota-limited tools — no hourly cooldown on manual or Update data runs. */
export const MANUAL_SEO_TYPES: SeoAuditType[] = [
  "pagespeed",
  "dfs-serp",
  "dfs-onpage",
  "dfs-content",
  "dfs-ai",
  "dfs-business",
];

export const SEO_TOOL_PATH: Record<SeoAuditType, string> = {
  "backlink-check": "backlinks",
  "sitemap-check": "sitemap",
  "meta-audit": "meta-audit",
  "broken-links": "broken-links",
  "structured-data": "structured-data",
  pagespeed: "pagespeed",
  "dfs-serp": "ranks",
  "dfs-keywords": "keywords",
  "dfs-domain": "domain",
  "dfs-labs": "labs",
  "dfs-onpage": "onpage",
  "dfs-content": "mentions",
  "dfs-ai": "ai",
  "dfs-business": "business",
  "dfs-billing": "billing",
};

export type BacklinkRecord = {
  id: string;
  source_url: string;
  target_url: string;
  anchor_text: string | null;
  domain_authority: number | null;
  discovered_at: string;
  last_seen_at: string;
  status: "active" | "lost";
  is_new: boolean;
};

export type SeoAuditLogRecord = {
  id: string;
  type: SeoAuditType;
  summary: Record<string, unknown>;
  created_at: string;
};

export type FetchedBacklink = {
  sourceUrl: string;
  targetUrl: string;
  anchorText: string | null;
  domainAuthority: number | null;
};

export type SeoRunResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  summary: Record<string, unknown>;
};
