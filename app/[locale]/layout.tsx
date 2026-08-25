import type { Metadata, Viewport } from "next";
import { Libre_Franklin, Public_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { GoogleTag } from "@/components/analytics/GoogleTag";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/lib/i18n";
import {
  BRAND,
  GOOGLE_SITE_VERIFICATION,
  KEYWORDS,
  LOCALES,
  OG_IMAGE,
  SITE_URL,
  localeUrl,
  ogLocale,
} from "@/lib/seo";
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

  const canonical = localeUrl(locale);
  const languages: Record<string, string> = {
    "x-default": localeUrl(routing.defaultLocale),
  };
  for (const loc of LOCALES) {
    languages[loc === "sv" ? "sv-SE" : "en-US"] = localeUrl(loc);
  }

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
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "website",
      siteName: BRAND,
      title,
      description,
      url: canonical,
      locale: ogLocale(locale),
      alternateLocale: LOCALES.filter((l) => l !== locale).map(ogLocale),
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
      title,
      description,
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

  return (
    <html lang={locale} className={`${libreFranklin.variable} ${publicSans.variable} h-full`}>
      <body className="min-h-full antialiased">
        <div className="grain-overlay" aria-hidden="true" />
        <NextIntlClientProvider messages={messages}>
          <MotionProvider>{children}</MotionProvider>
        </NextIntlClientProvider>
        <GoogleTag />
      </body>
    </html>
  );
}
