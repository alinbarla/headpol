import { isAuthorizedCron, unauthorized } from "@/lib/cron";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Frees slots left behind by abandoned Stripe Checkout sessions.
 *
 * Not registered in vercel.json: Vercel Hobby allows two cron jobs running at
 * most once a day, which is useless for a 20-minute hold. Three things already
 * cover it without a schedule — GET /api/bookings ignores lapsed holds and
 * sweeps them opportunistically, an insert that hits the partial unique index
 * reclaims an expired row, and Stripe sends checkout.session.expired. This
 * endpoint stays for manual runs and for when the project moves to Pro.
 */
export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return unauthorized();

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "expired", hold_expires_at: null })
    .eq("status", "pending")
    .eq("payment_status", "awaiting_payment")
    .lt("hold_expires_at", new Date().toISOString())
    .select("id");

  if (error) {
    console.error("[cron] release-holds failed", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ released: (data ?? []).length });
}
