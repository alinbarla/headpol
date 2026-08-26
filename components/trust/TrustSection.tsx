import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

export function TrustSection() {
  const t = useTranslations("trust");
  const locale = useLocale();
  const items = t.raw("items") as Array<{ title: string; description: string }>;

  return (
    <section id="trust" className="section-anchor py-20 sm:py-28">
      <Container>
        <div className="mb-12 max-w-3xl">
          <h2 className="headline-display text-3xl font-bold text-text-primary sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">{t("subtitle")}</p>
          {locale === "sv" && (
            <p className="mt-3">
              <Link
                href="/sv/om-oss"
                className="text-sm font-semibold text-beam hover:underline"
              >
                {t("readMore")}
              </Link>
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="flex gap-4 rounded-3xl border border-white/5 bg-void-elevated p-7"
            >
              <span
                className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-beam text-void"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <div>
                <h3 className="headline-display text-lg font-bold text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
