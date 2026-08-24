import { isAuthorizedCron, unauthorized } from "@/lib/cron";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { stockholmDateKey } from "@/lib/time";

export const runtime = "nodejs";

/**
 * Closes the books on yesterday: confirmed bookings whose date has passed
 * become `completed`, so the Today dashboard and the "needs attention" list
 * only ever show live work.
 *
 * Runs late in the Stockholm evening, and resolves "today" through the
 * Stockholm calendar because Vercel schedules in UTC.
 */
export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return unauthorized();

  const today = stockholmDateKey();
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "completed" })
    .eq("status", "confirmed")
    .lt("booking_date", today)
    .select("id");

  if (error) {
    console.error("[cron] complete-past failed", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ completed: (data ?? []).length });
}
