"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_DISPLAY } from "@/lib/booking";
import { AREA_PAGE_SLUGS, SERVICE_AREAS } from "@/lib/seo";

export function Footer() {
  const t = useTranslations("footer");
  const tContact = useTranslations("contact");
  const tNav = useTranslations("nav");
  const tLegal = useTranslations("legal");
  const year = new Date().getFullYear();

  const links = [
    { href: "/", label: tNav("home") },
    { href: "/stralkastarpolering", label: "Polera strålkastare" },
    { href: "/stralkastarrenovering", label: "Strålkastarrenovering" },
    { href: "/priser", label: tNav("services") },
    { href: "/foretagskunder", label: "Företag" },
    { href: "/fore-bilder", label: "Före & efter" },
    { href: "/faq", label: tNav("faq") },
    { href: "/om-oss", label: tNav("about") },
    { href: "/#booking", label: tNav("booking") },
  ];

  const areaLinks = SERVICE_AREAS.map((area) => ({
    href: `/${AREA_PAGE_SLUGS[area]}`,
    label: area,
  }));

  return (
    <footer id="contact" className="section-anchor border-t border-white/10 py-16">
      <Container>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <p className="headline-display text-2xl font-bold text-beam">
              {tNav("brand")}
            </p>
            <p className="mt-3 text-text-secondary">{t("tagline")}</p>
          </div>

          <div className="grid flex-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:pl-8">
            <nav aria-label={t("clusterLabel")}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-beam">
                {t("clusterLabel")}
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="cursor-pointer transition-colors hover:text-beam"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label={t("areasLabel")}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-beam">
                {t("areasLabel")}
              </h3>
              <ul className="mt-4 columns-2 gap-x-6 space-y-2 text-sm text-text-secondary">
                {areaLinks.map((link) => (
                  <li key={link.href} className="break-inside-avoid">
                    <Link
                      href={link.href}
                      className="cursor-pointer transition-colors hover:text-beam"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-beam">
                {tContact("title")}
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                <li>
                  <a href={`tel:${CONTACT_PHONE}`} className="cursor-pointer transition-colors hover:text-beam">
                    {CONTACT_PHONE_DISPLAY}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="cursor-pointer transition-colors hover:text-beam">
                    {CONTACT_EMAIL}
                  </a>
                </li>
                <li>{tContact("area")}</li>
                <li>{tContact("hours")}</li>
              </ul>
              <ul className="mt-6 space-y-2 text-sm text-text-secondary">
                <li>
                  <Link
                    href="/villkor"
                    className="cursor-pointer transition-colors hover:text-beam"
                  >
                    {tLegal("terms")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/integritetspolicy"
                    className="cursor-pointer transition-colors hover:text-beam"
                  >
                    {tLegal("privacy")}
                  </Link>
                </li>
              </ul>
              <p className="mt-4 text-xs text-text-muted" suppressHydrationWarning>
                {t("copyright", { year })}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
