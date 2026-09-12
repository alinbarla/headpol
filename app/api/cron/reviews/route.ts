import { isAuthorizedCron, unauthorized } from "@/lib/cron";
import { getAnalyticsSettings } from "@/lib/analytics/settings";
import { deleteExpiredAnalytics } from "@/lib/analytics/store";
import { refreshPlaceReviews } from "@/lib/places/reviews";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Daily Hobby cron: refresh Google reviews and purge expired analytics
 * sessions (Visitors / heatmap) past the configured retention.
 */
async function handle(request: Request) {
  if (!isAuthorizedCron(request)) return unauthorized();

  const settings = await getAnalyticsSettings();

  let deletedSessions = 0;
  let retentionError: string | null = null;

  try {
    deletedSessions = await deleteExpiredAnalytics(settings.retentionDays);
  } catch (error) {
    retentionError =
      error instanceof Error ? error.message : "Retention failed";
    console.error("[cron] reviews retention failed", retentionError);
  }

  const reviews = await refreshPlaceReviews();

  if (retentionError) {
    return Response.json(
      {
        retentionDays: settings.retentionDays,
        deletedSessions,
        error: retentionError,
        reviews,
      },
      { status: 500 }
    );
  }

  return Response.json({
    retentionDays: settings.retentionDays,
    deletedSessions,
    reviews,
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
