export const SEO_AUDIT_TYPES = [
  "backlink-check",
  "sitemap-check",
  "meta-audit",
  "broken-links",
  "structured-data",
  "pagespeed",
] as const;

export type SeoAuditType = (typeof SEO_AUDIT_TYPES)[number];

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
