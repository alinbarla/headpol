import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n";
import type { ClusterDoc } from "@/lib/content/types";
import {
  BRAND,
  DATE_MODIFIED,
  LEGAL_NAME,
  LOGO_HEIGHT,
  LOGO_URL,
  LOGO_WIDTH,
  NAP,
  OG_IMAGE,
  OPENING_HOURS,
  PUBLISHED_DATE,
  SERVICE_AREAS,
  SITE_URL,
  SOCIAL_PROFILES,
  localeUrl,
} from "@/lib/seo";

/**
 * Whether the visible testimonials are real. Reviews/AggregateRating schema is
 * only emitted when this is true, to comply with Google's review snippet policy
 * and the July 2026 fake/incentivized review guideline.
 */
export const REVIEWS_ARE_REAL = false;

const ORG_ID = `${SITE_URL}/#organization`;
const BUSINESS_ID = `${SITE_URL}/#localbusiness`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const POLERING_ID = `${SITE_URL}/#service-polering`;
const RENOVERING_ID = `${SITE_URL}/#service-renovering`;

function logoImage() {
  return {
    "@type": "ImageObject",
    url: LOGO_URL,
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  };
}

function shareImage() {
  return {
    "@type": "ImageObject",
    url: OG_IMAGE.url,
    width: OG_IMAGE.width,
    height: OG_IMAGE.height,
  };
}

function areaServed() {
  return [
    {
      "@type": "AdministrativeArea",
      name: NAP.addressRegion,
    },
    ...SERVICE_AREAS.map((name) => ({
      "@type": "City",
      name,
    })),
  ];
}

function organizationNode() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: BRAND,
    legalName: LEGAL_NAME,
    alternateName: "Strålkastarpolering Stockholm",
    url: SITE_URL,
    email: NAP.email,
    telephone: NAP.phone,
    logo: logoImage(),
    image: shareImage(),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: NAP.phone,
      email: NAP.email,
      contactType: "customer service",
      areaServed: "SE",
      availableLanguage: ["sv-SE", "en-SE"],
    },
    knowsAbout: ["Strålkastarpolering", "Strålkastarrenovering"],
    ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
  };
}

function localBusinessNode(
  makesOffer: Array<{ "@id": string }>,
  description?: string
) {
  return {
    // String type (not an array): audit tools often only read the first @type
    // and miss LocalBusiness when it is listed after AutoRepair.
    "@type": "LocalBusiness",
    additionalType: "https://schema.org/AutoRepair",
    "@id": BUSINESS_ID,
    name: BRAND,
    legalName: LEGAL_NAME,
    alternateName: "Strålkastarpolering Stockholm",
    url: SITE_URL,
    email: NAP.email,
    telephone: NAP.phone,
    ...(description ? { description } : {}),
    image: OG_IMAGE.url,
    logo: logoImage(),
    priceRange: NAP.priceRange,
    currenciesAccepted: NAP.currency,
    paymentAccepted: "Credit Card, Swish",
    parentOrganization: { "@id": ORG_ID },
    address: {
      "@type": "PostalAddress",
      addressLocality: NAP.addressLocality,
      addressRegion: NAP.addressRegion,
      addressCountry: NAP.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: NAP.geo.latitude,
      longitude: NAP.geo.longitude,
    },
    areaServed: areaServed(),
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: NAP.geo.latitude,
        longitude: NAP.geo.longitude,
      },
      geoRadius: NAP.serviceRadius,
    },
    openingHours: [
      `Su ${OPENING_HOURS.sunday.opens}-${OPENING_HOURS.sunday.closes}`,
      `Mo-Fr ${OPENING_HOURS.weekdays.opens}-${OPENING_HOURS.weekdays.closes}`,
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: OPENING_HOURS.sunday.days,
        opens: OPENING_HOURS.sunday.opens,
        closes: OPENING_HOURS.sunday.closes,
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: OPENING_HOURS.weekdays.days,
        opens: OPENING_HOURS.weekdays.opens,
        closes: OPENING_HOURS.weekdays.closes,
      },
    ],
    makesOffer,
    knowsAbout: ["Strålkastarpolering", "Strålkastarrenovering"],
    ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
  };
}

/**
 * Standalone LocalBusiness JSON-LD (not nested in @graph). Naive SEO crawlers
 * look for a top-level `"@type": "LocalBusiness"` and skip @graph arrays.
 */
export function buildLocalBusinessJsonLd(description?: string) {
  return {
    "@context": "https://schema.org",
    ...localBusinessNode(
      [{ "@id": POLERING_ID }, { "@id": RENOVERING_ID }],
      description
    ),
  };
}

function websiteNode(locale: Locale) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: BRAND,
    inLanguage: locale === "sv" ? "sv-SE" : "en-SE",
    publisher: { "@id": ORG_ID },
  };
}

function offerFromPrice(
  name: string,
  description: string,
  price: string,
  offerUrl: string
): Record<string, unknown> {
  const priceMatch = price.match(/\d[\d\s]*/);
  const numericPrice = priceMatch
    ? priceMatch[0].replace(/\s/g, "")
    : undefined;

  return {
    "@type": "Offer",
    name,
    description,
    url: offerUrl,
    ...(numericPrice
      ? {
          price: numericPrice,
          priceCurrency: NAP.currency,
          priceSpecification: {
            "@type": "PriceSpecification",
            price: numericPrice,
            priceCurrency: NAP.currency,
            valueAddedTaxIncluded: true,
          },
        }
        : {}),
  };
}

function breadcrumbList(
  url: string,
  items: Array<{ name: string; item: string }>
) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

function faqPageNode(
  url: string,
  locale: Locale,
  items: Array<{ question: string; answer: string }>
) {
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    inLanguage: locale === "sv" ? "sv-SE" : "en-SE",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function webPageNode({
  url,
  name,
  description,
  locale,
  mainEntity,
}: {
  url: string;
  name: string;
  description: string;
  locale: Locale;
  mainEntity?: { "@id": string };
}) {
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: locale === "sv" ? "sv-SE" : "en-SE",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": BUSINESS_ID },
    primaryImageOfPage: shareImage(),
    datePublished: PUBLISHED_DATE,
    dateModified: DATE_MODIFIED,
    ...(mainEntity ? { mainEntity } : {}),
  };
}

export async function buildHomeStructuredData(
  locale: Locale
): Promise<Record<string, unknown>> {
  const tMeta = await getTranslations({ locale, namespace: "metadata" });
  const tServices = await getTranslations({ locale, namespace: "services" });
  const tFaq = await getTranslations({ locale, namespace: "faq" });

  const url = localeUrl(locale);
  const offersUrl =
    locale === "sv" ? localeUrl("sv", "priser") : `${url}#services`;
  const serviceItems = tServices.raw("items") as Array<{
    title: string;
    description: string;
    price: string;
  }>;
  const offers = serviceItems.map((item) =>
    offerFromPrice(item.title, item.description, item.price, offersUrl)
  );
  const faqItems = tFaq.raw("items") as Array<{
    question: string;
    answer: string;
  }>;

  const poleringName =
    locale === "sv" ? "Strålkastarpolering" : "Headlight polishing";
  const renoveringName =
    locale === "sv" ? "Strålkastarrenovering" : "Headlight restoration";

  const polering = {
    "@type": "Service",
    "@id": POLERING_ID,
    serviceType: poleringName,
    name: poleringName,
    description: tServices("subtitle"),
    provider: { "@id": BUSINESS_ID },
    areaServed: areaServed(),
    url: locale === "sv" ? localeUrl("sv", "stralkastarpolering") : url,
    offers,
  };

  const renovering = {
    "@type": "Service",
    "@id": RENOVERING_ID,
    serviceType: renoveringName,
    name: renoveringName,
    description: tServices("subtitle"),
    provider: { "@id": BUSINESS_ID },
    areaServed: areaServed(),
    url: locale === "sv" ? localeUrl("sv", "stralkastarrenovering") : url,
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      localBusinessNode(
        [{ "@id": POLERING_ID }, { "@id": RENOVERING_ID }],
        tMeta("description")
      ),
      organizationNode(),
      websiteNode(locale),
      polering,
      renovering,
      webPageNode({
        url,
        name: tMeta("title"),
        description: tMeta("description"),
        locale,
      }),
      breadcrumbList(url, [{ name: BRAND, item: url }]),
      faqPageNode(url, locale, faqItems),
    ],
  };
}

export function buildClusterStructuredData(
  page: ClusterDoc
): Record<string, unknown> {
  const url = localeUrl("sv", page.slug);
  const isPolering = page.kind === "service-polering";
  const isRenovering = page.kind === "service-renovering";
  const mainEntityId = isPolering
    ? POLERING_ID
    : isRenovering
      ? RENOVERING_ID
      : page.kind === "location"
        ? `${url}#service`
        : undefined;

  const crumbs: Array<{ name: string; item: string }> = [
    { name: BRAND, item: localeUrl("sv") },
  ];
  if (page.kind === "location" && page.locationName !== "Stockholm") {
    crumbs.push({
      name: "Stockholm",
      item: localeUrl("sv", "stralkastarpolering-stockholm"),
    });
  }
  crumbs.push({
    name: page.locationName ?? page.h1,
    item: url,
  });

  const graph: Record<string, unknown>[] = [
    localBusinessNode(
      [{ "@id": POLERING_ID }, { "@id": RENOVERING_ID }],
      page.description
    ),
    organizationNode(),
    websiteNode("sv"),
    webPageNode({
      url,
      name: page.title,
      description: page.description,
      locale: "sv",
      mainEntity: mainEntityId ? { "@id": mainEntityId } : undefined,
    }),
    breadcrumbList(url, crumbs),
  ];

  if (isPolering || isRenovering) {
    graph.push({
      "@type": "Service",
      "@id": isPolering ? POLERING_ID : RENOVERING_ID,
      serviceType: isPolering
        ? "Strålkastarpolering"
        : "Strålkastarrenovering",
      name: page.h1,
      description: page.description,
      provider: { "@id": BUSINESS_ID },
      areaServed: areaServed(),
      url,
    });
  }

  if (page.kind === "location" && page.locationName) {
    graph.push({
      "@type": "Service",
      "@id": `${url}#service`,
      serviceType: "Strålkastarpolering",
      name: page.h1,
      description: page.description,
      provider: { "@id": BUSINESS_ID },
      areaServed: {
        "@type": "City",
        name: page.locationName,
      },
      url,
    });
  }

  // FAQ rich results no longer show in Google Search (May 2026), but FAQPage
  // still describes visible Q&A for crawlers and other engines.
  if (page.faqs?.length) {
    graph.push(faqPageNode(url, "sv", page.faqs));
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
