import "server-only";

import type { FetchedBacklink } from "../types";

const ENDPOINT = "https://api.dataforseo.com/v3/backlinks/backlinks/live";
const DEFAULT_DOMAIN = "stralkastarpolering.se";

export function isDataForSeoConfigured(): boolean {
  return Boolean(
    process.env.DATAFORSEO_LOGIN?.trim() &&
      process.env.DATAFORSEO_PASSWORD?.trim()
  );
}

type DataForSeoItem = {
  url_from?: string;
  url_to?: string;
  anchor?: string;
  domain_from_rank?: number;
  rank?: number;
};

type DataForSeoResponse = {
  status_code?: number;
  status_message?: string;
  tasks?: Array<{
    status_code?: number;
    status_message?: string;
    result?: Array<{
      items?: DataForSeoItem[];
    }>;
  }>;
};

/**
 * Isolated provider. Swap this file if the backlink index changes.
 */
export async function fetchBacklinksFromProvider(
  domain = DEFAULT_DOMAIN
): Promise<FetchedBacklink[]> {
  const login = process.env.DATAFORSEO_LOGIN?.trim();
  const password = process.env.DATAFORSEO_PASSWORD?.trim();
  if (!login || !password) {
    throw new Error("DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD is not set");
  }

  const auth = Buffer.from(`${login}:${password}`).toString("base64");
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        target: domain,
        mode: "as_is",
        limit: 1000,
        order_by: ["rank,desc"],
      },
    ]),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`DataForSEO HTTP ${response.status}`);
  }

  const payload = (await response.json()) as DataForSeoResponse;
  const task = payload.tasks?.[0];
  if (payload.status_code && payload.status_code >= 40000) {
    throw new Error(payload.status_message ?? "DataForSEO request failed");
  }
  if (task?.status_code && task.status_code >= 40000) {
    throw new Error(task.status_message ?? "DataForSEO task failed");
  }

  const items = task?.result?.[0]?.items ?? [];
  const seen = new Set<string>();
  const rows: FetchedBacklink[] = [];

  for (const item of items) {
    const sourceUrl = item.url_from?.trim();
    const targetUrl = item.url_to?.trim();
    if (!sourceUrl || !targetUrl) continue;
    const key = `${sourceUrl}|${targetUrl}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      sourceUrl,
      targetUrl,
      anchorText: item.anchor?.trim() || null,
      domainAuthority:
        typeof item.domain_from_rank === "number"
          ? item.domain_from_rank
          : typeof item.rank === "number"
            ? item.rank
            : null,
    });
  }

  return rows;
}
