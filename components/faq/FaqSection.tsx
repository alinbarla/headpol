import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

export function FaqSection() {
  const t = useTranslations("faq");
  const items = t.raw("items") as Array<{ question: string; answer: string }>;

  return (
    <section id="faq" className="section-anchor py-24 sm:py-32">
      <Container>
        <div className="mb-12 max-w-3xl">
          <h2 className="headline-display text-3xl font-bold text-text-primary sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">{t("subtitle")}</p>
        </div>

        <div className="mx-auto max-w-3xl divide-y divide-white/10 border-y border-white/10">
          {items.map((item) => (
            <details key={item.question} className="group py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left">
                <h3 className="headline-display text-lg font-semibold text-text-primary">
                  {item.question}
                </h3>
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-beam transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="pb-5 pr-10 text-sm leading-relaxed text-text-secondary">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
