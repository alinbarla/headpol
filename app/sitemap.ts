import type { MetadataRoute } from "next";
import { LOCALES, localeUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** Legal pages that exist per locale alongside the single marketing page. */
const LEGAL_PATHS = ["villkor", "integritetspolicy"];

/** The marketing site is one page per locale. Hreflang lives in page <head>, not here —
 *  xhtml:link in a sitemap makes Chrome parse it as HTML (tags disappear). */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date().toISOString().slice(0, 10);

  const home: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: localeUrl(locale),
    lastModified,
    changeFrequency: "weekly",
    priority: 1,
  }));

  const legal: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    LEGAL_PATHS.map((path) => ({
      url: `${localeUrl(locale)}/${path}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    }))
  );

  return [...home, ...legal];
}
