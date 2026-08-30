import "server-only";

import { load } from "cheerio";
import pLimit from "p-limit";
import { fetchText, sitemapUrls } from "./crawl";
import { insertAuditLog } from "./store";
import type { SeoRunResult } from "./types";

type PageMeta = {
  url: string;
  status: number;
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;
  ogTitle: boolean;
  ogDescription: boolean;
  ogImage: boolean;
  issues: string[];
};

function auditHtml(url: string, html: string): Omit<PageMeta, "url" | "status"> {
  const $ = load(html);
  const title = $("title").first().text().trim();
  const description =
    $('meta[name="description"]').attr("content")?.trim() ?? "";
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() ?? "";
  const ogTitle = Boolean($('meta[property="og:title"]').attr("content")?.trim());
  const ogDescription = Boolean(
    $('meta[property="og:description"]').attr("content")?.trim()
  );
  const ogImage = Boolean($('meta[property="og:image"]').attr("content")?.trim());

  const issues: string[] = [];
  if (!title) issues.push("Missing title");
  else if (title.length < 30) issues.push("Title shorter than 30 characters");
  else if (title.length > 65) issues.push("Title longer than 65 characters");
  if (!description) issues.push("Missing meta description");
  else if (description.length < 70) issues.push("Description shorter than 70 characters");
  else if (description.length > 170) issues.push("Description longer than 170 characters");
  if (!canonical) issues.push("Missing canonical");
  if (!ogTitle) issues.push("Missing og:title");
  if (!ogDescription) issues.push("Missing og:description");
  if (!ogImage) issues.push("Missing og:image");

  return {
    title,
    titleLength: title.length,
    description,
    descriptionLength: description.length,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    issues,
  };
}

export async function runMetaAudit(): Promise<SeoRunResult> {
  const urls = await sitemapUrls();
  if (urls.length === 0) {
    const summary = { pages: [], issues: ["Could not read sitemap.xml"] };
    await insertAuditLog("meta-audit", summary);
    return { ok: false, summary };
  }

  const limit = pLimit(5);
  const pages = await Promise.all(
    urls.map((url) =>
      limit(async (): Promise<PageMeta> => {
        const result = await fetchText(url);
        if (!result.ok) {
          return {
            url,
            status: result.status,
            title: "",
            titleLength: 0,
            description: "",
            descriptionLength: 0,
            canonical: "",
            ogTitle: false,
            ogDescription: false,
            ogImage: false,
            issues: [`HTTP ${result.status || "failed"}`],
          };
        }
        return { url, status: result.status, ...auditHtml(url, result.text) };
      })
    )
  );

  const titles = new Map<string, string[]>();
  for (const page of pages) {
    if (!page.title) continue;
    const list = titles.get(page.title) ?? [];
    list.push(page.url);
    titles.set(page.title, list);
  }
  for (const [title, list] of titles) {
    if (list.length < 2) continue;
    for (const page of pages) {
      if (page.title === title) page.issues.push("Duplicate title");
    }
  }

  const issueCount = pages.reduce((sum, page) => sum + page.issues.length, 0);
  const summary = { pages, issueCount, urlCount: urls.length };
  await insertAuditLog("meta-audit", summary);
  return { ok: issueCount === 0, summary };
}
