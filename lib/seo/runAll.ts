import "server-only";

import { runBacklinkCheck } from "./backlinks";
import { runBrokenLinkCheck } from "./broken-links";
import {
  runAiOptimization,
  runBilling,
  runBusinessData,
  runContentMentions,
  runDomainAnalytics,
  runKeywordVolume,
  runLabs,
  runOnPage,
  runSerpRanks,
} from "./dfs-runners";
import { runMetaAudit } from "./meta-audit";
import { runPageSpeedCheck } from "./pagespeed";
import { runSitemapCheck } from "./sitemap";
import { runStructuredDataCheck } from "./structured-data";
import { DAILY_SEO_TYPES, type SeoAuditType, type SeoRunResult } from "./types";

const RUNNERS: Record<SeoAuditType, () => Promise<SeoRunResult>> = {
  "backlink-check": runBacklinkCheck,
  "sitemap-check": runSitemapCheck,
  "meta-audit": runMetaAudit,
  "broken-links": runBrokenLinkCheck,
  "structured-data": runStructuredDataCheck,
  pagespeed: runPageSpeedCheck,
  "dfs-serp": runSerpRanks,
  "dfs-keywords": runKeywordVolume,
  "dfs-domain": runDomainAnalytics,
  "dfs-labs": runLabs,
  "dfs-onpage": runOnPage,
  "dfs-content": runContentMentions,
  "dfs-ai": runAiOptimization,
  "dfs-business": runBusinessData,
  "dfs-billing": runBilling,
};

export async function runSeoTool(type: SeoAuditType): Promise<SeoRunResult> {
  return RUNNERS[type]();
}

/** Sequential so one 60s cron does not stampede the live site or DataForSEO. */
export async function runAllSeoTools(
  types: readonly SeoAuditType[] = DAILY_SEO_TYPES
): Promise<Partial<Record<SeoAuditType, SeoRunResult>>> {
  const report: Partial<Record<SeoAuditType, SeoRunResult>> = {};
  for (const type of types) {
    try {
      report[type] = await RUNNERS[type]();
    } catch (error) {
      report[type] = {
        ok: false,
        reason: error instanceof Error ? error.message : "Failed",
        summary: { error: error instanceof Error ? error.message : "Failed" },
      };
    }
  }
  return report;
}
