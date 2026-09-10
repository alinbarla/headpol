import { getLocale, getTranslations } from "next-intl/server";
import { ReviewRating } from "@/components/reviews/ReviewRating";
import {
  getGoogleBusinessProfileUrl,
  getPlaceReviews,
} from "@/lib/places/reviews";

/**
 * Server component: loads live Google rating/count and links to the
 * business profile. Renders nothing until Places data is available.
 */
export async function LiveReviewRating({
  namespace = "hero",
}: {
  namespace?: "hero" | "cluster";
}) {
  const data = await getPlaceReviews();
  if (data.rating == null || data.userRatingCount == null) return null;

  const locale = await getLocale();
  const t = await getTranslations(namespace);
  const href = getGoogleBusinessProfileUrl(data);
  const ratingLabel = data.rating.toLocaleString(
    locale === "en" ? "en-US" : "sv-SE",
    { minimumFractionDigits: 1, maximumFractionDigits: 1 }
  );

  return (
    <ReviewRating
      label={t("ratingLabel")}
      srLabel={t("ratingSr", {
        rating: ratingLabel,
        count: data.userRatingCount,
      })}
      rating={data.rating}
      count={data.userRatingCount}
      href={href}
      locale={locale}
    />
  );
}
