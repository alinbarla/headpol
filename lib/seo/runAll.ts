import "server-only";

import { runBacklinkCheck } from "./backlinks";
import { runBrokenLinkCheck } from "./broken-links";
import { runMetaAudit } from "./meta-audit";
import { runPageSpeedCheck } from "./pagespeed";
import { runSitemapCheck } from "./sitemap";
import { runStructuredDataCheck } from "./structured-data";
import type { SeoAuditType, SeoRunResult } from "./types";

const RUNNERS: Record<SeoAuditType, () => Promise<SeoRunResult>> = {
  "backlink-check": runBacklinkCheck,
  "sitemap-check": runSitemapCheck,
  "meta-audit": runMetaAudit,
  "broken-links": runBrokenLinkCheck,
  "structured-data": runStructuredDataCheck,
  pagespeed: runPageSpeedCheck,
};

export async function runSeoTool(type: SeoAuditType): Promise<SeoRunResult> {
  return RUNNERS[type]();
}

/** Sequential so one 60s cron does not stampede the live site. */
export async function runAllSeoTools(): Promise<
  Record<SeoAuditType, SeoRunResult>
> {
  const report = {} as Record<SeoAuditType, SeoRunResult>;
  for (const type of Object.keys(RUNNERS) as SeoAuditType[]) {
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
