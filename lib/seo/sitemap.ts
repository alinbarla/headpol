import "server-only";

import { fetchText, parseSitemapLocs, siteOrigin } from "./crawl";
import { insertAuditLog } from "./store";
import type { SeoRunResult } from "./types";

export async function runSitemapCheck(): Promise<SeoRunResult> {
  const origin = siteOrigin();
  const sitemapUrl = `${origin}/sitemap.xml`;
  const robotsUrl = `${origin}/robots.txt`;

  const [sitemap, robots] = await Promise.all([
    fetchText(sitemapUrl),
    fetchText(robotsUrl),
  ]);

  const locs = sitemap.ok ? parseSitemapLocs(sitemap.text) : [];
  const sitemapLooksXml =
    sitemap.contentType.includes("xml") ||
    sitemap.text.includes("<urlset") ||
    sitemap.text.includes("<sitemapindex");
  const robotsMentionsSitemap = /sitemap:/i.test(robots.text);
  const robotsSitemapUrl = robots.text.match(/sitemap:\s*(\S+)/i)?.[1] ?? null;

  const issues: string[] = [];
  if (!sitemap.ok) issues.push(`sitemap.xml returned ${sitemap.status || "no response"}`);
  else if (!sitemapLooksXml) issues.push("sitemap.xml does not look like XML");
  if (locs.length === 0 && sitemap.ok) issues.push("sitemap.xml has no <loc> entries");
  if (!robots.ok) issues.push(`robots.txt returned ${robots.status || "no response"}`);
  if (robots.ok && !robotsMentionsSitemap) {
    issues.push("robots.txt does not reference a Sitemap");
  }
  if (robotsSitemapUrl && !robotsSitemapUrl.replace(/\/$/, "").endsWith("/sitemap.xml")) {
    issues.push(`robots.txt sitemap points at ${robotsSitemapUrl}`);
  }

  const summary = {
    sitemapStatus: sitemap.status,
    robotsStatus: robots.status,
    urlCount: locs.length,
    robotsSitemapUrl,
    issues,
  };
  await insertAuditLog("sitemap-check", summary);
  return { ok: issues.length === 0, summary };
}
