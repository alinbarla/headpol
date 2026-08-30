import "server-only";

import { SITE_URL } from "@/lib/seo";

const FETCH_MS = 12_000;

export function siteOrigin(): string {
  return SITE_URL.replace(/\/$/, "");
}

export async function fetchText(
  url: string
): Promise<{ ok: boolean; status: number; text: string; contentType: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "StralkastarpoleringSeoBot/1.0" },
      cache: "no-store",
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      text,
      contentType: response.headers.get("content-type") ?? "",
    };
  } catch {
    return { ok: false, status: 0, text: "", contentType: "" };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchStatus(url: string): Promise<number> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "StralkastarpoleringSeoBot/1.0" },
      cache: "no-store",
    });
    if (head.status !== 405 && head.status !== 501) return head.status;
  } catch {
    // Fall through to GET.
  } finally {
    clearTimeout(timer);
  }

  const get = await fetchText(url);
  return get.status;
}

export function parseSitemapLocs(xml: string): string[] {
  const matches = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)];
  return matches
    .map((match) => decodeXml(match[1].trim()))
    .filter((url) => /^https?:\/\//i.test(url));
}

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export async function sitemapUrls(): Promise<string[]> {
  const origin = siteOrigin();
  const { ok, text } = await fetchText(`${origin}/sitemap.xml`);
  if (!ok) return [];
  return parseSitemapLocs(text);
}
