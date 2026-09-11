import Image from "next/image";
import { getTranslations } from "next-intl/server";

const HERO_IMAGE = "/images/step-map/hero.webp";

export async function HeroShowcaseImage() {
  const t = await getTranslations("hero");

  return (
    <div className="hero-media-frame relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-beam/20 shadow-[0_0_60px_rgba(255,243,38,0.12)]">
      <Image
        src={HERO_IMAGE}
        alt={t("imageAlt")}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}
