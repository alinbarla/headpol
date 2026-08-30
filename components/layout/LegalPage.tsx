import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Container } from "@/components/ui/Container";

/**
 * Shared chrome for the terms and privacy pages so the two stay visually
 * identical and neither has to re-implement the site header.
 */
export function LegalPage({
  locale,
  title,
  updated,
  children,
}: {
  locale: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="content" className="pt-24 pb-16 sm:pt-28 sm:pb-24">
        <Container>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-beam"
          >
            <ArrowLeftIcon className="size-4" />
            {locale === "sv" ? "Till startsidan" : "Back to the site"}
          </Link>

          <h1 className="headline-display mt-6 text-4xl font-bold text-text-primary sm:text-5xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-text-muted">{updated}</p>

          <div className="legal-prose mt-10 max-w-3xl">{children}</div>
        </Container>
      </main>
    </>
  );
}
