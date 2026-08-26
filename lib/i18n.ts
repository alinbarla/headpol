import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sv", "en"],
  defaultLocale: "sv",
  localeDetection: false,
  // Hreflang is set per page in generateMetadata. The middleware Link header
  // would advertise /en/{cluster-slug} URLs that 404.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
