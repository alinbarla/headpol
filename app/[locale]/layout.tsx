import type { Metadata, Viewport } from "next";
import { Libre_Franklin, Public_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { GoogleTag } from "@/components/analytics/GoogleTag";
import { GoogleTagManager, GoogleTagManagerNoscript } from "@/components/analytics/GoogleTagManager";
import { JsonLd } from "@/components/seo/JsonLd";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/lib/i18n";
import {
  BRAND,
  GOOGLE_SITE_VERIFICATION,
  KEYWORDS,
  OG_IMAGE,
  SITE_URL,
  htmlLang,
  ogLocale,
} from "@/lib/seo";
import { buildLocalBusinessJsonLd } from "@/lib/structuredData";
import "../globals.css";

const libreFranklin = Libre_Franklin({
  variable: "--font-libre",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

const publicSans = Public_Sans({
  variable: "--font-public",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

export const viewport: Viewport = {
  themeColor: "#111111",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
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
  const t = await getTranslations({ locale, namespace: "metadata" });

  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: BRAND,
    title: {
      default: title,
      template: `%s | ${BRAND}`,
    },
    description,
    keywords: KEYWORDS[locale as Locale] ?? KEYWORDS.sv,
    authors: [{ name: BRAND }],
    creator: BRAND,
    publisher: BRAND,
    category: "Automotive",
    openGraph: {
      type: "website",
      siteName: BRAND,
      locale: ogLocale(locale),
      images: [
        {
          url: OG_IMAGE.url,
          width: OG_IMAGE.width,
          height: OG_IMAGE.height,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [OG_IMAGE.url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    ...(GOOGLE_SITE_VERIFICATION
      ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
      : {}),
    formatDetection: { telephone: true, email: true, address: false },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const tMeta = await getTranslations({ locale, namespace: "metadata" });

  return (
    <html lang={htmlLang(locale)} className={`${libreFranklin.variable} ${publicSans.variable} h-full`}>
      <head>
        <JsonLd
          id="local-business"
          data={buildLocalBusinessJsonLd(tMeta("description"))}
        />
      </head>
      <body className="min-h-full antialiased">
        <GoogleTagManager />
        <GoogleTag />
        <GoogleTagManagerNoscript />
        <div className="grain-overlay" aria-hidden="true" />
        <NextIntlClientProvider messages={messages}>
          <MotionProvider>{children}</MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
