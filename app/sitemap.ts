import type { MetadataRoute } from "next";
import { routing } from "@/lib/i18n";
import { LOCALES, localeUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** Single-page site: home route per locale, cross-linked via hreflang alternates. */
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: localeUrl(locale, route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: {
          "x-default": localeUrl(routing.defaultLocale, route.path),
          ...Object.fromEntries(
            LOCALES.map((loc) => [
              loc === "sv" ? "sv-SE" : "en-US",
              localeUrl(loc, route.path),
            ])
          ),
        },
      },
    }))
  );
}
