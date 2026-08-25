import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingConfirmationView } from "@/components/booking/BookingConfirmationView";
import { getConfirmationBySession } from "@/lib/bookingConfirmation";
import { routing, type Locale } from "@/lib/i18n";
import { BRAND } from "@/lib/seo";

export const dynamic = "force-dynamic";

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

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string | string[] }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "bookingConfirmation",
  });

  return {
    title: { absolute: `${t("metaTitle")} | ${BRAND}` },
    description: t("metaDescription"),
    robots: noIndex,
    alternates: { canonical: null },
  };
}

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  const raw = (await searchParams).session_id;
  const sessionId = Array.isArray(raw) ? raw[0] : raw;
  const confirmation = sessionId
    ? await getConfirmationBySession(sessionId)
    : null;

  return (
    <BookingConfirmationView locale={locale} confirmation={confirmation} />
  );
}