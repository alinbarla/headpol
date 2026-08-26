import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n";
import {
  BRAND,
  LEGAL_NAME,
  LOGO_URL,
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
 * only emitted when this is true, to comply with Google's review snippet policy.
 */
export const REVIEWS_ARE_REAL = false;

export async function buildStructuredData(
  locale: Locale
): Promise<Record<string, unknown>> {
  const tMeta = await getTranslations({ locale, namespace: "metadata" });
  const tFaq = await getTranslations({ locale, namespace: "faq" });
  const tServices = await getTranslations({ locale, namespace: "services" });

  const url = localeUrl(locale);
  const orgId = `${SITE_URL}/#organization`;
  const businessId = `${SITE_URL}/#localbusiness`;
  const websiteId = `${SITE_URL}/#website`;
  const serviceId = `${SITE_URL}/#service`;
  const webPageId = `${url}#webpage`;

  const areaServed = SERVICE_AREAS.map((name) => ({
    "@type": "City",
    name,
  }));

  const serviceTypeName =
    locale === "sv" ? "Strålkastarepolering" : "Headlight restoration";

  // Swedish customers search for the job under two different nouns. Naming both
  // keeps the schema honest about what the service is rather than picking one.
  const serviceAlternateName =
    locale === "sv" ? "Strålkastarrenovering" : "Headlight polishing";

  const faqItems = tFaq.raw("items") as Array<{ question: string; answer: string }>;
  const serviceItems = tServices.raw("items") as Array<{
    title: string;
    description: string;
    price: string;
  }>;

  const organization = {
    "@type": "Organization",
    "@id": orgId,
    name: BRAND,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    email: NAP.email,
    telephone: NAP.phone,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
    },
    image: OG_IMAGE.url,
    ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
  };

  const localBusiness = {
    "@type": ["AutoRepair", "LocalBusiness"],
    "@id": businessId,
    name: BRAND,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    email: NAP.email,
    telephone: NAP.phone,
    image: OG_IMAGE.url,
    logo: LOGO_URL,
    priceRange: NAP.priceRange,
    currenciesAccepted: NAP.currency,
    parentOrganization: { "@id": orgId },
    address: {
      "@type": "PostalAddress",
      addressLocality: NAP.addressLocality,
      addressRegion: NAP.addressRegion,
      addressCountry: NAP.addressCountry,
    },
    areaServed,
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: NAP.geo.latitude,
        longitude: NAP.geo.longitude,
      },
      geoRadius: NAP.serviceRadius,
    },
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
    makesOffer: { "@id": serviceId },
    ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
  };

  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: SITE_URL,
    name: BRAND,
    inLanguage: locale === "sv" ? "sv-SE" : "en-US",
    publisher: { "@id": orgId },
  };

  const service = {
    "@type": "Service",
    "@id": serviceId,
    serviceType: serviceTypeName,
    alternateName: serviceAlternateName,
    name: tServices("title"),
    description: tServices("subtitle"),
    provider: { "@id": businessId },
    areaServed,
    offers: serviceItems.map((item) => {
      const priceMatch = item.price.match(/\d[\d\s]*/);
      const numericPrice = priceMatch ? priceMatch[0].replace(/\s/g, "") : undefined;
      return {
        "@type": "Offer",
        name: item.title,
        description: item.description,
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
        availability: "https://schema.org/InStock",
      };
    }),
  };

  const webPage = {
    "@type": "WebPage",
    "@id": webPageId,
    url,
    name: tMeta("title"),
    description: tMeta("description"),
    inLanguage: locale === "sv" ? "sv-SE" : "en-US",
    isPartOf: { "@id": websiteId },
    about: { "@id": businessId },
    primaryImageOfPage: OG_IMAGE.url,
    datePublished: PUBLISHED_DATE,
    dateModified: new Date().toISOString().slice(0, 10),
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: BRAND,
        item: url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: serviceTypeName,
        item: `${url}#services`,
      },
    ],
  };

  const faqPage = {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    inLanguage: locale === "sv" ? "sv-SE" : "en-US",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, localBusiness, website, service, webPage, breadcrumb, faqPage],
  };
}
