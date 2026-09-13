/** localStorage key for last non-direct marketing touch. */
export const ATTRIBUTION_STORAGE_KEY = "booking_attribution_v1";

/** How long a stored non-direct touch stays valid. */
export const ATTRIBUTION_TTL_DAYS = 30;

export const MAX_UTM_LENGTH = 200;
export const MAX_GCLID_LENGTH = 200;
export const MAX_LANDING_PATH_LENGTH = 400;
export const MAX_REFERRER_HOST_LENGTH = 200;

/**
 * Known referral products (AI assistants, social, etc.).
 * Used for admin labels and to keep AI Google hosts out of organic search.
 */
export const KNOWN_REFERRER_SOURCES = [
  {
    label: "ChatGPT",
    hosts: ["chatgpt.com", "chat.openai.com"],
    utmSources: ["chatgpt", "chatgpt.com", "openai", "chat.openai.com"],
  },
  {
    label: "Claude",
    hosts: ["claude.ai"],
    utmSources: ["claude", "claude.ai", "anthropic"],
  },
  {
    label: "Gemini",
    hosts: ["gemini.google.com", "bard.google.com"],
    utmSources: ["gemini", "bard", "gemini.google.com"],
  },
  {
    label: "Perplexity",
    hosts: ["perplexity.ai"],
    utmSources: ["perplexity", "perplexity.ai"],
  },
  {
    label: "Copilot",
    hosts: ["copilot.microsoft.com"],
    utmSources: ["copilot", "bingcopilot"],
  },
  {
    label: "Facebook",
    hosts: ["facebook.com", "fb.com", "m.facebook.com", "l.facebook.com"],
    utmSources: ["facebook", "fb", "facebook.com"],
  },
  {
    label: "Instagram",
    hosts: ["instagram.com", "l.instagram.com"],
    utmSources: ["instagram", "ig", "instagram.com"],
  },
  {
    label: "TikTok",
    hosts: ["tiktok.com"],
    utmSources: ["tiktok", "tiktok.com"],
  },
] as const;

/** Common referral hosts offered when creating a manual booking. */
export const MANUAL_REFERRAL_PRESETS = [
  { value: "chatgpt.com", label: "ChatGPT" },
  { value: "claude.ai", label: "Claude" },
  { value: "gemini.google.com", label: "Gemini" },
  { value: "perplexity.ai", label: "Perplexity" },
  { value: "facebook.com", label: "Facebook" },
  { value: "instagram.com", label: "Instagram" },
  { value: "tiktok.com", label: "TikTok" },
] as const;

export const MANUAL_REFERRAL_OTHER = "__other__";

function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/^www\./, "");
}

/** True when host is exactly knownHost or a subdomain of it. */
export function hostMatchesReferrer(
  host: string,
  knownHost: string
): boolean {
  const h = normalizeHost(host);
  const known = normalizeHost(knownHost);
  return h === known || h.endsWith(`.${known}`);
}

export function knownReferrerLabelForHost(
  host: string | null | undefined
): string | null {
  if (!host?.trim()) return null;
  const normalized = normalizeHost(host);
  for (const source of KNOWN_REFERRER_SOURCES) {
    for (const knownHost of source.hosts) {
      if (hostMatchesReferrer(normalized, knownHost)) {
        return source.label;
      }
    }
  }
  return null;
}

export function knownReferrerLabelForUtmSource(
  utmSource: string | null | undefined
): string | null {
  if (!utmSource?.trim()) return null;
  const normalized = utmSource.trim().toLowerCase();
  for (const source of KNOWN_REFERRER_SOURCES) {
    for (const value of source.utmSources) {
      if (normalized === value || normalized === value.replace(/\./g, "")) {
        return source.label;
      }
    }
  }
  return null;
}

/**
 * Friendly referral/product label for admin UI.
 * Prefers referrer host, then utm_source. Unknown hosts fall back to the raw
 * hostname so existing behaviour stays readable.
 */
export function referrerSourceLabel(
  host: string | null | undefined,
  utmSource?: string | null
): string | null {
  if (host?.trim()) {
    return knownReferrerLabelForHost(host) ?? normalizeHost(host);
  }
  return knownReferrerLabelForUtmSource(utmSource);
}

/** Hosts that must not be classified as organic search (AI / product surfaces). */
export function isKnownProductReferrerHost(
  host: string | null | undefined
): boolean {
  return knownReferrerLabelForHost(host) != null;
}
