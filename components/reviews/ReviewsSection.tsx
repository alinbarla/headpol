import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ResultCompare } from "@/components/reviews/ResultCompare";

export async function ReviewsSection() {
  const t = await getTranslations("reviews");
  const locale = await getLocale();
  const ctaHref = locale === "sv" ? "/sv/fore-bilder" : "#process";

  return (
    <section id="resultat" className="section-anchor py-20 sm:py-28">
      <Container>
        <div className="mb-12 max-w-3xl">
          <h2 className="headline-display text-3xl font-bold text-text-primary sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">{t("subtitle")}</p>
        </div>

        <ResultCompare />

        <p className="mt-6">
          <Link
            href={ctaHref}
            className="text-sm font-semibold text-beam hover:underline"
          >
            {t("cta")}
          </Link>
        </p>
      </Container>
    </section>
  );
}
