import type { Metadata } from "next";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/booking";
import { routing, type Locale } from "@/lib/i18n";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelHost) {
    return `https://${vercelHost.replace(/^https?:\/\//, "")}`;
  }

  return "https://stralkastarpolering.se";
}

/** Canonical production origin (no trailing slash). */
export const SITE_URL = resolveSiteUrl();

export const BRAND = "Strålkastarpolering";
export const LEGAL_NAME = "Strålkastarpolering";

/** Stable first-publish date for the site (ISO 8601), used in WebPage schema. */
export const PUBLISHED_DATE =
  process.env.NEXT_PUBLIC_PUBLISHED_DATE ?? "2026-01-01";

/** Last meaningful public-content change. Do not use `new Date()` in schema. */
export const DATE_MODIFIED = "2026-08-29";

/** Optional Google Search Console verification token. */
export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "";

/** Google Ads account for the gtag.js tag. Set to "" to disable tracking. */
export const GOOGLE_ADS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "AW-18407352152";

/**
 * Google Tag Manager container. Loaded only on the admin host. The public
 * site uses the Google tag (gtag.js) alone — Google Ads flags pages that
 * ship both a Google tag and a GTM container.
 */
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-WKQJ9N3L";

/** Purchase conversion send_to (account / conversion label). */
export const GOOGLE_ADS_PURCHASE_SEND_TO =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO ??
  "AW-18407352152/nfWqCO7v0eccENjOp8lE";

export const LOCALES = routing.locales;
export const DEFAULT_LOCALE = routing.defaultLocale;

/** Default Open Graph / social share image (1200x630). */
export const OG_IMAGE = {
  url: `${SITE_URL}/opengraph-image`,
  width: 1200,
  height: 630,
};

/** Logo used for Organization / LocalBusiness structured data (PNG ≥112px). */
export const LOGO_URL = `${SITE_URL}/apple-icon`;
export const LOGO_WIDTH = 180;
export const LOGO_HEIGHT = 180;

/**
 * Service-area business: no public street address. We expose city-level
 * locality plus a geo circle describing the area we travel to.
 */
export const NAP = {
  name: BRAND,
  legalName: LEGAL_NAME,
  email: CONTACT_EMAIL,
  /** E.164, schema/tel friendly. */
  phone: `+${CONTACT_PHONE.replace(/[^\d]/g, "")}`,
  addressLocality: "Stockholm",
  addressRegion: "Stockholms län",
  postalRegion: "SE",
  addressCountry: "SE",
  /** Approx. Stockholm centre. */
  geo: { latitude: 59.3293, longitude: 18.0686 },
  /** Travel radius in metres (~40 km around Stockholm). */
  serviceRadius: 40000,
  priceRange: "799 kr",
  currency: "SEK",
} as const;

/** Schema.org opening hours. Sat–Sun is a longer window than Mon–Fri. */
export const OPENING_HOURS = {
  weekdays: {
    days: [
      "https://schema.org/Monday",
      "https://schema.org/Tuesday",
      "https://schema.org/Wednesday",
      "https://schema.org/Thursday",
      "https://schema.org/Friday",
    ],
    opens: "16:00",
    closes: "20:00",
  },
  saturday: {
    days: ["https://schema.org/Saturday"],
    opens: "08:00",
    closes: "20:00",
  },
  sunday: {
    days: ["https://schema.org/Sunday"],
    opens: "08:00",
    closes: "20:00",
  },
} as const;

/** Areas we serve, surfaced in copy and AreaServed schema for local relevance. */
export const SERVICE_AREAS = [
  "Stockholm",
  "Solna",
  "Sundbyberg",
  "Nacka",
  "Täby",
  "Lidingö",
  "Huddinge",
  "Tumba",
  "Södertälje",
  "Haninge",
  "Järfälla",
  "Sollentuna",
  "Danderyd",
];

/** Swedish cluster pages for municipalities that have unique local copy. */
export const AREA_PAGE_SLUGS: Record<string, string> = {
  Stockholm: "stralkastarpolering-stockholm",
  Solna: "stralkastarpolering-solna",
  Nacka: "stralkastarpolering-nacka",
  Huddinge: "stralkastarpolering-huddinge",
  Tumba: "stralkastarpolering-tumba",
  Södertälje: "stralkastarpolering-sodertalje",
  Haninge: "stralkastarpolering-haninge",
};

export const SOCIAL_PROFILES: string[] = [
  // Add real profiles (Google Business, Facebook, Instagram) when available.
];

/** Per-locale keyword sets (used in <meta keywords> and content guidance). */
export const KEYWORDS: Record<Locale, string[]> = {
  sv: [
    "strålkastarpolering",
    "strålkastarpolering Stockholm",
    "strålkastare restaurering",
    "polera strålkastare",
    "strålkastarrenovering",
    "strålkastarrenovering Stockholm",
    "renovera strålkastare",
    "blanka strålkastare",
    "gulnade strålkastare",
    "matta strålkastare",
    "repiga strålkastare",
    "strålkastare besiktning",
    "rengöra strålkastare",
    "bil strålkastare Stockholm",
  ],
  en: [
    "headlight restoration Stockholm",
    "headlight polishing Stockholm",
    "headlight restoration",
    "cloudy headlights",
    "yellow headlights",
    "foggy headlights",
    "scratched headlights",
    "restore headlights",
    "headlight UV coating",
    "car headlight repair Stockholm",
  ],
};

export function localeUrl(locale: string, path = ""): string {
  const clean = path ? `/${path.replace(/^\//, "")}` : "";
  return `${SITE_URL}/${locale}${clean}`;
}

/** BCP 47 language tags for <html lang> and hreflang. */
export function htmlLang(locale: string): string {
  return locale === "sv" ? "sv-SE" : "en-SE";
}

/** OG locale codes (underscore form). */
export function ogLocale(locale: string): string {
  return locale === "sv" ? "sv_SE" : "en_SE";
}

/** hreflang map for pages that exist in both Swedish and English. */
export function languageAlternates(path = ""): Record<string, string> {
  return {
    "sv-SE": localeUrl("sv", path),
    "en-SE": localeUrl("en", path),
    "x-default": localeUrl("sv", path),
  };
}

/**
 * Per-page title, description, canonical and (when the page exists in both
 * languages) hreflang. Layout metadata must not set canonical/languages.
 */
export function buildPageMetadata({
  locale,
  path = "",
  title,
  description,
  bilingual = false,
  absoluteTitle = false,
}: {
  locale: string;
  path?: string;
  title: string;
  description: string;
  bilingual?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const canonical = localeUrl(locale, path);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      ...(bilingual ? { languages: languageAlternates(path) } : {}),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: ogLocale(locale),
      ...(bilingual
        ? {
            alternateLocale: LOCALES.filter((item) => item !== locale).map(
              ogLocale
            ),
          }
        : {}),
      images: [
        {
          url: OG_IMAGE.url,
          width: OG_IMAGE.width,
          height: OG_IMAGE.height,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
