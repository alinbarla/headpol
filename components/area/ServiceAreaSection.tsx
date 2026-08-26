import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { AREA_PAGE_SLUGS, SERVICE_AREAS } from "@/lib/seo";

export function ServiceAreaSection() {
  const t = useTranslations("serviceArea");
  const locale = useLocale();

  return (
    <section id="servicearea" className="section-anchor py-20 sm:py-28">
      <Container>
        <div className="max-w-3xl">
          <h2 className="headline-display text-3xl font-bold text-text-primary sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">{t("subtitle")}</p>
        </div>

        <ul className="mt-8 flex flex-wrap gap-3">
          {SERVICE_AREAS.map((area) => {
            const slug = AREA_PAGE_SLUGS[area];
            const className =
              "rounded-full border border-beam/25 bg-beam/5 px-4 py-2 text-sm font-medium text-text-primary";

            if (locale === "sv" && slug) {
              return (
                <li key={area}>
                  <Link
                    href={`/sv/${slug}`}
                    className={`${className} transition-colors hover:border-beam hover:text-beam`}
                  >
                    {area}
                  </Link>
                </li>
              );
            }

            return (
              <li key={area} className={className}>
                {area}
              </li>
            );
          })}
        </ul>

        <p className="mt-6 max-w-2xl text-sm text-text-muted">{t("note")}</p>
        {locale === "sv" && (
          <p className="mt-3">
            <Link
              href="/sv/stralkastarpolering-stockholm"
              className="text-sm font-semibold text-beam hover:underline"
            >
              {t("readMore")}
            </Link>
          </p>
        )}
      </Container>
    </section>
  );
}
