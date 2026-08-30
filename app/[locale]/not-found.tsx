import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function LocaleNotFound() {
  return (
    <>
      <SiteHeader />
      <main id="content" className="pt-32 pb-20">
        <Container>
          <h1 className="headline-display text-4xl font-bold text-text-primary">
            Sidan finns inte
          </h1>
          <p className="mt-4 max-w-lg text-text-secondary">
            Den här adressen finns inte. Gå till startsidan eller boka en tid
            därifrån.
          </p>
          <p className="mt-8">
            <Link href="/" className="font-semibold text-beam hover:underline">
              Till startsidan
            </Link>
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}
