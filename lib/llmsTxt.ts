import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/booking";
import { allClusterPages } from "@/lib/content/pages";
import type { ClusterDoc } from "@/lib/content/types";
import {
  BRAND,
  NAP,
  OPENING_HOURS,
  SERVICE_AREAS,
  localeUrl,
} from "@/lib/seo";

function link(title: string, url: string, description: string) {
  return `- [${title}](${url}): ${description}`;
}

function pageLink(page: ClusterDoc) {
  return link(page.h1, localeUrl("sv", page.slug), page.description);
}

function pagesOf(...kinds: ClusterDoc["kind"][]): ClusterDoc[] {
  return allClusterPages().filter((page) => kinds.includes(page.kind));
}

/**
 * Markdown for `/llms.txt` (https://llmstxt.org). Built from the same page
 * list as the sitemap so new cluster URLs show up automatically.
 */
export function buildLlmsTxt(): string {
  const services = pagesOf("service-polering", "service-renovering");
  const info = pagesOf("other", "faq");
  const locations = pagesOf("location");

  const hours = `sön ${OPENING_HOURS.sunday.opens}–${OPENING_HOURS.sunday.closes}, mån–fre ${OPENING_HOURS.weekdays.opens}–${OPENING_HOURS.weekdays.closes} (lör stängt)`;

  return [
    `# ${BRAND}`,
    "",
    `> Mobil strålkastarpolering och strålkastarrenovering i ${NAP.addressLocality}. UV-keramiskt skydd, ${NAP.priceRange}/par och 5 års garanti. Vi kommer till kunden — ingen inlämningsverkstad.`,
    "",
    `${BRAND} är en mobil tjänst i ${NAP.addressRegion}. Vi våtslipar, polerar och lägger UV-keramiskt skydd på oxiderade plaststrålkastare. Fast pris, ingen zonavgift inom ungefär 40 km från ${NAP.addressLocality}. Öppet ${hours}. Telefon ${CONTACT_PHONE_DISPLAY}, e-post ${CONTACT_EMAIL}. Områden: ${SERVICE_AREAS.join(", ")}.`,
    "",
    "## Startsida",
    "",
    link(
      `${BRAND} på svenska`,
      localeUrl("sv"),
      "Boka tid, priser, process och vanliga frågor."
    ),
    link(
      `${BRAND} in English`,
      localeUrl("en"),
      "Headlight polishing and restoration in Stockholm. We come to you."
    ),
    "",
    "## Tjänster",
    "",
    ...services.map(pageLink),
    "",
    "## Information",
    "",
    ...info.map(pageLink),
    "",
    "## Områden",
    "",
    ...locations.map(pageLink),
    "",
    "## Optional",
    "",
    link(
      "Villkor och avbokning",
      localeUrl("sv", "villkor"),
      "Avbokning, ångerrätt, betalning och reklamationsregler."
    ),
    link(
      "Integritetspolicy",
      localeUrl("sv", "integritetspolicy"),
      "Hur personuppgifter hanteras vid bokning."
    ),
    "",
  ].join("\n");
}
