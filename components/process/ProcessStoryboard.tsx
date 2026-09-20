"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, MotionConfig } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { YoutubeAutoplayEmbed } from "@/components/media/YoutubeAutoplayEmbed";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { bookingUrl } from "@/lib/products";
import { cn } from "@/lib/utils";

const STEP_IMAGES = [
  "/images/step-map/masking.webp",
  "/images/step-map/sanding.webp",
  "/images/step-map/polymer.webp",
  "/images/step-map/ceramic.webp",
  "/images/step-map/quality-check.webp",
  "/images/step-map/ready-to-drive.webp",
];

type ProcessTab = "polering" | "ppf";

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
  const [tab, setTab] = useState<ProcessTab>("polering");
  const tablistId = useId();
  const poleringTabRef = useRef<HTMLButtonElement>(null);
  const ppfTabRef = useRef<HTMLButtonElement>(null);
  const steps = t.raw("steps") as Array<{
    title: string;
    description: string;
    alt: string;
  }>;

  const ppfAfterParagraphs = t.raw("ppfAfterParagraphs") as string[];
  const ppfAfterPoints = t.raw("ppfAfterPoints") as string[];
  const isPpf = tab === "ppf";

  return (
    <MotionConfig reducedMotion="user">
    <section id="process" className="section-anchor py-24 sm:py-32">
      <Container>
        <div className="mb-10 max-w-3xl md:mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-beam/70">
            {isPpf ? t("ppfSequenceLabel") : t("sequenceLabel")}
          </p>
          <h2 className="headline-display mt-4 text-3xl font-extrabold text-text-primary sm:text-5xl">
            {isPpf ? t("ppfTitle") : t("title")}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-secondary">
            {isPpf ? t("ppfSubtitle") : t("subtitle")}
          </p>
          {locale === "sv" && (
            <p className="mt-4">
              <Link
                href={isPpf ? "/ppf" : "/stralkastarrenovering"}
                className="text-sm font-semibold text-beam hover:underline"
              >
                {isPpf ? t("ppfReadMore") : t("readMore")}
              </Link>
            </p>
          )}
        </div>

        <div
          role="tablist"
          aria-label={t("tablistLabel")}
          id={tablistId}
          className="mb-10 inline-flex rounded-full border border-white/10 bg-void-elevated p-1"
        >
          {(["polering", "ppf"] as const).map((value) => {
            const selected = tab === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                id={`${tablistId}-${value}`}
                ref={value === "polering" ? poleringTabRef : ppfTabRef}
                aria-selected={selected}
                aria-controls={`${tablistId}-panel-${value}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                    event.preventDefault();
                    const next = value === "polering" ? "ppf" : "polering";
                    setTab(next);
                    (next === "ppf" ? ppfTabRef : poleringTabRef).current?.focus();
                  }
                }}
                className={cn(
                  "min-h-11 rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                  selected
                    ? "bg-beam text-void"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {value === "polering" ? t("tabPolering") : t("tabPpf")}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`${tablistId}-panel-polering`}
          aria-labelledby={`${tablistId}-polering`}
          hidden={isPpf}
        >
          {!isPpf ? (
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
          ) : null}
        </div>

        <div
          role="tabpanel"
          id={`${tablistId}-panel-ppf`}
          aria-labelledby={`${tablistId}-ppf`}
          hidden={!isPpf}
        >
          {isPpf ? (
            <YoutubeAutoplayEmbed
              id="process-ppf-video"
              autoPlay
              caption={t("ppfCaption")}
              watchLabel={t("ppfWatch")}
              mutedLabel={t("videoMuted")}
            />
          ) : null}
          <div className="mt-8 max-w-3xl">
            <h3 className="headline-display text-2xl font-bold text-text-primary sm:text-3xl">
              {t("ppfAfterTitle")}
            </h3>
            {ppfAfterParagraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="mt-4 text-base leading-relaxed text-text-secondary"
              >
                {paragraph}
              </p>
            ))}
            <ul className="mt-5 space-y-2 text-sm leading-relaxed text-text-secondary">
              {ppfAfterPoints.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-beam" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6">
              <Link
                href={bookingUrl("ppf")}
                className="text-sm font-semibold text-beam hover:underline"
              >
                {t("ppfAfterBook")}
              </Link>
              {locale === "sv" ? (
                <>
                  {" · "}
                  <Link
                    href="/ppf"
                    className="text-sm font-semibold text-beam hover:underline"
                  >
                    {t("ppfReadMore")}
                  </Link>
                </>
              ) : null}
            </p>
          </div>
        </div>
      </Container>
    </section>
    </MotionConfig>
  );
}
