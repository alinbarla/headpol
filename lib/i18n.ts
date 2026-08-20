import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sv", "en"],
  defaultLocale: "sv",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
