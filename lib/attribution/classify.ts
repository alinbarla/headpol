import {
  MAX_GCLID_LENGTH,
  MAX_LANDING_PATH_LENGTH,
  MAX_REFERRER_HOST_LENGTH,
  MAX_UTM_LENGTH,
} from "@/lib/attribution/constants";
import type { AcquisitionChannel } from "@/lib/supabase/server";

export type AttributionInput = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  gclid: string | null;
  landingPath: string | null;
  referrerHost: string | null;
};

export type ClassifiedAttribution = AttributionInput & {
  channel: AcquisitionChannel;
};

const PAID_MEDIA = new Set(["cpc", "ppc", "paid", "paidsearch", "paid_search"]);

const SEARCH_ENGINE_HOST_RE =
  /(?:^|\.)(?:google|bing|yahoo|duckduckgo|baidu|yandex|ecosia|search\.brave)(?:\.[a-z.]+)?$/i;

const GOOGLE_ADS_SOURCES = new Set([
  "googleads",
  "google_ads",
  "google-ads",
  "adwords",
]);

function truncate(value: string | null | undefined, max: number): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function lower(value: string | null): string | null {
  return value ? value.toLowerCase() : null;
}

/** Strip to hostname; return null for empty / invalid / same-site noise. */
export function sanitizeReferrerHost(
  raw: string | null | undefined,
  siteHost?: string | null
): string | null {
  const truncated = truncate(raw, MAX_REFERRER_HOST_LENGTH);
  if (!truncated) return null;

  let host = truncated;
  try {
    if (truncated.includes("://")) {
      host = new URL(truncated).hostname;
    } else {
      host = truncated.split("/")[0]?.split(":")[0] ?? truncated;
    }
  } catch {
    host = truncated.split("/")[0] ?? truncated;
  }

  host = host.replace(/^www\./i, "").toLowerCase();
  if (!host || host === "localhost" || host === "127.0.0.1") return null;

  if (siteHost) {
    const site = siteHost.replace(/^www\./i, "").toLowerCase();
    if (host === site || host.endsWith(`.${site}`)) return null;
  }

  return truncate(host, MAX_REFERRER_HOST_LENGTH);
}

/**
 * Keep path + marketing query params; drop other query keys.
 */
export function sanitizeLandingPath(
  pathWithSearch: string | null | undefined
): string | null {
  const truncated = truncate(pathWithSearch, MAX_LANDING_PATH_LENGTH);
  if (!truncated) return null;

  try {
    const url = truncated.startsWith("http")
      ? new URL(truncated)
      : new URL(truncated, "https://example.invalid");

    const keep = new URLSearchParams();
    for (const key of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "gclid",
    ]) {
      const value = url.searchParams.get(key);
      if (value) keep.set(key, value.slice(0, MAX_UTM_LENGTH));
    }

    const qs = keep.toString();
    const path = `${url.pathname}${qs ? `?${qs}` : ""}`;
    return truncate(path, MAX_LANDING_PATH_LENGTH);
  } catch {
    return truncate(truncated.split("#")[0] ?? truncated, MAX_LANDING_PATH_LENGTH);
  }
}

export function sanitizeAttributionInput(
  raw: Partial<AttributionInput> | null | undefined
): AttributionInput {
  return {
    utmSource: truncate(raw?.utmSource, MAX_UTM_LENGTH),
    utmMedium: truncate(raw?.utmMedium, MAX_UTM_LENGTH),
    utmCampaign: truncate(raw?.utmCampaign, MAX_UTM_LENGTH),
    utmContent: truncate(raw?.utmContent, MAX_UTM_LENGTH),
    utmTerm: truncate(raw?.utmTerm, MAX_UTM_LENGTH),
    gclid: truncate(raw?.gclid, MAX_GCLID_LENGTH),
    landingPath: sanitizeLandingPath(raw?.landingPath),
    referrerHost: sanitizeReferrerHost(raw?.referrerHost),
  };
}

export function isPaidTouch(input: AttributionInput): boolean {
  if (input.gclid) return true;
  const medium = lower(input.utmMedium);
  if (medium && PAID_MEDIA.has(medium)) return true;
  const source = lower(input.utmSource);
  if (source && GOOGLE_ADS_SOURCES.has(source)) return true;
  if (source === "google" && medium && PAID_MEDIA.has(medium)) return true;
  return false;
}

export function isOrganicSearchTouch(input: AttributionInput): boolean {
  if (!input.referrerHost) return false;
  if (isPaidTouch(input)) return false;
  return SEARCH_ENGINE_HOST_RE.test(input.referrerHost);
}

export function classifyAcquisition(
  raw: Partial<AttributionInput> | null | undefined
): ClassifiedAttribution {
  const input = sanitizeAttributionInput(raw);

  let channel: AcquisitionChannel;
  if (isPaidTouch(input)) {
    channel = "google_ads";
  } else if (isOrganicSearchTouch(input)) {
    channel = "organic_search";
  } else if (input.referrerHost) {
    channel = "referral";
  } else if (
    input.utmSource ||
    input.utmMedium ||
    input.utmCampaign ||
    input.landingPath
  ) {
    // UTMs without paid medium, and no external referrer → treat as direct/campaign
    // only if medium looks organic; otherwise still direct when empty referrer.
    const medium = lower(input.utmMedium);
    if (medium === "organic" || medium === "seo") {
      channel = "organic_search";
    } else if (medium) {
      channel = "referral";
    } else {
      channel = "direct";
    }
  } else {
    channel = "direct";
  }

  return { ...input, channel };
}

/** True when this touch should replace a stored last non-direct attribution. */
export function isNonDirectChannel(channel: AcquisitionChannel): boolean {
  return (
    channel === "google_ads" ||
    channel === "organic_search" ||
    channel === "referral"
  );
}

export function parseLandingAttribution(input: {
  href: string;
  referrer: string;
  siteHost?: string | null;
}): AttributionInput {
  let path = "/";
  let search = "";
  try {
    const url = new URL(input.href);
    path = url.pathname || "/";
    search = url.search;
  } catch {
    path = "/";
  }

  const params = new URLSearchParams(search);
  const landingPath = sanitizeLandingPath(`${path}${search}`);

  return sanitizeAttributionInput({
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    utmContent: params.get("utm_content"),
    utmTerm: params.get("utm_term"),
    gclid: params.get("gclid"),
    landingPath,
    referrerHost: sanitizeReferrerHost(input.referrer || null, input.siteHost),
  });
}
