import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { PriceCards } from "@/components/content/PriceCards";
import { ResultCompare } from "@/components/reviews/ResultCompare";
import { ReviewRating } from "@/components/reviews/ReviewRating";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { ClusterDoc } from "@/lib/content/types";
import { CONTACT_PHONE, CONTACT_PHONE_DISPLAY } from "@/lib/booking";

export async function ClusterPage({
  page,
  jsonLd,
}: {
  page: ClusterDoc;
  jsonLd: Record<string, unknown>;
}) {
  const t = await getTranslations({ locale: "sv", namespace: "cluster" });

  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteHeader />
      <main id="content" className="pt-24 pb-20 sm:pt-28 sm:pb-28">
        <Container>
          <nav aria-label="Brödsmulor" className="text-sm text-text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="transition-colors hover:text-beam">
                  {t("homeCrumb")}
                </Link>
              </li>
              {page.kind === "location" && page.locationName !== "Stockholm" && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link
                      href="/stralkastarpolering-stockholm"
                      className="transition-colors hover:text-beam"
                    >
                      Stockholm
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li className="text-text-secondary">
                {page.locationName ?? page.h1}
              </li>
            </ol>
          </nav>

          <h1 className="headline-display mt-6 max-w-4xl text-3xl font-bold text-text-primary sm:text-4xl lg:text-5xl">
            {page.h1}
          </h1>
          <ReviewRating label={t("ratingLabel")} srLabel={t("ratingSr")} />
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-text-secondary">
            {page.lead}
          </p>

          {page.priceTiers && page.priceTiers.length > 0 ? (
            <PriceCards tiers={page.priceTiers} />
          ) : page.compareSlider ? (
            <div className="mt-10 max-w-4xl">
              <ResultCompare />
            </div>
          ) : page.images && page.images.length > 0 ? (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {page.images.map((image) => (
                <li key={image.src} className="overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={1200}
                    height={800}
                    className="h-auto w-full object-cover"
                    sizes="(max-width: 640px) 100vw, 560px"
                  />
                  {image.caption && (
                    <p className="px-4 py-3 text-sm text-text-muted">{image.caption}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          {page.priceTiers && page.priceTiers.length > 0 ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {page.sections.map((section) => (
                <section
                  key={section.heading}
                  className="rounded-[28px] border border-white/10 bg-void-elevated p-7 sm:p-8"
                >
                  <h2 className="headline-display text-2xl font-bold text-text-primary">
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 48)}
                      className="mt-4 text-sm leading-relaxed text-text-secondary"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.heading === "Betalning" ? (
                    <p className="mt-4">
                      <Link
                        href="/villkor"
                        className="text-sm font-semibold text-beam hover:underline"
                      >
                        Villkor och avbokning
                      </Link>
                    </p>
                  ) : null}
                  {section.href && section.linkLabel ? (
                    <p className="mt-4">
                      <Link
                        href={section.href}
                        className="text-sm font-semibold text-beam hover:underline"
                      >
                        {section.linkLabel}
                      </Link>
                    </p>
                  ) : null}
                </section>
              ))}
            </div>
          ) : (
            <div className="legal-prose mt-12 max-w-3xl">
              {page.sections.map((section) => (
                <section key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))}
                  {section.bullets && (
                    <ul>
                      {section.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.href && section.linkLabel ? (
                    <p>
                      <Link
                        href={section.href}
                        className="font-semibold text-beam hover:underline"
                      >
                        {section.linkLabel}
                      </Link>
                    </p>
                  ) : null}
                </section>
              ))}
            </div>
          )}

          {page.faqs && page.faqs.length > 0 && (
            <section className="mt-16 max-w-3xl">
              <h2 className="headline-display text-2xl font-bold text-text-primary sm:text-3xl">
                {t("faqTitle")}
              </h2>
              <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
                {page.faqs.map((item) => (
                  <details key={item.question} className="group py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left">
                      <h3 className="headline-display text-lg font-semibold text-text-primary">
                        {item.question}
                      </h3>
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-beam"
                        aria-hidden="true"
                      >
                        +
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
            </section>
          )}

          {page.related.length > 0 && (
            <section className="mt-16 max-w-3xl">
              <h2 className="headline-display text-2xl font-bold text-text-primary">
                {t("relatedTitle")}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-3">
                {page.related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/${item.slug}`}
                      className="inline-flex rounded-full border border-beam/25 bg-beam/5 px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-beam hover:text-beam"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <aside className="mt-16 max-w-3xl rounded-2xl border border-beam/20 bg-beam/5 p-6 sm:p-8">
            <h2 className="headline-display text-2xl font-bold text-text-primary">
              {t("ctaTitle")}
            </h2>
            <p className="mt-3 text-text-secondary">{t("ctaBody")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/#booking">{t("ctaBook")}</Button>
              <Button href={`tel:${CONTACT_PHONE}`} variant="outline">
                {t("ctaCall")} · {CONTACT_PHONE_DISPLAY}
              </Button>
            </div>
          </aside>
        </Container>
      </main>
      <Footer />
    </>
  );
}
