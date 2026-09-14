import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { LightBeamHero } from "@/components/hero/LightBeamHero";
import { BenefitsSection } from "@/components/benefits/BenefitsSection";
import { ProcessStoryboardDynamic } from "@/components/process/ProcessStoryboardDynamic";
import { ServicesSection } from "@/components/services/ServicesSection";
import { TrustSection } from "@/components/trust/TrustSection";
import { ServiceAreaSection } from "@/components/area/ServiceAreaSection";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { LiveReviewRating } from "@/components/reviews/LiveReviewRating";
import { FaqSection } from "@/components/faq/FaqSection";
import { BookingPickerDynamic } from "@/components/booking/BookingPickerDynamic";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { routing, type Locale } from "@/lib/i18n";
import { BRAND } from "@/lib/seo";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const noIndex: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  noarchive: true,
  nosnippet: true,
  noimageindex: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
    nosnippet: true,
    noarchive: true,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: { absolute: `${t("title")} · Smootherly` },
    description: t("description"),
    robots: noIndex,
    alternates: { canonical: null },
    openGraph: {
      title: `${BRAND} · Smootherly`,
      description: t("description"),
      url: undefined,
    },
  };
}

export default async function SmootherlyLandingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <>
      <SiteHeader />
      <main id="content">
        <LightBeamHero reviewRating={<LiveReviewRating namespace="hero" />} />
        <BenefitsSection />
        <ProcessStoryboardDynamic />
        <ServicesSection />
        <TrustSection />
        <ServiceAreaSection />
        <ReviewsSection />
        <BookingPickerDynamic variant="smootherly" />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
