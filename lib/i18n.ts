import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sv"],
  defaultLocale: "sv",
  localeDetection: false,
  localePrefix: "never",
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
