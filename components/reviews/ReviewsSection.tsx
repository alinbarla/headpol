import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { GoogleReviews } from "@/components/reviews/GoogleReviews";
import { Container } from "@/components/ui/Container";
import { ResultCompare } from "@/components/reviews/ResultCompare";

export async function ReviewsSection() {
  const t = await getTranslations("reviews");
  const ctaHref = "/fore-bilder";

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

        <GoogleReviews />

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
