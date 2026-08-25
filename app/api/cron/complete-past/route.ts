import { isAuthorizedCron, unauthorized } from "@/lib/cron";

export const runtime = "nodejs";

/**
 * Completed is a manual admin action (To do → Completed on the booking).
 * The old nightly job used to flip yesterday's confirmed bookings on its own;
 * that path is kept so leftover Vercel cron hits do not 404.
 */
export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return unauthorized();

  return Response.json({
    completed: 0,
    skipped: true,
    reason: "Completed is set by admin, not by schedule",
  });
}
