"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CompareReveal } from "@/components/ui/compare-reveal";

const BEFORE_SRC = "/images/gallery/stralkastarpolering fore.webp";
const AFTER_SRC = "/images/gallery/stralkastarpolering efter.webp";

export function ResultCompare() {
  const t = useTranslations("hero");

  return (
    <CompareReveal
      className="w-full overflow-hidden rounded-3xl border-white/5 bg-void-elevated"
      style={{ ["--motiq-signature"]: "var(--beam)" } as CSSProperties}
      before={
        <div className="relative h-full w-full">
          <Image
            src={BEFORE_SRC}
            alt={t("sliderAltBefore")}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 960px"
          />
        </div>
      }
      after={
        <div className="relative h-full w-full">
          <Image
            src={AFTER_SRC}
            alt={t("sliderAltAfter")}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 960px"
          />
        </div>
      }
      labels={[t("before"), t("after")]}
      defaultPosition={50}
      introSweep
      snapOnDoubleClick={50}
    />
  );
}
