import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function LocaleNotFound() {
  const locale = await getLocale();
  const sv = locale === "sv";

  return (
    <>
      <SiteHeader />
      <main id="content" className="pt-32 pb-20">
        <Container>
          <h1 className="headline-display text-4xl font-bold text-text-primary">
            {sv ? "Sidan finns inte" : "Page not found"}
          </h1>
          <p className="mt-4 max-w-lg text-text-secondary">
            {sv
              ? "Den här adressen finns inte. Gå till startsidan eller boka en tid därifrån."
              : "That address does not exist. Go back to the homepage to book."}
          </p>
          <p className="mt-8">
            <Link
              href={`/${locale}`}
              className="font-semibold text-beam hover:underline"
            >
              {sv ? "Till startsidan" : "Back to the site"}
            </Link>
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}
