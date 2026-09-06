import { isAuthorizedCron, unauthorized } from "@/lib/cron";
import { getAnalyticsSettings } from "@/lib/analytics/settings";
import { deleteExpiredAnalytics } from "@/lib/analytics/store";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Deletes heatmap sessions (and cascaded events) older than the configured retention. */
export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return unauthorized();

  const settings = await getAnalyticsSettings();

  try {
    const deleted = await deleteExpiredAnalytics(settings.retentionDays);
    return Response.json({
      retentionDays: settings.retentionDays,
      deletedSessions: deleted,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Retention failed";
    console.error("[cron] analytics-retention failed", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
