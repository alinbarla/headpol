"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { isClusterSlug } from "@/lib/content/slugs";

type NavItem = {
  href: string;
  label: string;
};

function NavLinks({
  items,
  locale,
  pathname,
  className,
}: {
  items: NavItem[];
  locale: string;
  pathname: string;
  className?: string;
}) {
  return (
    <ul className={className}>
      {items.map((item) => {
        const slug = item.href.startsWith(`/${locale}/`)
          ? item.href.slice(`/${locale}/`.length)
          : "";
        const active =
          Boolean(slug) && pathname === item.href && isClusterSlug(slug);
        const itemClass = `cursor-pointer font-display text-sm font-semibold transition-colors ${
          active ? "text-beam" : "text-text-secondary hover:text-beam"
        }`;

        return (
          <li key={item.href}>
            {item.href.includes("#") ? (
              <a href={item.href} className={itemClass}>
                {item.label}
              </a>
            ) : (
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={itemClass}
              >
                {item.label}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function SiteHeader() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const isHome =
    pathname === `/${locale}` || pathname === `/${locale}/`;

  const bookingHref = isHome ? "#booking" : `/${locale}#booking`;

  const items: NavItem[] =
    locale === "sv"
      ? [
          { href: "/sv/stralkastarpolering", label: t("polishing") },
          { href: "/sv/stralkastarrenovering", label: t("restoration") },
          { href: "/sv/priser", label: t("services") },
          { href: "/sv/faq", label: t("faq") },
          { href: bookingHref, label: t("booking") },
        ]
      : [
          { href: isHome ? "#services" : "/en#services", label: t("services") },
          { href: isHome ? "#faq" : "/en#faq", label: t("faq") },
          { href: bookingHref, label: t("booking") },
        ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-void/70 backdrop-blur-xl">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-beam focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-void"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          href={`/${locale}`}
          className="headline-display cursor-pointer text-xl font-bold tracking-tight text-beam"
        >
          {t("brand")}
        </Link>

        <nav className="hidden md:block" aria-label="Primary">
          <NavLinks
            items={items}
            locale={locale}
            pathname={pathname}
            className="flex items-center gap-5"
          />
        </nav>

        <div className="flex items-center gap-2">
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-full border border-white/15 px-3 py-1.5 font-display text-sm font-semibold text-text-secondary hover:text-beam [&::-webkit-details-marker]:hidden">
              {t("menu")}
            </summary>
            <nav
              aria-label="Primary"
              className="absolute right-0 mt-2 min-w-48 rounded-xl border border-white/10 bg-void-elevated p-3 shadow-lg"
            >
              <NavLinks
                items={items}
                locale={locale}
                pathname={pathname}
                className="flex flex-col gap-3"
              />
            </nav>
          </details>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
