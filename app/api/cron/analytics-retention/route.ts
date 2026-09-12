import { isAuthorizedCron, unauthorized } from "@/lib/cron";
import { refreshPlaceReviews } from "@/lib/places/reviews";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Refreshes the stored Google reviews snapshot.
 *
 * Path kept as `/api/cron/analytics-retention` so the existing Hobby cron in
 * vercel.json keeps working after first-party heatmap collection was removed.
 * Optional Supabase pg_cron can still call `/api/cron/reviews` directly.
 */
export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return unauthorized();

  const reviews = await refreshPlaceReviews();
  return Response.json({ reviews });
}
