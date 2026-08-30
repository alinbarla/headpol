"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

export function FaqSection() {
  const t = useTranslations("faq");
  const locale = useLocale();
  const items = t.raw("items") as Array<{
    question: string;
    answer: string;
    href?: string;
    linkLabel?: string;
  }>;

  return (
    <section id="faq" className="section-anchor py-24 sm:py-32">
      <Container>
        <div className="mb-12 max-w-3xl">
          <h2 className="headline-display text-3xl font-bold text-text-primary sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">{t("subtitle")}</p>
          {locale === "sv" && (
            <p className="mt-3">
              <Link
                href="/sv/faq"
                className="text-sm font-semibold text-beam hover:underline"
              >
                {t("readMore")}
              </Link>
            </p>
          )}
        </div>

        <div className="mx-auto max-w-3xl divide-y divide-white/10 border-y border-white/10">
          {items.map((item) => (
            <details key={item.question} className="group py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left">
                <h3 className="headline-display text-lg font-semibold text-text-primary">
                  {item.question}
                </h3>
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-beam transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <div className="pb-5 pr-10 text-sm leading-relaxed text-text-secondary">
                <p>{item.answer}</p>
                {item.href && item.linkLabel ? (
                  <p className="mt-2">
                    <Link
                      href={item.href}
                      className="font-semibold text-beam hover:underline"
                    >
                      {item.linkLabel}
                    </Link>
                  </p>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
