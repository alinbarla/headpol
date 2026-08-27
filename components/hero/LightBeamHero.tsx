"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useMounted } from "@/lib/useMounted";
import { CONTACT_PHONE } from "@/lib/booking";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PriceSticker } from "@/components/ui/PriceSticker";
import { HeroShowcaseImage } from "./HeroShowcaseImage";

export function LightBeamHero() {
  const t = useTranslations("hero");
  const mounted = useMounted();
  const stats = t.raw("stats") as Array<{ value: string; label: string }>;

  return (
    <section
      id="hero"
      className="section-anchor relative overflow-x-hidden pt-24 pb-16 sm:pt-28 sm:pb-24"
    >
      <div className="absolute inset-0 beam-glow" aria-hidden="true" />

      <div
        className="absolute inset-0 opacity-30"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 10%, rgba(255,243,38,0.16), transparent 38%), radial-gradient(circle at 15% 85%, rgba(255,243,38,0.06), transparent 40%)",
        }}
      />

      <Container className="relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <motion.div
            initial={false}
            animate={mounted ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-beam font-display">
              {t("eyebrow")}
            </p>
            <h1 className="headline-display text-3xl font-bold text-text-primary sm:text-4xl lg:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
              {t.rich("subtitle", {
                guarantee: (chunks) => (
                  <span className="guarantee-chip">{chunks}</span>
                ),
              })}
            </p>
            <p className="mt-4 hidden max-w-xl text-base leading-relaxed text-text-secondary lg:block">
              {t("semantic")}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button href={`tel:${CONTACT_PHONE}`}>{t("ctaPrimary")}</Button>
              <Button href="#booking" variant="outline">
                {t("ctaSecondary")}
              </Button>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="headline-display block text-2xl font-bold text-beam sm:text-3xl">
                      {stat.value}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-text-muted">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={false}
            animate={mounted ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="relative"
          >
            <div
              className="pointer-events-none absolute -inset-4 rounded-3xl bg-beam/10 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative">
              <HeroShowcaseImage />
              <div className="absolute -bottom-5 left-3 z-10 sm:left-6">
                <PriceSticker
                  oldPrice={t("oldPrice")}
                  price={t("price")}
                  unit={t("priceUnit")}
                />
              </div>
            </div>
            <p className="mt-10 max-w-xl text-base leading-relaxed text-text-secondary lg:hidden">
              {t("semantic")}
            </p>
            <p className="mt-4 text-center text-sm text-text-muted lg:mt-10">
              {t("imageHint")}
            </p>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
