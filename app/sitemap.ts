import type { MetadataRoute } from "next";
import { CLUSTER_SLUGS } from "@/lib/content/slugs";
import { DATE_MODIFIED, localeUrl } from "@/lib/seo";

export const dynamic = "force-static";

const LEGAL_PATHS = ["villkor", "integritetspolicy"];

/** Hreflang lives in page <head>, not here — xhtml:link in a sitemap makes
 *  Chrome parse it as HTML (tags disappear). */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = DATE_MODIFIED;

  const home: MetadataRoute.Sitemap = [
    {
      url: localeUrl("sv"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const legal: MetadataRoute.Sitemap = LEGAL_PATHS.map((path) => ({
    url: localeUrl("sv", path),
    lastModified,
    changeFrequency: "yearly" as const,
    priority: 0.2,
  }));

  const cluster: MetadataRoute.Sitemap = CLUSTER_SLUGS.map((slug) => ({
    url: localeUrl("sv", slug),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: slug.startsWith("stralkastarpolering") ? 0.8 : 0.7,
  }));

  return [...home, ...cluster, ...legal];
}
