import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

function Stars() {
  return (
    <div className="flex gap-1 text-beam" aria-label="5 / 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewsSection() {
  const t = useTranslations("reviews");
  const items = t.raw("items") as Array<{ quote: string; author: string; location: string }>;

  return (
    <section id="reviews" className="section-anchor py-20 sm:py-28">
      <Container>
        <div className="mb-12 max-w-3xl">
          <h2 className="headline-display text-3xl font-bold text-text-primary sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <figure
              key={item.author}
              className="flex flex-col rounded-3xl border border-white/5 bg-void-elevated p-7"
            >
              <Stars />
              <blockquote className="mt-4 grow text-sm leading-relaxed text-text-secondary">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-5 text-sm font-semibold text-text-primary">
                {item.author}
                <span className="font-normal text-text-muted"> · {item.location}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-6 text-xs text-text-muted">{t("disclaimer")}</p>
      </Container>
    </section>
  );
}
