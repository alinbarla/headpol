import "server-only";

import { revalidatePath } from "next/cache";
import {
  getSupabaseAdminClient,
  withSupabaseTimeout,
} from "@/lib/supabase/server";

const MAX_REVIEWS = 5;
/** Prefer the stored snapshot unless it is older than this. */
const STORE_MAX_AGE_MS = 36 * 60 * 60 * 1000;
const GOOGLE_REVIEWS_SETTINGS_KEY = "google_place_reviews";
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

export type PlaceReviewsSnapshot = {
  configured: boolean;
  fetchedAt: string | null;
  data: PlaceReviewsData;
};

/**
 * Admin/status reader: returns the stored snapshot without calling Google.
 * Does not bootstrap a live fetch — use `refreshPlaceReviews` for that.
 */
export async function getStoredPlaceReviewsSnapshot(): Promise<PlaceReviewsSnapshot> {
  const stored = await readStoredPlaceReviews();
  return {
    configured: isPlacesConfigured(),
    fetchedAt: stored?.fetchedAt ?? null,
    data: stored ? toPublicPlaceReviews(stored) : EMPTY,
  };
}

function isFresh(stored: StoredPlaceReviews, now = Date.now()): boolean {
  const fetchedAt = Date.parse(stored.fetchedAt);
  if (!Number.isFinite(fetchedAt)) return false;
  return now - fetchedAt < STORE_MAX_AGE_MS;
}

/** Older snapshots predate Maps profile URIs — refresh once. */
function hasMapsLinks(stored: StoredPlaceReviews): boolean {
  return Boolean(stored.googleMapsUri || stored.reviewsUri);
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

/**
 * Live Place Details call. Always uncached — used by the background refresh
 * and as a bootstrap when the store is empty.
 */
export async function fetchPlaceReviewsFromGoogle(): Promise<PlaceReviewsData> {
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
      cache: "no-store",
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

    const placeUri =
      data.googleMapsLinks?.placeUri?.trim() ||
      data.googleMapsUri?.trim() ||
      undefined;
    const reviewsUri = data.googleMapsLinks?.reviewsUri?.trim() || undefined;
    const writeReviewUri =
      data.googleMapsLinks?.writeAReviewUri?.trim() || undefined;

    return {
      reviews,
      rating: typeof data.rating === "number" ? data.rating : null,
      userRatingCount:
        typeof data.userRatingCount === "number" ? data.userRatingCount : null,
      googleMapsUri: placeUri,
      reviewsUri,
      writeReviewUri,
    };
  } catch (err) {
    console.error("[places] Reviews fetch error:", err);
    return EMPTY;
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
 * Background refresh: pull from Google, persist to settings, revalidate the
 * homepage so the next visitor sees the new snapshot.
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
  if (live.reviews.length === 0 && live.rating == null) {
    return {
      ok: false,
      source: "unchanged",
      reviewCount: 0,
      rating: null,
      userRatingCount: null,
      fetchedAt: null,
      error: "Places API returned no review data",
    };
  }

  try {
    const stored = await writeStoredPlaceReviews(live);
    // next-intl serves the homepage from app/[locale]/page.tsx with
    // localePrefix "never", so revalidate both the public URL and the
    // locale segment — otherwise a static build keeps stale HTML.
    revalidatePath("/");
    revalidatePath("/sv");
    revalidatePath("/[locale]", "page");
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
    return {
      ok: false,
      source: "unchanged",
      reviewCount: live.reviews.length,
      rating: live.rating,
      userRatingCount: live.userRatingCount,
      fetchedAt: null,
      error: message,
    };
  }
}

/**
 * Homepage reader. Prefer the background-fetched snapshot; bootstrap from
 * Google when the store is empty or stale so the section still appears.
 */
export async function getPlaceReviews(): Promise<PlaceReviewsData> {
  const stored = await readStoredPlaceReviews();
  if (
    stored &&
    isFresh(stored) &&
    stored.reviews.length > 0 &&
    hasMapsLinks(stored)
  ) {
    return toPublicPlaceReviews(stored);
  }

  if (!isPlacesConfigured()) {
    if (stored?.reviews.length) {
      return toPublicPlaceReviews(stored);
    }
    return EMPTY;
  }

  const live = await fetchPlaceReviewsFromGoogle();
  if (live.reviews.length === 0 && live.rating == null) {
    if (stored?.reviews.length) {
      return toPublicPlaceReviews(stored);
    }
    return EMPTY;
  }

  try {
    await writeStoredPlaceReviews(live);
  } catch (err) {
    console.error("[places] Bootstrap store failed:", err);
  }

  return live;
}
