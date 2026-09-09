import { isAuthorizedCron, unauthorized } from "@/lib/cron";
import { getAnalyticsSettings } from "@/lib/analytics/settings";
import { deleteExpiredAnalytics } from "@/lib/analytics/store";
import { refreshPlaceReviews } from "@/lib/places/reviews";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Deletes heatmap sessions (and cascaded events) older than the configured
 * retention. Also refreshes the stored Google reviews snapshot — Hobby only
 * allows two vercel.json crons, so reviews piggyback here in addition to the
 * optional Supabase pg_cron job.
 */
export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return unauthorized();

  const settings = await getAnalyticsSettings();

  let deletedSessions = 0;
  let retentionError: string | null = null;

  try {
    deletedSessions = await deleteExpiredAnalytics(settings.retentionDays);
  } catch (error) {
    retentionError =
      error instanceof Error ? error.message : "Retention failed";
    console.error("[cron] analytics-retention failed", retentionError);
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
