import type { MetadataRoute } from "next";
import { CONFIRMATION_PATH } from "@/lib/routes";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The admin also gets a host-scoped X-Robots-Tag in next.config.ts,
        // because it is served from this same deployment.
        disallow: ["/api/", "/admin", `/${CONFIRMATION_PATH}`],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    // Do not emit `Host:`. Google ignores it; Next would serialize SITE_URL
    // (with https://), which is an invalid Host value for the bots that do
    // honor the directive.
  };
}
