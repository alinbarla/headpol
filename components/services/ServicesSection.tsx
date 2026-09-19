import type { ReactNode } from "react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PriceSticker } from "@/components/ui/PriceSticker";
import {
  bookingUrl,
  isProductId,
  type ProductId,
} from "@/lib/products";

const serviceIcons: Record<ProductId, ReactNode> = {
  polering: (
    <svg
      key="polering"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
  ppf: (
    <svg
      key="ppf"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 4 7v6c0 5 3.4 7.6 8 9 4.6-1.4 8-4 8-9V7l-8-4Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  "polering-ppf": (
    <svg
      key="combo"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2 3 7v6c0 5.5 3.4 8.4 9 10 5.6-1.6 9-4.5 9-10V7l-9-5Z" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  ),
};

type ServiceItem = {
  id: string;
  title: string;
  description: string;
  price: string;
  oldPrice?: string;
  href: string;
  badge?: string;
};

export async function ServicesSection() {
  const t = await getTranslations("services");
  const locale = await getLocale();
  const items = t.raw("items") as ServiceItem[];

  return (
    <section id="services" className="section-anchor py-24 sm:py-32">
      <Container>
        <div className="mb-10 max-w-2xl">
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
                href="/priser"
                className="text-sm font-semibold text-beam hover:underline"
              >
                {t("readMore")}
              </Link>
              <Link
                href="/stralkastarpolering"
                className="text-sm font-semibold text-beam hover:underline"
              >
                {t("readMorePolish")}
              </Link>
            </p>
          )}
        </div>

        <nav
          aria-label={t("title")}
          className="mb-8 flex flex-wrap gap-2 md:hidden"
        >
          {items.map((item) => (
            <a
              key={item.id}
              href={`#service-${item.id}`}
              className="rounded-full border border-white/15 bg-void-elevated px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-beam hover:text-beam"
            >
              {item.id === "polering"
                ? t("chipPolering")
                : item.id === "ppf"
                  ? t("chipPpf")
                  : t("chipCombo")}
            </a>
          ))}
        </nav>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item) => {
            const productId = isProductId(item.id) ? item.id : "polering";
            const featured = item.id === "polering-ppf";

            return (
              <article
                key={item.id}
                id={`service-${item.id}`}
                className={`group relative scroll-mt-28 overflow-hidden rounded-[24px] p-8 transition-transform duration-300 hover:-translate-y-1 motion-reduce:hover:translate-y-0 ${
                  featured
                    ? "border-2 border-beam bg-void-elevated shadow-[0_0_48px_rgba(255,243,38,0.12)]"
                    : "border border-white/5 bg-void-elevated"
                }`}
              >
                {item.badge ? (
                  <p className="absolute right-5 top-5 rounded-full bg-beam px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-void">
                    {item.badge}
                  </p>
                ) : null}

                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-beam text-void transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                  aria-hidden="true"
                >
                  <span className="block h-8 w-8 [&>svg]:h-full [&>svg]:w-full">
                    {serviceIcons[productId]}
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
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    href={item.href}
                    variant="outline"
                    className="w-full px-5 sm:flex-1"
                  >
                    {t("readMoreLabel")}
                  </Button>
                  <Button
                    href={bookingUrl(productId)}
                    className="w-full px-5 sm:flex-1"
                  >
                    {t("bookLabel")}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-8 max-w-2xl text-sm text-text-muted">{t("guaranteeNote")}</p>
      </Container>
    </section>
  );
}
