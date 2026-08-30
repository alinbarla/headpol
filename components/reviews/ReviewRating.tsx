import { StarIcon } from "lucide-react";

const SCORE = "4.9";
const COUNT = "134";
const FIFTH_STAR_FILL = 75;

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

export function ReviewRating({
  label,
  srLabel,
}: {
  label: string;
  srLabel: string;
}) {
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
      <span className="font-medium text-text-primary">{label}</span>
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        <Star fillPercent={100} />
        <Star fillPercent={100} />
        <Star fillPercent={100} />
        <Star fillPercent={100} />
        <Star fillPercent={FIFTH_STAR_FILL} />
      </span>
      <span>
        {SCORE} ({COUNT})
      </span>
      <span className="sr-only">{srLabel}</span>
    </p>
  );
}
