"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { routing, type Locale } from "@/lib/i18n";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("nav");

  const switchLocale = (nextLocale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    router.push(segments.join("/") || `/${nextLocale}`);
  };

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-white/15 bg-void-elevated/80 p-1 backdrop-blur-sm"
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchLocale(loc)}
          aria-pressed={locale === loc}
          className={`min-h-9 min-w-9 rounded-full px-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
            locale === loc
              ? "bg-beam text-void"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {loc}
        </button>
      ))}
      <span className="sr-only">{t("brand")}</span>
    </div>
  );
}
