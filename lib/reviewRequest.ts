import "server-only";

import { fromDbTime } from "@/lib/booking";
import { notifyReviewRequest } from "@/lib/bookingNotify";
import {
  getSupabaseAdminClient,
  withSupabaseTimeout,
  type BookingRecord,
} from "@/lib/supabase/server";
import { addDaysToDateKey, stockholmDateKey } from "@/lib/time";

const REVIEW_REQUEST_SETTINGS_KEY = "review_requests";

/** A status clean-up weeks later should not email someone about an old job. */
export const REVIEW_REQUEST_MAX_JOB_AGE_DAYS = 14;

export type ReviewRequestSettings = {
  enabled: boolean;
};

/** Fail closed: a missing row or an unreachable database means no emails. */
export async function getReviewRequestSettings(): Promise<ReviewRequestSettings> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("settings")
        .select("value")
        .eq("key", REVIEW_REQUEST_SETTINGS_KEY)
        .maybeSingle()
    );

    if (error || !data?.value || typeof data.value !== "object") {
      return { enabled: false };
    }
    return {
      enabled: (data.value as Record<string, unknown>).enabled === true,
    };
  } catch {
    return { enabled: false };
  }
}

export async function saveReviewRequestSettings(
  settings: ReviewRequestSettings
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await withSupabaseTimeout(
    supabase.from("settings").upsert(
      {
        key: REVIEW_REQUEST_SETTINGS_KEY,
        value: { enabled: settings.enabled },
      },
      { onConflict: "key" }
    )
  );

  if (error) {
    throw new Error(error.message);
  }
}

export type ReviewRequestOutcome =
  | "sent"
  | "disabled"
  | "no_email"
  | "already_sent"
  | "future_job"
  | "old_job"
  | "failed";

/**
 * Emails the Google review link after a booking is marked Completed, at most
 * once per booking. The row is claimed (`review_request_sent_at is null`)
 * before sending, so a double click or a second Completed is a no-op; a
 * failed send releases the claim so a later Completed can retry.
 */
export async function sendReviewRequestOnce(
  booking: BookingRecord
): Promise<ReviewRequestOutcome> {
  const { enabled } = await getReviewRequestSettings();
  if (!enabled) return "disabled";

  const email = booking.customer_email?.trim();
  if (!email) return "no_email";

  const today = stockholmDateKey();
  if (booking.booking_date > today) return "future_job";
  if (
    booking.booking_date <
    addDaysToDateKey(today, -REVIEW_REQUEST_MAX_JOB_AGE_DAYS)
  ) {
    return "old_job";
  }

  const supabase = getSupabaseAdminClient();
  const claimedAt = new Date().toISOString();
  const { data: claimed, error } = await supabase
    .from("bookings")
    .update({ review_request_sent_at: claimedAt })
    .eq("id", booking.id)
    .eq("status", "completed")
    .is("review_request_sent_at", null)
    .select("id");

  if (error) {
    console.error("[review-request] claim failed", error.message);
    return "failed";
  }
  if (!claimed?.length) return "already_sent";

  const sent = await notifyReviewRequest({
    date: booking.booking_date,
    time: fromDbTime(booking.booking_time),
    name: booking.customer_name ?? "",
    email,
    locale: booking.locale ?? "sv",
    serviceId: booking.service_id,
  });
  if (sent) return "sent";

  const { error: releaseError } = await supabase
    .from("bookings")
    .update({ review_request_sent_at: null })
    .eq("id", booking.id)
    .eq("review_request_sent_at", claimedAt);

  if (releaseError) {
    console.error("[review-request] release failed", releaseError.message);
  }
  return "failed";
}

/**
 * Read on its own rather than through the shared booking columns, so admin
 * booking pages keep working if the code ships before the migration.
 */
export async function getReviewRequestSentAt(
  bookingId: string
): Promise<string | null> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("review_request_sent_at")
      .eq("id", bookingId)
      .maybeSingle();

    if (error || !data) return null;
    const sentAt = (data as { review_request_sent_at?: unknown })
      .review_request_sent_at;
    return typeof sentAt === "string" ? sentAt : null;
  } catch {
    return null;
  }
}
