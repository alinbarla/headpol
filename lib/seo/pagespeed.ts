import "server-only";

import { siteOrigin } from "./crawl";
import { insertAuditLog } from "./store";
import type { SeoRunResult } from "./types";

export function isPageSpeedConfigured(): boolean {
  return Boolean(process.env.PAGESPEED_API_KEY?.trim());
}

type Vital = {
  url: string;
  performance: number | null;
  lcp: string | null;
  cls: string | null;
  inp: string | null;
  error?: string;
};

function pagespeedUrls(): string[] {
  const origin = siteOrigin();
  return [`${origin}/sv`, `${origin}/en`, `${origin}/sv/priser`];
}

export async function runPageSpeedCheck(): Promise<SeoRunResult> {
  const key = process.env.PAGESPEED_API_KEY?.trim();
  if (!key) {
    const summary = { skipped: true, reason: "PAGESPEED_API_KEY missing", pages: [] };
    await insertAuditLog("pagespeed", summary);
    return { ok: true, skipped: true, reason: summary.reason, summary };
  }

  const pages: Vital[] = [];
  for (const url of pagespeedUrls()) {
    const endpoint = new URL(
      "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
    );
    endpoint.searchParams.set("url", url);
    endpoint.searchParams.set("key", key);
    endpoint.searchParams.set("strategy", "mobile");
    endpoint.searchParams.set("category", "performance");

    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) {
        pages.push({
          url,
          performance: null,
          lcp: null,
          cls: null,
          inp: null,
          error: `HTTP ${response.status}`,
        });
        continue;
      }
      const payload = (await response.json()) as {
        lighthouseResult?: {
          categories?: { performance?: { score?: number } };
          audits?: Record<string, { displayValue?: string }>;
        };
      };
      const audits = payload.lighthouseResult?.audits ?? {};
      pages.push({
        url,
        performance: Math.round(
          (payload.lighthouseResult?.categories?.performance?.score ?? 0) * 100
        ),
        lcp: audits["largest-contentful-paint"]?.displayValue ?? null,
        cls: audits["cumulative-layout-shift"]?.displayValue ?? null,
        inp:
          audits["interaction-to-next-paint"]?.displayValue ??
          audits["experimental-interaction-to-next-paint"]?.displayValue ??
          null,
      });
    } catch (error) {
      pages.push({
        url,
        performance: null,
        lcp: null,
        cls: null,
        inp: null,
        error: error instanceof Error ? error.message : "Request failed",
      });
    }
  }

  const summary = { pages };
  await insertAuditLog("pagespeed", summary);
  return { ok: pages.every((page) => !page.error), summary };
}
