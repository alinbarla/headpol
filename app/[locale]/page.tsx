import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { LightBeamHero } from "@/components/hero/LightBeamHero";
import { BenefitsSection } from "@/components/benefits/BenefitsSection";
import { ProcessStoryboard } from "@/components/process/ProcessStoryboard";
import { ServicesSection } from "@/components/services/ServicesSection";
import { TrustSection } from "@/components/trust/TrustSection";
import { ServiceAreaSection } from "@/components/area/ServiceAreaSection";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { FaqSection } from "@/components/faq/FaqSection";
import { BookingPicker } from "@/components/booking/BookingPicker";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildHomeStructuredData } from "@/lib/structuredData";
import { routing, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return buildPageMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    bilingual: true,
    absoluteTitle: true,
  });
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const structuredData = await buildHomeStructuredData(locale as Locale);

  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader />
      <main id="content">
        <LightBeamHero />
        <BenefitsSection />
        <ProcessStoryboard />
        <ServicesSection />
        <TrustSection />
        <ServiceAreaSection />
        <ReviewsSection />
        <BookingPicker />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
