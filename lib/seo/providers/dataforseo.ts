import "server-only";

import { SITE_URL } from "@/lib/seo";
import {
  DFS_AI_LANGUAGE_CODE,
  DFS_AI_LOCATION_CODE,
  DFS_BUSINESS_KEYWORD,
  DFS_BUSINESS_LOCATION,
  DFS_DOMAIN,
  DFS_LANGUAGE_CODE,
  DFS_LOCATION_CODE,
  DFS_SERP_KEYWORDS,
  DFS_VOLUME_KEYWORDS,
} from "../dfs-config";
import type { FetchedBacklink } from "../types";

const API = "https://api.dataforseo.com/v3";

export function isDataForSeoConfigured(): boolean {
  return Boolean(
    process.env.DATAFORSEO_LOGIN?.trim() &&
      process.env.DATAFORSEO_PASSWORD?.trim()
  );
}

type DfsTask<T> = {
  status_code?: number;
  status_message?: string;
  cost?: number;
  result?: T[];
};

type DfsResponse<T> = {
  status_code?: number;
  status_message?: string;
  cost?: number;
  tasks?: DfsTask<T>[];
};

function authHeader(): string {
  const login = process.env.DATAFORSEO_LOGIN?.trim();
  const password = process.env.DATAFORSEO_PASSWORD?.trim();
  if (!login || !password) {
    throw new Error("DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD is not set");
  }
  return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
}

function assertOk<T>(payload: DfsResponse<T>, label: string): DfsTask<T> {
  if (payload.status_code && payload.status_code >= 40000) {
    throw new Error(payload.status_message ?? `${label} failed`);
  }
  const task = payload.tasks?.[0];
  if (!task) throw new Error(`${label} returned no task`);
  if (task.status_code && task.status_code >= 40000) {
    throw new Error(task.status_message ?? `${label} task failed`);
  }
  return task;
}

async function dfsGet<T>(path: string, label: string): Promise<T[]> {
  const response = await fetch(`${API}${path}`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`DataForSEO HTTP ${response.status} (${label})`);
  const payload = (await response.json()) as DfsResponse<T>;
  return assertOk(payload, label).result ?? [];
}

async function dfsPost<T>(
  path: string,
  body: unknown[],
  label: string
): Promise<T[]> {
  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`DataForSEO HTTP ${response.status} (${label})`);
  const payload = (await response.json()) as DfsResponse<T>;
  return assertOk(payload, label).result ?? [];
}

type BacklinkItem = {
  url_from?: string;
  url_to?: string;
  anchor?: string;
  domain_from_rank?: number;
  rank?: number;
};

export async function fetchBacklinksFromProvider(
  domain = DFS_DOMAIN
): Promise<FetchedBacklink[]> {
  const results = await dfsPost<{ items?: BacklinkItem[] }>(
    "/backlinks/backlinks/live",
    [
      {
        target: domain,
        mode: "as_is",
        limit: 1000,
        order_by: ["rank,desc"],
      },
    ],
    "backlinks"
  );

  const items = results[0]?.items ?? [];
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

export type BacklinkOverview = {
  rank: number | null;
  backlinks: number | null;
  referringDomains: number | null;
  referringPages: number | null;
  brokenBacklinks: number | null;
};

export async function fetchBacklinkOverview(
  domain = DFS_DOMAIN
): Promise<BacklinkOverview> {
  const [row] = await dfsPost<{
    rank?: number;
    backlinks?: number;
    referring_domains?: number;
    referring_pages?: number;
    broken_backlinks?: number;
  }>(
    "/backlinks/summary/live",
    [{ target: domain, include_subdomains: true }],
    "backlinks summary"
  );
  return {
    rank: row?.rank ?? null,
    backlinks: row?.backlinks ?? null,
    referringDomains: row?.referring_domains ?? null,
    referringPages: row?.referring_pages ?? null,
    brokenBacklinks: row?.broken_backlinks ?? null,
  };
}

export type SerpRankRow = {
  keyword: string;
  position: number | null;
  url: string | null;
  title: string | null;
};

export async function fetchSerpRanks(
  keywords = DFS_SERP_KEYWORDS,
  domain = DFS_DOMAIN
): Promise<SerpRankRow[]> {
  const rows: SerpRankRow[] = [];
  for (const keyword of keywords) {
    const results = await dfsPost<{
      items?: Array<{
        type?: string;
        rank_group?: number;
        domain?: string;
        url?: string;
        title?: string;
      }>;
    }>(
      "/serp/google/organic/live/regular",
      [
        {
          keyword,
          location_code: DFS_LOCATION_CODE,
          language_code: DFS_LANGUAGE_CODE,
          device: "desktop",
          depth: 10,
          se_domain: "google.se",
          stop_crawl_on_match: [
            { match_value: domain, match_type: "with_subdomains" },
          ],
        },
      ],
      `serp ${keyword}`
    );
    const hit = (results[0]?.items ?? []).find((item) =>
      (item.domain ?? "").replace(/^www\./, "").includes(domain)
    );
    rows.push({
      keyword,
      position: hit?.rank_group ?? null,
      url: hit?.url ?? null,
      title: hit?.title ?? null,
    });
  }
  return rows;
}

export type KeywordVolumeRow = {
  keyword: string;
  searchVolume: number | null;
  competition: string | null;
  cpc: number | null;
};

export async function fetchKeywordVolume(
  keywords = DFS_VOLUME_KEYWORDS
): Promise<KeywordVolumeRow[]> {
  const results = await dfsPost<{
    keyword?: string;
    search_volume?: number;
    competition?: string;
    cpc?: number;
    items?: Array<{
      keyword?: string;
      search_volume?: number;
      competition?: string;
      cpc?: number;
    }>;
  }>(
    "/keywords_data/google_ads/search_volume/live",
    [
      {
        keywords,
        location_code: DFS_LOCATION_CODE,
        language_code: DFS_LANGUAGE_CODE,
      },
    ],
    "keyword volume"
  );
  const rows =
    results[0]?.keyword != null
      ? results
      : (results[0]?.items ?? []);
  return rows.map((row) => ({
    keyword: row.keyword ?? "",
    searchVolume: row.search_volume ?? null,
    competition: row.competition ?? null,
    cpc: row.cpc ?? null,
  }));
}

export type DomainTechSnapshot = {
  title: string | null;
  description: string | null;
  domainRank: string | null;
  country: string | null;
  language: string | null;
  emails: string[];
  phones: string[];
  technologies: string[];
};

export async function fetchDomainTechnologies(
  domain = DFS_DOMAIN
): Promise<DomainTechSnapshot> {
  const [row] = await dfsPost<{
    title?: string;
    description?: string;
    domain_rank?: string | number;
    country_iso_code?: string;
    language_code?: string;
    emails?: string[];
    phone_numbers?: string[];
    technologies?: Record<string, Record<string, string[]>>;
  }>(
    "/domain_analytics/technologies/domain_technologies/live",
    [{ target: domain }],
    "domain technologies"
  );

  const technologies: string[] = [];
  for (const group of Object.values(row?.technologies ?? {})) {
    for (const [category, names] of Object.entries(group ?? {})) {
      for (const name of names ?? []) {
        technologies.push(`${category}: ${name}`);
      }
    }
  }

  return {
    title: row?.title ?? null,
    description: row?.description ?? null,
    domainRank: row?.domain_rank != null ? String(row.domain_rank) : null,
    country: row?.country_iso_code ?? null,
    language: row?.language_code ?? null,
    emails: row?.emails ?? [],
    phones: row?.phone_numbers ?? [],
    technologies: technologies.slice(0, 40),
  };
}

export type RankedKeywordRow = {
  keyword: string;
  position: number | null;
  searchVolume: number | null;
  url: string | null;
};

export type CompetitorRow = {
  domain: string;
  intersections: number | null;
  avgPosition: number | null;
  organicCount: number | null;
  etv: number | null;
};

export type LabsSnapshot = {
  organicCount: number | null;
  etv: number | null;
  pos1: number | null;
  pos4to10: number | null;
  ranked: RankedKeywordRow[];
  competitors: CompetitorRow[];
  ideas: KeywordVolumeRow[];
};

export async function fetchLabsSnapshot(
  domain = DFS_DOMAIN
): Promise<LabsSnapshot> {
  const [rankedRes, competitorRes, ideasRes] = await Promise.all([
    dfsPost<{
      metrics?: { organic?: { count?: number; etv?: number; pos_1?: number; pos_4_10?: number } };
      items?: Array<{
        keyword_data?: {
          keyword?: string;
          keyword_info?: { search_volume?: number };
        };
        ranked_serp_element?: {
          serp_item?: { rank_group?: number; url?: string };
        };
      }>;
    }>(
      "/dataforseo_labs/google/ranked_keywords/live",
      [
        {
          target: domain,
          location_code: DFS_LOCATION_CODE,
          language_code: DFS_LANGUAGE_CODE,
          limit: 50,
          item_types: ["organic"],
        },
      ],
      "ranked keywords"
    ),
    dfsPost<{
      items?: Array<{
        domain?: string;
        intersections?: number;
        avg_position?: number;
        metrics?: { organic?: { count?: number; etv?: number } };
      }>;
    }>(
      "/dataforseo_labs/google/competitors_domain/live",
      [
        {
          target: domain,
          location_code: DFS_LOCATION_CODE,
          language_code: DFS_LANGUAGE_CODE,
          limit: 15,
          exclude_top_domains: true,
          item_types: ["organic"],
        },
      ],
      "competitors"
    ),
    dfsPost<{
      items?: Array<{
        keyword?: string;
        keyword_info?: { search_volume?: number; competition?: string; cpc?: number };
      }>;
    }>(
      "/dataforseo_labs/google/keyword_ideas/live",
      [
        {
          keywords: ["strålkastarpolering", "strålkastarrenovering"],
          location_code: DFS_LOCATION_CODE,
          language_code: DFS_LANGUAGE_CODE,
          limit: 30,
        },
      ],
      "keyword ideas"
    ),
  ]);

  const rankedTask = rankedRes[0];
  const organic = rankedTask?.metrics?.organic;

  return {
    organicCount: organic?.count ?? null,
    etv: organic?.etv ?? null,
    pos1: organic?.pos_1 ?? null,
    pos4to10: organic?.pos_4_10 ?? null,
    ranked: (rankedTask?.items ?? []).map((item) => ({
      keyword: item.keyword_data?.keyword ?? "",
      position: item.ranked_serp_element?.serp_item?.rank_group ?? null,
      searchVolume: item.keyword_data?.keyword_info?.search_volume ?? null,
      url: item.ranked_serp_element?.serp_item?.url ?? null,
    })),
    competitors: (competitorRes[0]?.items ?? [])
      .filter((item) => item.domain && item.domain !== domain)
      .slice(0, 15)
      .map((item) => ({
        domain: item.domain ?? "",
        intersections: item.intersections ?? null,
        avgPosition: item.avg_position ?? null,
        organicCount: item.metrics?.organic?.count ?? null,
        etv: item.metrics?.organic?.etv ?? null,
      })),
    ideas: (ideasRes[0]?.items ?? []).map((row) => ({
      keyword: row.keyword ?? "",
      searchVolume: row.keyword_info?.search_volume ?? null,
      competition: row.keyword_info?.competition ?? null,
      cpc: row.keyword_info?.cpc ?? null,
    })),
  };
}

export type OnPageSnapshot = {
  url: string;
  score: number | null;
  title: string | null;
  description: string | null;
  issues: string[];
};

export async function fetchOnPageSnapshot(): Promise<OnPageSnapshot> {
  const url = SITE_URL.replace(/\/$/, "");
  const results = await dfsPost<{
    items?: Array<{
      url?: string;
      onpage_score?: number;
      meta?: { title?: string; description?: string };
      checks?: Record<string, boolean | number | string | null>;
    }>;
  }>(
    "/on_page/instant_pages",
    [{ url, accept_language: "sv-SE" }],
    "onpage"
  );

  const page = results[0]?.items?.[0];
  const issueKeys = [
    "no_h1_tag",
    "title_too_short",
    "title_too_long",
    "no_description",
    "description_too_short",
    "description_too_long",
    "no_image_alt",
    "no_favicon",
    "no_content_encoding",
    "high_loading_time",
    "is_http",
    "no_doctype",
    "no_title",
    "low_content_rate",
    "no_canonical",
  ];
  const issues = issueKeys.filter((key) => page?.checks?.[key] === true);

  return {
    url: page?.url ?? url,
    score: page?.onpage_score ?? null,
    title: page?.meta?.title ?? null,
    description: page?.meta?.description ?? null,
    issues,
  };
}

export type ContentMentionRow = {
  url: string | null;
  domain: string | null;
  title: string | null;
  snippet: string | null;
};

export async function fetchContentMentions(
  keyword = "strålkastarpolering"
): Promise<{ total: number | null; items: ContentMentionRow[] }> {
  const results = await dfsPost<{
    total_count?: number;
    items?: Array<{
      url?: string;
      domain?: string;
      title?: string;
      snippet?: string;
      content_info?: { title?: string; snippet?: string };
    }>;
  }>(
    "/content_analysis/search/live",
    [
      {
        keyword: `"${keyword}"`,
        search_mode: "one_per_domain",
        limit: 30,
      },
    ],
    "content analysis"
  );
  const row = results[0];
  return {
    total: row?.total_count ?? row?.items?.length ?? null,
    items: (row?.items ?? []).map((item) => ({
      url: item.url ?? null,
      domain: item.domain ?? null,
      title: item.title ?? item.content_info?.title ?? null,
      snippet: item.snippet ?? item.content_info?.snippet ?? null,
    })),
  };
}

export type AiSnapshot = {
  keywords: Array<{ keyword: string; aiSearchVolume: number | null }>;
  mentions: Array<{
    platform: string | null;
    mentions: number | null;
    aiSearchVolume: number | null;
  }>;
};

export async function fetchAiSnapshot(
  keywords = DFS_VOLUME_KEYWORDS.slice(0, 10),
  domain = DFS_DOMAIN
): Promise<AiSnapshot> {
  const [volumeRes, mentionRes] = await Promise.all([
    dfsPost<{
      items?: Array<{ keyword?: string; ai_search_volume?: number }>;
    }>(
      "/ai_optimization/ai_keyword_data/keywords_search_volume/live",
      [
        {
          keywords,
          location_code: DFS_AI_LOCATION_CODE,
          language_code: DFS_AI_LANGUAGE_CODE,
        },
      ],
      "ai keyword volume"
    ),
    dfsPost<{
      items?: Array<{
        platform?: string;
        metrics?: { mentions?: number; ai_search_volume?: number };
      }>;
    }>(
      "/ai_optimization/llm_mentions/target_metrics_lite/live",
      [
        {
          target: [
            { domain, search_filter: "include" },
            {
              keyword: "strålkastarpolering",
              search_filter: "include",
              match_type: "partial_match",
            },
          ],
          location_code: DFS_AI_LOCATION_CODE,
          language_code: DFS_AI_LANGUAGE_CODE,
          platform: "google",
        },
      ],
      "llm mentions"
    ),
  ]);

  return {
    keywords: (volumeRes[0]?.items ?? []).map((item) => ({
      keyword: item.keyword ?? "",
      aiSearchVolume: item.ai_search_volume ?? null,
    })),
    mentions: (mentionRes[0]?.items ?? []).map((item) => ({
      platform: item.platform ?? null,
      mentions: item.metrics?.mentions ?? null,
      aiSearchVolume: item.metrics?.ai_search_volume ?? null,
    })),
  };
}

export type BusinessListing = {
  title: string | null;
  category: string | null;
  address: string | null;
  phone: string | null;
  url: string | null;
  rating: number | null;
  reviews: number | null;
  cid: string | null;
};

export async function fetchBusinessListing(): Promise<BusinessListing[]> {
  const results = await dfsPost<{
    items?: Array<{
      title?: string;
      category?: string;
      address?: string;
      phone?: string;
      url?: string;
      cid?: string;
      rating?: { value?: number; votes_count?: number };
    }>;
  }>(
    "/business_data/google/my_business_info/live",
    [
      {
        keyword: DFS_BUSINESS_KEYWORD,
        location_name: DFS_BUSINESS_LOCATION,
        language_code: DFS_LANGUAGE_CODE,
      },
    ],
    "business info"
  );

  return (results[0]?.items ?? []).slice(0, 8).map((item) => ({
    title: item.title ?? null,
    category: item.category ?? null,
    address: item.address ?? null,
    phone: item.phone ?? null,
    url: item.url ?? null,
    rating: item.rating?.value ?? null,
    reviews: item.rating?.votes_count ?? null,
    cid: item.cid ?? null,
  }));
}

export type BillingSnapshot = {
  balance: number | null;
  total: number | null;
};

export async function fetchBilling(): Promise<BillingSnapshot> {
  const [row] = await dfsGet<{
    money?: { balance?: number; total?: number };
  }>("/appendix/user_data", "billing");
  return {
    balance: row?.money?.balance ?? null,
    total: row?.money?.total ?? null,
  };
}
