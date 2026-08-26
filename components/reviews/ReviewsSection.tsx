import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";

const SHOTS = [
  {
    src: "/images/gallery/stralkastarepolering-fore-efter.jpg",
    altKey: "beforeAfterAlt" as const,
  },
  {
    src: "/images/gallery/car-2.jpg",
    altKey: "afterAlt" as const,
  },
];

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

        <ul className="grid gap-6 md:grid-cols-2">
          {SHOTS.map((shot) => (
            <li
              key={shot.src}
              className="overflow-hidden rounded-3xl border border-white/5 bg-void-elevated"
            >
              <Image
                src={shot.src}
                alt={t(shot.altKey)}
                width={1200}
                height={800}
                className="h-auto w-full object-cover"
                sizes="(max-width: 768px) 100vw, 560px"
              />
            </li>
          ))}
        </ul>

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
