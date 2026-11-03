"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/app/admin/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { refreshPlaceReviews } from "@/lib/places/reviews";
import { saveReviewRequestSettings } from "@/lib/reviewRequest";

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

/** Post-job Google review request email; off until the owner turns it on. */
export async function updateReviewRequestSettingsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = z
    .object({ enabled: z.enum(["true", "false"]) })
    .safeParse({ enabled: formData.get("enabled") });
  if (!parsed.success) return fail("Invalid setting");

  const enabled = parsed.data.enabled === "true";
  try {
    await saveReviewRequestSettings({ enabled });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Could not save settings"
    );
  }

  await logAdminAction("review_requests.settings", {
    entityType: "settings",
    details: { enabled },
  });

  revalidatePath("/admin/settings");
  return {
    ok: true,
    message: enabled ? "Review requests are on" : "Review requests are off",
  };
}
