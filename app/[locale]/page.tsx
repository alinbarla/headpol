import { setRequestLocale } from "next-intl/server";
import { LightBeamHero } from "@/components/hero/LightBeamHero";
import { BenefitsSection } from "@/components/benefits/BenefitsSection";
import { ProcessStoryboard } from "@/components/process/ProcessStoryboard";
import { ServicesSection } from "@/components/services/ServicesSection";
import { TrustSection } from "@/components/trust/TrustSection";
import { ServiceAreaSection } from "@/components/area/ServiceAreaSection";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { FaqSection } from "@/components/faq/FaqSection";
import { BookingPicker } from "@/components/booking/BookingPicker";
import { SectionNav } from "@/components/layout/SectionNav";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildStructuredData } from "@/lib/structuredData";
import { routing, type Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const structuredData = await buildStructuredData(locale as Locale);

  return (
    <>
      <JsonLd data={structuredData} />
      <SectionNav />
      <main id="content">
        <LightBeamHero />
        <BenefitsSection />
        <ProcessStoryboard />
        <ServicesSection />
        <TrustSection />
        <ServiceAreaSection />
        <ReviewsSection />
        <FaqSection />
        <BookingPicker />
      </main>
      <Footer />
    </>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
