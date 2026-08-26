"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { useReducedMotion } from "@/lib/useReducedMotion";

const STEP_IMAGES = [
  "/images/step-map/masking.webp",
  "/images/step-map/sanding.webp",
  "/images/step-map/polymer.webp",
  "/images/step-map/ceramic.webp",
  "/images/step-map/quality-check.webp",
  "/images/step-map/ready-to-drive.webp",
];

function StepCard({
  index,
  title,
  description,
  imageAlt,
  imageSrc,
  stepLabel,
}: {
  index: number;
  title: string;
  description: string;
  imageAlt: string;
  imageSrc: string;
  stepLabel: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reducedMotion = useReducedMotion();
  const frameNum = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      ref={ref}
      initial={false}
      animate={
        inView
          ? { opacity: 1, y: 0 }
          : { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 24 }
      }
      transition={{ duration: 0.45, delay: Math.min(index, 2) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel flex h-full flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className="absolute left-3 top-3 rounded-md bg-void/80 px-2 py-1 font-mono text-[11px] tracking-[0.2em] text-beam">
          {frameNum}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-beam/70">
          {stepLabel}
        </p>
        <h3 className="headline-display mt-2 text-xl font-bold text-text-primary sm:text-2xl">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-[0.95rem]">
          {description}
        </p>
      </div>
    </motion.article>
  );
}

export function ProcessStoryboard() {
  const t = useTranslations("process");
  const locale = useLocale();
  const steps = t.raw("steps") as Array<{
    title: string;
    description: string;
    alt: string;
  }>;

  return (
    <section id="process" className="section-anchor py-24 sm:py-32">
      <Container>
        <div className="mb-12 max-w-3xl md:mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-beam/70">
            {t("sequenceLabel")}
          </p>
          <h2 className="headline-display mt-4 text-3xl font-extrabold text-text-primary sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-secondary">
            {t("subtitle")}
          </p>
          {locale === "sv" && (
            <p className="mt-4">
              <Link
                href="/sv/stralkastarrenovering"
                className="text-sm font-semibold text-beam hover:underline"
              >
                {t("readMore")}
              </Link>
            </p>
          )}
        </div>

        <ol className="grid list-none grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="min-h-0">
              <StepCard
                index={index}
                title={step.title}
                description={step.description}
                imageAlt={step.alt}
                imageSrc={STEP_IMAGES[index]}
                stepLabel={t("stepLabel", { step: index + 1 })}
              />
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
