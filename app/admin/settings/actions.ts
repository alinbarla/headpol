"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/app/admin/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { refreshPlaceReviews } from "@/lib/places/reviews";

function fail(message: string): ActionState {
  return { ok: false, message };
}

/**
 * Manual Google Places refresh — same path as `/api/cron/reviews` and the
 * Supabase pg_cron schedule.
 */
export async function refreshGoogleReviewsAction(
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const result = await refreshPlaceReviews();

  await logAdminAction("reviews.refresh", {
    entityType: "google_reviews",
    details: {
      ok: result.ok,
      source: result.source,
      reviewCount: result.reviewCount,
      rating: result.rating,
      userRatingCount: result.userRatingCount,
      fetchedAt: result.fetchedAt,
      error: result.error ?? null,
    },
  });

  revalidatePath("/admin/settings");

  if (!result.ok) {
    return fail(result.error ?? "Could not fetch Google reviews");
  }

  const rating =
    result.rating != null
      ? result.rating.toLocaleString("sv-SE", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })
      : "—";
  const count = result.userRatingCount ?? 0;

  return {
    ok: true,
    message: `Fetched ${result.reviewCount} reviews · ${rating} (${count})`,
  };
}
