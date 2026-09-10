import { StarIcon } from "lucide-react";
import { GoogleMapsLink } from "@/components/reviews/GoogleMapsLink";

function Star({ fillPercent }: { fillPercent: number }) {
  return (
    <span className="relative inline-block size-4 shrink-0" aria-hidden="true">
      <StarIcon
        className="size-4 text-white/20"
        strokeWidth={1.5}
        absoluteStrokeWidth
      />
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${fillPercent}%` }}
      >
        <StarIcon
          className="size-4 fill-beam text-beam"
          strokeWidth={1.5}
          absoluteStrokeWidth
        />
      </span>
    </span>
  );
}

function formatRating(rating: number, locale: string): string {
  return rating.toLocaleString(locale === "en" ? "en-US" : "sv-SE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

const linkClassName =
  "mt-4 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary underline decoration-beam/55 underline-offset-4 transition-colors hover:text-beam hover:decoration-beam";

export function ReviewRating({
  label,
  srLabel,
  rating,
  count,
  href,
  locale = "sv",
}: {
  label: string;
  srLabel: string;
  rating: number;
  count: number;
  /** Google Business Profile / Maps reviews URL. */
  href?: string | null;
  locale?: string;
}) {
  const score = formatRating(rating, locale);
  const content = (
    <>
      <span className="font-medium text-text-primary">{label}</span>
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.max(0, Math.min(1, rating - index)) * 100;
          return <Star key={index} fillPercent={fill} />;
        })}
      </span>
      <span>
        {score} ({count})
      </span>
      <span className="sr-only">{srLabel}</span>
    </>
  );

  if (href) {
    return (
      <GoogleMapsLink href={href} className={linkClassName}>
        {content}
      </GoogleMapsLink>
    );
  }

  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
      {content}
    </p>
  );
}
