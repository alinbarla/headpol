import type { MetadataRoute } from "next";
import { LOCALES, localeUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** Single-page site: home route per locale. Hreflang lives in page <head>, not here —
 *  xhtml:link in a sitemap makes Chrome parse it as HTML (tags disappear). */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date().toISOString().slice(0, 10);

  return LOCALES.map((locale) => ({
    url: localeUrl(locale),
    lastModified,
    changeFrequency: "weekly",
    priority: 1,
  }));
}
