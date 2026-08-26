"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { Container } from "@/components/ui/Container";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_DISPLAY } from "@/lib/booking";

const footerLinks = [
  { id: "benefits", key: "benefits" as const },
  { id: "process", key: "process" as const },
  { id: "services", key: "services" as const },
  { id: "booking", key: "booking" as const },
  { id: "faq", key: "faq" as const },
];

export function Footer() {
  const t = useTranslations("footer");
  const tContact = useTranslations("contact");
  const tNav = useTranslations("nav");
  const tLegal = useTranslations("legal");
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="section-anchor border-t border-white/10 py-16">
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="headline-display text-2xl font-bold text-beam">
              {tNav("brand")}
            </p>
            <p className="mt-3 text-text-secondary">{t("tagline")}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <nav aria-label={t("navLabel")}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-beam">
                {t("navLabel")}
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                {footerLinks.map((link) => (
                  <li key={link.id}>
                    <a href={`#${link.id}`} className="cursor-pointer transition-colors hover:text-beam">
                      {tNav(link.key)}
                    </a>
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
            </div>

            <div className="flex flex-col items-start gap-4">
              <LocaleSwitcher />
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <Link
                    href={`/${locale}/villkor`}
                    className="cursor-pointer transition-colors hover:text-beam"
                  >
                    {tLegal("terms")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/integritetspolicy`}
                    className="cursor-pointer transition-colors hover:text-beam"
                  >
                    {tLegal("privacy")}
                  </Link>
                </li>
              </ul>
              <p className="text-xs text-text-muted" suppressHydrationWarning>
                {t("copyright", { year })}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
