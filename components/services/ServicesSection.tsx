"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { PriceSticker } from "@/components/ui/PriceSticker";

const serviceIcons: ReactNode[] = [
  <svg key="car" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>,
  <svg key="moto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="5" cy="17" r="3" />
    <circle cx="19" cy="17" r="3" />
    <path d="M8 17h6l3-5h3M5 14l3-5h5l2 3" />
    <path d="M14 9h3" />
  </svg>,
  <svg key="fleet" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="11" height="16" rx="1" />
    <path d="M14 9h5a1 1 0 0 1 1 1v10H14" />
    <path d="M6.5 8h3M6.5 12h3M6.5 16h3M17 13h0M17 16h0" />
  </svg>,
];

export function ServicesSection() {
  const t = useTranslations("services");
  const locale = useLocale();
  const items = t.raw("items") as Array<{
    title: string;
    description: string;
    price: string;
    oldPrice?: string;
  }>;

  return (
    <section id="services" className="section-anchor py-24 sm:py-32">
      <Container>
        <div className="mb-14 max-w-2xl">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-beam">
            {t("exampleNote")}
          </p>
          <h2 className="headline-display mt-4 text-4xl font-bold text-text-primary sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-text-secondary">{t("subtitle")}</p>
          {locale === "sv" && (
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              <Link
                href="/sv/priser"
                className="text-sm font-semibold text-beam hover:underline"
              >
                {t("readMore")}
              </Link>
              <Link
                href="/sv/stralkastarpolering"
                className="text-sm font-semibold text-beam hover:underline"
              >
                {t("readMorePolish")}
              </Link>
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={item.title}
              className="group relative overflow-hidden rounded-[24px] border border-white/5 bg-void-elevated p-8 transition-transform duration-300 hover:-translate-y-1 motion-reduce:hover:translate-y-0"
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-beam text-void transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                aria-hidden="true"
              >
                <span className="block h-8 w-8 [&>svg]:h-full [&>svg]:w-full">
                  {serviceIcons[index]}
                </span>
              </div>
              <h3 className="headline-display mt-6 text-2xl font-bold text-text-primary">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {item.description}
              </p>
              {item.oldPrice ? (
                <div className="mt-6">
                  <PriceSticker
                    oldPrice={item.oldPrice}
                    price={item.price}
                    unit={t("priceUnit")}
                  />
                </div>
              ) : (
                <p className="headline-display mt-6 text-2xl font-bold text-beam">
                  {item.price}
                </p>
              )}
            </article>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-sm text-text-muted">{t("guaranteeNote")}</p>
      </Container>
    </section>
  );
}
