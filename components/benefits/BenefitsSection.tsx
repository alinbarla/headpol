import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

export function BenefitsSection() {
  const t = useTranslations("benefits");
  const items = t.raw("items") as Array<{ title: string; description: string }>;

  return (
    <section id="benefits" className="section-anchor py-24 sm:py-32">
      <Container>
        <div className="mb-14 max-w-3xl">
          <h2 className="headline-display text-3xl font-bold text-text-primary sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-white/5 bg-void-elevated p-7"
            >
              <h3 className="headline-display text-xl font-bold text-beam">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
