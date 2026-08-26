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

/** Optional Google Search Console verification token. */
export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "";

/** Google Ads account for the gtag.js tag. Set to "" to disable tracking. */
export const GOOGLE_ADS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "AW-18407352152";

/** Google Tag Manager container. Set to "" to disable GTM. */
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

/** Logo used for Organization / LocalBusiness structured data. */
export const LOGO_URL = `${SITE_URL}/icon.svg`;

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

/** Schema.org opening hours. Sunday is a longer window than Mon–Fri. */
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
  "Järfälla",
  "Sollentuna",
  "Danderyd",
];

export const SOCIAL_PROFILES: string[] = [
  // Add real profiles (Google Business, Facebook, Instagram) when available.
];

/** Per-locale keyword sets (used in <meta keywords> and content guidance). */
export const KEYWORDS: Record<Locale, string[]> = {
  sv: [
    "strålkastarepolering",
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

/** OG locale codes. */
export function ogLocale(locale: string): string {
  return locale === "sv" ? "sv_SE" : "en_US";
}
