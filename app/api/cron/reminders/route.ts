import { fromDbTime } from "@/lib/booking";
import { notifyReminder } from "@/lib/bookingNotify";
import { isAuthorizedCron, unauthorized } from "@/lib/cron";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { addDaysToDateKey, stockholmDateKey } from "@/lib/time";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Day-before reminder emails.
 *
 * The schedule in vercel.json is UTC and Sweden shifts between UTC+1 and
 * UTC+2, so "tomorrow" is resolved through the Stockholm calendar rather than
 * the process timezone — otherwise the run drifts a day at the edges.
 */
export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return unauthorized();

  const tomorrow = addDaysToDateKey(stockholmDateKey(), 1);
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, booking_date, booking_time, customer_name, customer_email, customer_address, locale"
    )
    .eq("booking_date", tomorrow)
    .in("status", ["pending", "confirmed"])
    // The guard makes a re-run harmless if the cron fires twice.
    .is("reminder_sent_at", null)
    .not("customer_email", "is", null);

  if (error) {
    console.error("[cron] reminders query failed", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  const bookings = (data ?? []) as Array<{
    id: string;
    booking_date: string;
    booking_time: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_address: string | null;
    locale: string | null;
  }>;

  let sent = 0;

  for (const booking of bookings) {
    if (!booking.customer_email) continue;

    await notifyReminder({
      date: booking.booking_date,
      time: fromDbTime(booking.booking_time),
      name: booking.customer_name ?? "",
      email: booking.customer_email,
      locale: booking.locale ?? "sv",
      address: booking.customer_address ?? "",
    });

    // Marked per booking so a mid-run timeout does not resend to everyone.
    const { error: markError } = await supabase
      .from("bookings")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", booking.id);

    if (!markError) sent += 1;
  }

  return Response.json({ date: tomorrow, candidates: bookings.length, sent });
}
