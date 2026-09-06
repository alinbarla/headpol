import "server-only";

import { getSessionById, listSessionEvents } from "@/lib/analytics/store";
import type { AnalyticsEventRow, AnalyticsSession } from "@/lib/analytics/types";

export type ReplayPayload = {
  session: AnalyticsSession;
  events: AnalyticsEventRow[];
};

export async function loadReplay(sessionId: string): Promise<ReplayPayload | null> {
  const session = await getSessionById(sessionId);
  if (!session) return null;

  const events = await listSessionEvents(sessionId);
  return { session, events };
}
