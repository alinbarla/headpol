import "server-only";

import {
  fetchAiSnapshot,
  fetchBilling,
  fetchBusinessListing,
  fetchContentMentions,
  fetchDomainTechnologies,
  fetchKeywordVolume,
  fetchLabsSnapshot,
  fetchOnPageSnapshot,
  fetchSerpRanks,
  isDataForSeoConfigured,
} from "./providers/dataforseo";
import { insertAuditLog } from "./store";
import type { SeoAuditType, SeoRunResult } from "./types";

async function runConfigured(
  type: SeoAuditType,
  load: () => Promise<Record<string, unknown>>
): Promise<SeoRunResult> {
  if (!isDataForSeoConfigured()) {
    const summary = { skipped: true, reason: "DataForSEO credentials missing" };
    await insertAuditLog(type, summary);
    return { ok: true, skipped: true, reason: summary.reason, summary };
  }

  const summary = await load();
  await insertAuditLog(type, summary);
  return { ok: true, summary };
}

export function runSerpRanks(): Promise<SeoRunResult> {
  return runConfigured("dfs-serp", async () => {
    const ranks = await fetchSerpRanks();
    return {
      ranks,
      found: ranks.filter((row) => row.position != null).length,
      tracked: ranks.length,
    };
  });
}

export function runKeywordVolume(): Promise<SeoRunResult> {
  return runConfigured("dfs-keywords", async () => {
    const keywords = await fetchKeywordVolume();
    return {
      keywords,
      withVolume: keywords.filter((row) => (row.searchVolume ?? 0) > 0).length,
    };
  });
}

export function runDomainAnalytics(): Promise<SeoRunResult> {
  return runConfigured("dfs-domain", async () => {
    const domain = await fetchDomainTechnologies();
    return { ...domain };
  });
}

export function runLabs(): Promise<SeoRunResult> {
  return runConfigured("dfs-labs", async () => {
    const labs = await fetchLabsSnapshot();
    return { ...labs };
  });
}

export function runOnPage(): Promise<SeoRunResult> {
  return runConfigured("dfs-onpage", async () => {
    const page = await fetchOnPageSnapshot();
    return { ...page };
  });
}

export function runContentMentions(): Promise<SeoRunResult> {
  return runConfigured("dfs-content", async () => {
    const mentions = await fetchContentMentions();
    return { ...mentions };
  });
}

export function runAiOptimization(): Promise<SeoRunResult> {
  return runConfigured("dfs-ai", async () => {
    const ai = await fetchAiSnapshot();
    return { ...ai };
  });
}

export function runBusinessData(): Promise<SeoRunResult> {
  return runConfigured("dfs-business", async () => {
    const listings = await fetchBusinessListing();
    return { listings, count: listings.length };
  });
}

export function runBilling(): Promise<SeoRunResult> {
  return runConfigured("dfs-billing", async () => {
    const billing = await fetchBilling();
    return { ...billing };
  });
}
