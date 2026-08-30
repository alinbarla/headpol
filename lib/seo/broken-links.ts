import "server-only";

import { load } from "cheerio";
import pLimit from "p-limit";
import { fetchStatus, fetchText, siteOrigin, sitemapUrls } from "./crawl";
import { insertAuditLog } from "./store";
import type { SeoRunResult } from "./types";

type BrokenLink = {
  page: string;
  href: string;
  status: number;
};

function resolveHref(pageUrl: string, href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("mailto:")) {
    return null;
  }
  if (trimmed.startsWith("tel:") || trimmed.startsWith("javascript:")) {
    return null;
  }
  try {
    return new URL(trimmed, pageUrl).href;
  } catch {
    return null;
  }
}

export async function runBrokenLinkCheck(): Promise<SeoRunResult> {
  const origin = siteOrigin();
  const pages = await sitemapUrls();
  if (pages.length === 0) {
    const summary = { broken: [], issues: ["Could not read sitemap.xml"] };
    await insertAuditLog("broken-links", summary);
    return { ok: false, summary };
  }

  const crawlLimit = pLimit(5);
  const hrefs = new Map<string, string>();

  await Promise.all(
    pages.map((page) =>
      crawlLimit(async () => {
        const result = await fetchText(page);
        if (!result.ok) return;
        const $ = load(result.text);
        $("a[href]").each((_, el) => {
          const resolved = resolveHref(page, $(el).attr("href") ?? "");
          if (!resolved) return;
          if (!resolved.startsWith(origin)) return;
          if (!hrefs.has(resolved)) hrefs.set(resolved, page);
        });
      })
    )
  );

  const checkLimit = pLimit(5);
  const broken: BrokenLink[] = [];
  await Promise.all(
    [...hrefs.entries()].map(([href, page]) =>
      checkLimit(async () => {
        const status = await fetchStatus(href);
        if (status === 0 || status >= 400) {
          broken.push({ page, href, status });
        }
      })
    )
  );

  broken.sort((a, b) => b.status - a.status);
  const summary = {
    checked: hrefs.size,
    brokenCount: broken.length,
    broken: broken.slice(0, 200),
  };
  await insertAuditLog("broken-links", summary);
  return { ok: broken.length === 0, summary };
}
