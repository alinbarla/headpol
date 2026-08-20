import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SERVICE_AREAS } from "@/lib/seo";

export function ServiceAreaSection() {
  const t = useTranslations("serviceArea");

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
          {SERVICE_AREAS.map((area) => (
            <li
              key={area}
              className="rounded-full border border-beam/25 bg-beam/5 px-4 py-2 text-sm font-medium text-text-primary"
            >
              {area}
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-2xl text-sm text-text-muted">{t("note")}</p>
      </Container>
    </section>
  );
}
