import "server-only";

const REVALIDATE_SECONDS = 43200;
const MAX_REVIEWS = 5;
const FIELD_MASK =
  "reviews,rating,userRatingCount,reviews.authorAttribution,reviews.rating,reviews.text,reviews.relativePublishTimeDescription,reviews.name";

export type PlaceReview = {
  name: string;
  relativePublishTimeDescription?: string;
  rating: number;
  text?: { text: string; languageCode?: string };
  authorAttribution: {
    displayName: string;
    photoUri?: string;
    uri?: string;
  };
};

export type PlaceReviewsData = {
  reviews: PlaceReview[];
  rating: number | null;
  userRatingCount: number | null;
};

const EMPTY: PlaceReviewsData = {
  reviews: [],
  rating: null,
  userRatingCount: null,
};

export function getGooglePlaceId(): string | null {
  const id = process.env.GOOGLE_PLACE_ID?.trim();
  return id || null;
}

function getPlacesApiKey(): string | null {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  return key || null;
}

export function isPlacesConfigured(): boolean {
  return Boolean(getPlacesApiKey() && getGooglePlaceId());
}

type PlacesApiReview = {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: { text?: string; languageCode?: string };
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
    uri?: string;
  };
};

type PlacesApiResponse = {
  reviews?: PlacesApiReview[];
  rating?: number;
  userRatingCount?: number;
};

function normalizeReview(review: PlacesApiReview, index: number): PlaceReview | null {
  const displayName = review.authorAttribution?.displayName?.trim();
  const rating = review.rating;
  if (!displayName || typeof rating !== "number") return null;

  const body = review.text?.text?.trim();

  return {
    name: review.name?.trim() || `review-${index}`,
    relativePublishTimeDescription:
      review.relativePublishTimeDescription?.trim() || undefined,
    rating,
    text: body
      ? { text: body, languageCode: review.text?.languageCode }
      : undefined,
    authorAttribution: {
      displayName,
      photoUri: review.authorAttribution?.photoUri,
      uri: review.authorAttribution?.uri,
    },
  };
}

/**
 * Live Google Place reviews for the homepage. Empty when env is missing or
 * Google errors — callers must hide, not crash.
 */
export async function getPlaceReviews(): Promise<PlaceReviewsData> {
  const apiKey = getPlacesApiKey();
  const placeId = getGooglePlaceId();
  if (!apiKey || !placeId) return EMPTY;

  try {
    const url = new URL(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`
    );
    url.searchParams.set("languageCode", "sv");

    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      const errBody = (await res.text()).slice(0, 500);
      console.error("[places] Places API error:", res.status, errBody);
      return EMPTY;
    }

    const data = (await res.json()) as PlacesApiResponse;
    const reviews = (data.reviews ?? [])
      .map(normalizeReview)
      .filter((review): review is PlaceReview => review !== null)
      .slice(0, MAX_REVIEWS);

    return {
      reviews,
      rating: typeof data.rating === "number" ? data.rating : null,
      userRatingCount:
        typeof data.userRatingCount === "number" ? data.userRatingCount : null,
    };
  } catch (err) {
    console.error("[places] Reviews fetch error:", err);
    return EMPTY;
  }
}
