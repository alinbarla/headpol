import { isAuthorizedCron, unauthorized } from "@/lib/cron";
import { refreshPlaceReviews } from "@/lib/places/reviews";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Background Google Places refresh. Registered in vercel.json (Hobby second
 * cron slot, after reminders). Optional Supabase pg_cron can call the same
 * path — see supabase/reviews-cron-schedule.example.sql.
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
