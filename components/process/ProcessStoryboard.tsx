"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

const stepImages = [
  "/images/steps/maskering-stralkastare.jpg",
  "/images/steps/slipning-stralkastare.jpg",
  "/images/steps/polering-stralkastare.jpg",
  "/images/steps/uv-skydd-stralkastare.jpg",
  "/images/steps/kvalitetskontroll-stralkastare.jpg",
  "/images/steps/klar-stralkastare.jpg",
];

/** Tiny dark placeholder matching the void theme, shown while images load. */
const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==";

type BeatLayout = "imageHeavyLeft" | "textHeavyRight" | "cinemaWide" | "imageHeavyRight" | "textHeavyLeft" | "finale";

const beatLayouts: BeatLayout[] = [
  "imageHeavyLeft",
  "textHeavyRight",
  "cinemaWide",
  "imageHeavyRight",
  "textHeavyLeft",
  "finale",
];

function StoryBeat({
  index,
  title,
  description,
  imageAlt,
  imageSrc,
  layout,
  stepLabel,
}: {
  index: number;
  title: string;
  description: string;
  imageAlt: string;
  imageSrc: string;
  layout: BeatLayout;
  stepLabel: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });

  const frameNum = String(index + 1).padStart(2, "0");
  const sceneTag = stepLabel;

  const fadeUp = {
    hidden: { opacity: 0, y: 36 },
    visible: { opacity: 1, y: 0 },
  };

  if (layout === "cinemaWide") {
    return (
      <motion.article
        ref={ref}
        initial={false}
        animate={inView ? "visible" : "hidden"}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative py-10 sm:py-16"
      >
        <div className="relative aspect-[21/9] overflow-hidden rounded-sm border border-beam/15">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="100vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <motion.p
              variants={fadeUp}
              className="font-mono text-xs tracking-[0.35em] text-beam/80"
            >
              {sceneTag} · {frameNum}
            </motion.p>
            <motion.h3
              variants={fadeUp}
              transition={{ delay: 0.08 }}
              className="headline-display mt-3 max-w-2xl text-3xl font-extrabold text-text-primary sm:text-5xl"
            >
              {title}
            </motion.h3>
            <motion.p
              variants={fadeUp}
              transition={{ delay: 0.14 }}
              className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg"
            >
              {description}
            </motion.p>
          </div>
        </div>
      </motion.article>
    );
  }

  if (layout === "finale") {
    return (
      <motion.article
        ref={ref}
        initial={false}
        animate={inView ? "visible" : "hidden"}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative py-12 sm:py-20"
      >
        <div className="relative overflow-hidden rounded-2xl border border-beam/25 bg-void-elevated">
          <div className="relative aspect-[16/10] sm:aspect-[2/1]">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="100vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,243,38,0.22),transparent_55%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-void/90 via-void/50 to-transparent" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12">
            <motion.p variants={fadeUp} className="font-mono text-xs tracking-[0.35em] text-beam">
              {sceneTag} · {frameNum}
            </motion.p>
            <motion.h3
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              className="headline-display mt-4 text-4xl font-extrabold text-beam-hot sm:text-6xl"
            >
              {title}
            </motion.h3>
            <motion.p
              variants={fadeUp}
              transition={{ delay: 0.16 }}
              className="mt-4 max-w-lg text-lg text-text-primary"
            >
              {description}
            </motion.p>
          </div>
        </div>
      </motion.article>
    );
  }

  const imageFirst = layout === "imageHeavyLeft" || layout === "textHeavyRight";
  const imageDominant = layout === "imageHeavyLeft" || layout === "imageHeavyRight";

  return (
    <motion.article
      ref={ref}
      initial={false}
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={`relative grid items-center gap-6 py-8 sm:gap-10 sm:py-12 ${
        imageDominant
          ? "md:grid-cols-[1.35fr_0.65fr]"
          : "md:grid-cols-[0.65fr_1.35fr]"
      }`}
    >
      <motion.div
        variants={fadeUp}
        className={`relative overflow-hidden rounded-sm border border-beam/10 ${
          imageFirst ? "md:order-1" : "md:order-2"
        } ${imageDominant ? "aspect-[4/3] sm:aspect-[5/4]" : "aspect-[3/2] sm:aspect-[4/3]"}`}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 55vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              index % 2 === 0
                ? "linear-gradient(135deg, rgba(255,243,38,0.15), transparent 60%)"
                : "linear-gradient(225deg, rgba(255,243,38,0.08), transparent 60%)",
          }}
        />
      </motion.div>

      <motion.div
        variants={fadeUp}
        transition={{ delay: 0.12 }}
        className={`flex flex-col justify-center ${
          imageFirst ? "md:order-2 md:pl-4" : "md:order-1 md:pr-4 md:text-right md:items-end"
        }`}
      >
        <p className="font-mono text-[11px] tracking-[0.35em] text-beam/70">
          {sceneTag} · {frameNum}
        </p>
        <h3
          className={`headline-display mt-3 font-extrabold text-text-primary ${
            imageDominant
              ? "text-2xl sm:text-3xl"
              : "text-3xl sm:text-4xl lg:text-5xl"
          }`}
        >
          {title}
        </h3>
        <p
          className={`mt-4 leading-relaxed text-text-secondary ${
            imageDominant ? "max-w-xs text-sm sm:text-base" : "max-w-md text-base sm:text-lg"
          } ${!imageFirst ? "md:text-right" : ""}`}
        >
          {description}
        </p>
      </motion.div>
    </motion.article>
  );
}

export function ProcessStoryboard() {
  const t = useTranslations("process");
  const steps = t.raw("steps") as Array<{
    title: string;
    description: string;
    alt: string;
  }>;

  return (
    <section id="process" className="section-anchor relative overflow-hidden py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-beam/25 to-transparent md:block"
        aria-hidden="true"
      />

      <Container>
        <div className="mb-16 max-w-3xl md:mb-24">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-beam/70">
            {t("sequenceLabel")}
          </p>
          <h2 className="headline-display mt-4 text-3xl font-extrabold text-text-primary sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-secondary">
            {t("subtitle")}
          </p>
        </div>

        <div className="relative max-w-5xl md:mx-auto">
          {steps.map((step, index) => (
            <StoryBeat
              key={step.title}
              index={index}
              title={step.title}
              description={step.description}
              imageAlt={step.alt}
              imageSrc={stepImages[index]}
              layout={beatLayouts[index]}
              stepLabel={t("stepLabel", { step: index + 1 })}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
