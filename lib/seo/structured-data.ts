import "server-only";

import { load } from "cheerio";
import pLimit from "p-limit";
import { fetchText, sitemapUrls } from "./crawl";
import { insertAuditLog } from "./store";
import type { SeoRunResult } from "./types";

type PageLd = {
  url: string;
  status: number;
  blocks: number;
  types: string[];
  issues: string[];
};

function typesOf(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  if (Array.isArray(record["@graph"])) {
    return record["@graph"].flatMap((node) => typesOf(node));
  }
  const raw = record["@type"];
  if (typeof raw === "string") return [raw];
  if (Array.isArray(raw)) return raw.filter((item): item is string => typeof item === "string");
  return [];
}

function auditJsonLd(url: string, html: string): Omit<PageLd, "url" | "status"> {
  const $ = load(html);
  const issues: string[] = [];
  const types: string[] = [];
  let blocks = 0;

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text().trim();
    if (!raw) return;
    blocks += 1;
    try {
      const parsed: unknown = JSON.parse(raw);
      const found = typesOf(parsed);
      types.push(...found);
      const context =
        parsed && typeof parsed === "object"
          ? (parsed as Record<string, unknown>)["@context"]
          : undefined;
      const contextOk =
        typeof context === "string"
          ? context.includes("schema.org")
          : Array.isArray(context)
            ? context.some((item) => String(item).includes("schema.org"))
            : found.length > 0;
      if (!contextOk && found.length === 0) {
        issues.push("JSON-LD missing @context/@type");
      }
    } catch {
      issues.push("Invalid JSON-LD");
    }
  });

  if (blocks === 0) issues.push("No JSON-LD on page");
  void url;
  return { blocks, types: [...new Set(types)], issues };
}

export async function runStructuredDataCheck(): Promise<SeoRunResult> {
  const urls = await sitemapUrls();
  if (urls.length === 0) {
    const summary = { pages: [], issues: ["Could not read sitemap.xml"] };
    await insertAuditLog("structured-data", summary);
    return { ok: false, summary };
  }

  const limit = pLimit(5);
  const pages = await Promise.all(
    urls.map((url) =>
      limit(async (): Promise<PageLd> => {
        const result = await fetchText(url);
        if (!result.ok) {
          return {
            url,
            status: result.status,
            blocks: 0,
            types: [],
            issues: [`HTTP ${result.status || "failed"}`],
          };
        }
        return { url, status: result.status, ...auditJsonLd(url, result.text) };
      })
    )
  );

  const issueCount = pages.reduce((sum, page) => sum + page.issues.length, 0);
  const summary = { pages, issueCount, urlCount: urls.length };
  await insertAuditLog("structured-data", summary);
  return { ok: issueCount === 0, summary };
}
