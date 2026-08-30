import { StarIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ReviewAvatar } from "@/components/reviews/ReviewAvatar";
import { ReviewText } from "@/components/reviews/ReviewText";
import {
  getGooglePlaceId,
  getPlaceReviews,
  type PlaceReview,
} from "@/lib/places/reviews";

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

function ReviewStars({
  rating,
  srLabel,
}: {
  rating: number;
  srLabel: string;
}) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.max(0, Math.min(1, rating - index)) * 100;
          return <Star key={index} fillPercent={fill} />;
        })}
      </span>
      <span className="sr-only">{srLabel}</span>
    </span>
  );
}

function AuthorName({ review }: { review: PlaceReview }) {
  const name = review.authorAttribution.displayName;
  const href = review.authorAttribution.uri;
  const className = "font-semibold text-text-primary";

  if (!href) {
    return <p className={className}>{name}</p>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} transition-colors hover:text-beam`}
    >
      {name}
    </a>
  );
}

export async function GoogleReviews() {
  const data = await getPlaceReviews();
  if (data.reviews.length === 0) return null;

  const t = await getTranslations("reviews");
  const placeId = getGooglePlaceId();
  const writeReviewHref = placeId
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`
    : null;

  const ratingLabel =
    data.rating != null
      ? data.rating.toLocaleString("sv-SE", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })
      : null;

  return (
    <div className="mt-12">
      <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3
          id="google-reviews-heading"
          className="headline-display text-2xl font-bold text-text-primary sm:text-3xl"
        >
          {t("googleTitle")}
        </h3>
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {t("googleAttribution")}
        </span>
      </div>

      {ratingLabel && data.rating != null && data.userRatingCount != null ? (
        <p className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
          <ReviewStars
            rating={data.rating}
            srLabel={t("googleStarsSr", { rating: ratingLabel })}
          />
          <span>
            {t("googleSummary", {
              rating: ratingLabel,
              count: data.userRatingCount,
            })}
          </span>
        </p>
      ) : null}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.reviews.map((review) => {
          const starSr = t("googleStarsSr", {
            rating: review.rating.toLocaleString("sv-SE"),
          });

          return (
            <li key={review.name}>
              <blockquote className="h-full rounded-2xl border border-white/10 bg-void-elevated p-5">
                <div className="flex items-center gap-3">
                  {review.authorAttribution.photoUri ? (
                    <ReviewAvatar src={review.authorAttribution.photoUri} />
                  ) : null}
                  <div className="min-w-0">
                    <AuthorName review={review} />
                    <div className="mt-1">
                      <ReviewStars rating={review.rating} srLabel={starSr} />
                    </div>
                  </div>
                </div>
                {review.text?.text ? (
                  <ReviewText
                    text={review.text.text}
                    moreLabel={t("googleReadMore")}
                    lessLabel={t("googleReadLess")}
                  />
                ) : null}
                {review.relativePublishTimeDescription ? (
                  <cite className="mt-3 block text-xs not-italic text-text-muted">
                    {review.relativePublishTimeDescription}
                  </cite>
                ) : null}
              </blockquote>
            </li>
          );
        })}
      </ul>

      {writeReviewHref ? (
        <p className="mt-6">
          <a
            href={writeReviewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-beam hover:underline"
          >
            {t("googleCta")}
          </a>
        </p>
      ) : null}
    </div>
  );
}
