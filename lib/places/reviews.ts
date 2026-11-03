import "server-only";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import {
  getSupabaseAdminClient,
  withSupabaseTimeout,
} from "@/lib/supabase/server";

const MAX_REVIEWS = 5;
const GOOGLE_REVIEWS_SETTINGS_KEY = "google_place_reviews";
/** Latest failed refresh, shown in admin until the next success clears it. */
const GOOGLE_REVIEWS_ERROR_KEY = "google_place_reviews_error";
const FIELD_MASK = [
  "rating",
  "userRatingCount",
  "googleMapsUri",
  "googleMapsLinks.placeUri",
  "googleMapsLinks.reviewsUri",
  "googleMapsLinks.writeAReviewUri",
  "reviews",
  "reviews.name",
  "reviews.rating",
  "reviews.text",
  "reviews.relativePublishTimeDescription",
  "reviews.googleMapsUri",
  "reviews.authorAttribution",
].join(",");

export type PlaceReview = {
  name: string;
  relativePublishTimeDescription?: string;
  rating: number;
  /** Direct Google Maps link to this review on the business profile. */
  googleMapsUri?: string;
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
  /** Google Maps URL for the business profile. */
  googleMapsUri?: string;
  /** Google Maps URL that opens the place's reviews list. */
  reviewsUri?: string;
  /** Google Maps URL to write a new review. */
  writeReviewUri?: string;
};

type StoredPlaceReviews = PlaceReviewsData & {
  fetchedAt: string;
};

const EMPTY: PlaceReviewsData = {
  reviews: [],
  rating: null,
  userRatingCount: null,
  googleMapsUri: undefined,
  reviewsUri: undefined,
  writeReviewUri: undefined,
};

/** Best URL for the public Google Business / Maps profile. */
export function getGoogleBusinessProfileUrl(
  data?: Pick<PlaceReviewsData, "googleMapsUri" | "reviewsUri"> | null
): string | null {
  if (data?.reviewsUri?.trim()) return data.reviewsUri.trim();
  if (data?.googleMapsUri?.trim()) return data.googleMapsUri.trim();
  const placeId = getGooglePlaceId();
  if (!placeId) return null;
  return `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}`;
}

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
  googleMapsUri?: string;
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
  googleMapsUri?: string;
  googleMapsLinks?: {
    placeUri?: string;
    reviewsUri?: string;
    writeAReviewUri?: string;
  };
};

type PlacesApiError = {
  error?: {
    status?: string;
    message?: string;
    details?: Array<{ metadata?: Record<string, string> }>;
  };
};

/**
 * One line for logs, the cron response and the admin card. Google lists the
 * quota cap under `details[].metadata.quota_limit_value`, often several
 * hundred characters into the body, so it is pulled out explicitly.
 */
function describePlacesError(status: number, body: string): string {
  try {
    const { error } = JSON.parse(body) as PlacesApiError;
    if (error?.message) {
      const label = [String(status), error.status].filter(Boolean).join(" ");
      const limit = error.details?.find(
        (detail) => detail.metadata?.quota_limit_value
      )?.metadata?.quota_limit_value;
      return `Places API ${label}: ${error.message}${
        limit ? ` (quota limit: ${limit})` : ""
      }`;
    }
  } catch {
    // Not JSON; fall back to the raw text below.
  }
  return `Places API ${status}: ${body.slice(0, 300)}`;
}

function normalizeReview(review: PlacesApiReview, index: number): PlaceReview | null {
  const displayName = review.authorAttribution?.displayName?.trim();
  const rating = review.rating;
  if (!displayName || typeof rating !== "number") return null;

  const body = review.text?.text?.trim();
  const googleMapsUri = review.googleMapsUri?.trim() || undefined;

  return {
    name: review.name?.trim() || `review-${index}`,
    relativePublishTimeDescription:
      review.relativePublishTimeDescription?.trim() || undefined,
    rating,
    googleMapsUri,
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

function parseStored(value: unknown): StoredPlaceReviews | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.fetchedAt !== "string") return null;
  if (!Array.isArray(raw.reviews)) return null;

  const reviews = raw.reviews.filter((review): review is PlaceReview => {
    if (!review || typeof review !== "object") return false;
    const item = review as Partial<PlaceReview>;
    return (
      typeof item.name === "string" &&
      typeof item.rating === "number" &&
      typeof item.authorAttribution?.displayName === "string"
    );
  }).map((review) => ({
    ...review,
    googleMapsUri:
      typeof review.googleMapsUri === "string" && review.googleMapsUri.trim()
        ? review.googleMapsUri.trim()
        : undefined,
  }));

  return {
    fetchedAt: raw.fetchedAt,
    reviews,
    rating: typeof raw.rating === "number" ? raw.rating : null,
    userRatingCount:
      typeof raw.userRatingCount === "number" ? raw.userRatingCount : null,
    googleMapsUri:
      typeof raw.googleMapsUri === "string" && raw.googleMapsUri.trim()
        ? raw.googleMapsUri.trim()
        : undefined,
    reviewsUri:
      typeof raw.reviewsUri === "string" && raw.reviewsUri.trim()
        ? raw.reviewsUri.trim()
        : undefined,
    writeReviewUri:
      typeof raw.writeReviewUri === "string" && raw.writeReviewUri.trim()
        ? raw.writeReviewUri.trim()
        : undefined,
  };
}

function toPublicPlaceReviews(
  stored: StoredPlaceReviews | PlaceReviewsData
): PlaceReviewsData {
  return {
    reviews: stored.reviews,
    rating: stored.rating,
    userRatingCount: stored.userRatingCount,
    googleMapsUri: stored.googleMapsUri,
    reviewsUri: stored.reviewsUri,
    writeReviewUri: stored.writeReviewUri,
  };
}

export type PlaceReviewsRefreshError = {
  at: string;
  message: string;
};

export type PlaceReviewsSnapshot = {
  configured: boolean;
  fetchedAt: string | null;
  data: PlaceReviewsData;
  /** Set while the latest refresh attempt (cron or admin) has failed. */
  lastError: PlaceReviewsRefreshError | null;
};

/**
 * Admin/status reader: returns the stored snapshot without calling Google.
 * Does not bootstrap a live fetch — use `refreshPlaceReviews` for that.
 */
export async function getStoredPlaceReviewsSnapshot(): Promise<PlaceReviewsSnapshot> {
  const [stored, lastError] = await Promise.all([
    readStoredPlaceReviews(),
    readRefreshError(),
  ]);
  return {
    configured: isPlacesConfigured(),
    fetchedAt: stored?.fetchedAt ?? null,
    data: stored ? toPublicPlaceReviews(stored) : EMPTY,
    lastError,
  };
}

async function readStoredPlaceReviews(): Promise<StoredPlaceReviews | null> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("settings")
        .select("value")
        .eq("key", GOOGLE_REVIEWS_SETTINGS_KEY)
        .maybeSingle()
    );

    if (error || !data) return null;
    return parseStored(data.value);
  } catch (err) {
    console.error("[places] Failed to read stored reviews:", err);
    return null;
  }
}

async function writeStoredPlaceReviews(
  data: PlaceReviewsData
): Promise<StoredPlaceReviews> {
  const stored: StoredPlaceReviews = {
    ...data,
    fetchedAt: new Date().toISOString(),
  };

  const supabase = getSupabaseAdminClient();
  const { error } = await withSupabaseTimeout(
    supabase.from("settings").upsert(
      { key: GOOGLE_REVIEWS_SETTINGS_KEY, value: stored },
      { onConflict: "key" }
    )
  );

  if (error) {
    throw new Error(error.message);
  }

  return stored;
}

async function readRefreshError(): Promise<PlaceReviewsRefreshError | null> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("settings")
        .select("value")
        .eq("key", GOOGLE_REVIEWS_ERROR_KEY)
        .maybeSingle()
    );

    if (error || !data?.value || typeof data.value !== "object") return null;
    const raw = data.value as Record<string, unknown>;
    if (typeof raw.at !== "string" || typeof raw.message !== "string") {
      return null;
    }
    return { at: raw.at, message: raw.message };
  } catch (err) {
    console.error("[places] Failed to read last refresh error:", err);
    return null;
  }
}

/**
 * The cron's response only lives in Vercel logs for about an hour on Hobby,
 * so a failed refresh is also kept here for the admin card. `null` clears it.
 */
async function saveRefreshError(message: string | null): Promise<void> {
  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await withSupabaseTimeout(
      message
        ? supabase.from("settings").upsert(
            {
              key: GOOGLE_REVIEWS_ERROR_KEY,
              value: { at: new Date().toISOString(), message },
            },
            { onConflict: "key" }
          )
        : supabase.from("settings").delete().eq("key", GOOGLE_REVIEWS_ERROR_KEY)
    );

    if (error) {
      console.error("[places] Failed to save refresh error:", error.message);
    }
  } catch (err) {
    console.error("[places] Failed to save refresh error:", err);
  }
}

type GoogleFetchResult =
  | { ok: true; data: PlaceReviewsData }
  | { ok: false; error: string };

/**
 * Live Place Details call, uncached (`cache: "no-store"`). Only the daily
 * cron and the admin "Fetch Google reviews" button call it: each request is
 * billed and counts against the project's per-day GetPlace quota, so public
 * pages read the stored snapshot instead.
 */
export async function fetchPlaceReviewsFromGoogle(): Promise<GoogleFetchResult> {
  const apiKey = getPlacesApiKey();
  const placeId = getGooglePlaceId();
  if (!apiKey || !placeId) {
    return {
      ok: false,
      error: "Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID",
    };
  }

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
      cache: "no-store",
    });

    if (!res.ok) {
      const error = describePlacesError(res.status, await res.text());
      console.error("[places]", error);
      return { ok: false, error };
    }

    const data = (await res.json()) as PlacesApiResponse;
    const reviews = (data.reviews ?? [])
      .map(normalizeReview)
      .filter((review): review is PlaceReview => review !== null)
      .slice(0, MAX_REVIEWS);
    const rating = typeof data.rating === "number" ? data.rating : null;

    if (reviews.length === 0 && rating == null) {
      return { ok: false, error: "Places API returned no review data" };
    }

    const placeUri =
      data.googleMapsLinks?.placeUri?.trim() ||
      data.googleMapsUri?.trim() ||
      undefined;
    const reviewsUri = data.googleMapsLinks?.reviewsUri?.trim() || undefined;
    const writeReviewUri =
      data.googleMapsLinks?.writeAReviewUri?.trim() || undefined;

    return {
      ok: true,
      data: {
        reviews,
        rating,
        userRatingCount:
          typeof data.userRatingCount === "number"
            ? data.userRatingCount
            : null,
        googleMapsUri: placeUri,
        reviewsUri,
        writeReviewUri,
      },
    };
  } catch (err) {
    console.error("[places] Reviews fetch error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Places request failed",
    };
  }
}

export type RefreshPlaceReviewsResult = {
  ok: boolean;
  source: "google" | "unchanged";
  reviewCount: number;
  rating: number | null;
  userRatingCount: number | null;
  fetchedAt: string | null;
  error?: string;
};

/**
 * Invalidate every public route that embeds live Places rating data:
 * locale layout (AggregateRating JSON-LD), homepage hero, reviews section,
 * and all cluster/[slug] pages that render LiveReviewRating.
 */
function revalidatePlaceReviewsPages(): void {
  // Root layout purge — clears client cache and marks all routes stale.
  revalidatePath("/", "layout");
  // next-intl localePrefix "never": file routes live under [locale].
  revalidatePath("/[locale]", "layout");
  revalidatePath("/[locale]/[slug]", "page");
  revalidatePath("/api/reviews");
}

/**
 * Background / manual refresh: pull from Google, persist to settings,
 * revalidate all public pages so the next visitor sees the new snapshot.
 */
export async function refreshPlaceReviews(): Promise<RefreshPlaceReviewsResult> {
  if (!isPlacesConfigured()) {
    return {
      ok: false,
      source: "unchanged",
      reviewCount: 0,
      rating: null,
      userRatingCount: null,
      fetchedAt: null,
      error: "Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID",
    };
  }

  const live = await fetchPlaceReviewsFromGoogle();
  if (!live.ok) {
    await saveRefreshError(live.error);
    return {
      ok: false,
      source: "unchanged",
      reviewCount: 0,
      rating: null,
      userRatingCount: null,
      fetchedAt: null,
      error: live.error,
    };
  }

  try {
    const stored = await writeStoredPlaceReviews(live.data);
    await saveRefreshError(null);
    revalidatePlaceReviewsPages();
    return {
      ok: true,
      source: "google",
      reviewCount: stored.reviews.length,
      rating: stored.rating,
      userRatingCount: stored.userRatingCount,
      fetchedAt: stored.fetchedAt,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Store failed";
    console.error("[places] Failed to store reviews:", message);
    await saveRefreshError(message);
    return {
      ok: false,
      source: "unchanged",
      reviewCount: live.data.reviews.length,
      rating: live.data.rating,
      userRatingCount: live.data.userRatingCount,
      fetchedAt: null,
      error: message,
    };
  }
}

/**
 * Public reader (layout AggregateRating, homepage reviews, LiveReviewRating,
 * /api/reviews). Serves the stored snapshot and never calls Google, so page
 * views do not spend the per-day Places quota the cron needs. React `cache`
 * dedupes the read within a single render; `connection()` keeps these pages
 * rendered per request, so a refresh shows up on the next page view.
 */
export const getPlaceReviews = cache(async (): Promise<PlaceReviewsData> => {
  await connection();
  const stored = await readStoredPlaceReviews();
  return stored ? toPublicPlaceReviews(stored) : EMPTY;
});
