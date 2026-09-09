import { isAuthorizedCron, unauthorized } from "@/lib/cron";
import { refreshPlaceReviews } from "@/lib/places/reviews";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Background Google Places refresh. Not registered in vercel.json (Hobby is
 * capped at two crons) — scheduled via Supabase pg_cron (see
 * supabase/reviews-cron-schedule.example.sql) and also invoked from the daily
 * analytics-retention cron.
 */
async function handle(request: Request) {
  if (!isAuthorizedCron(request)) return unauthorized();

  const result = await refreshPlaceReviews();
  return Response.json(result, { status: result.ok ? 200 : 502 });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
