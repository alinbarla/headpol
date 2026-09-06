import "server-only";

import {
  MAX_EVENTS_PER_SESSION,
} from "@/lib/analytics/constants";
import type {
  AnalyticsEventRow,
  AnalyticsSession,
  HeatmapDevice,
  UserEvent,
} from "@/lib/analytics/types";
import { getSupabaseAdminClient, withSupabaseTimeout } from "@/lib/supabase/server";

export type SessionEnvelope = {
  sessionId: string;
  visitorId: string;
  page: string;
  referrer: string | null;
  viewportW: number;
  viewportH: number;
  documentH: number;
  device: HeatmapDevice;
  ip: string | null;
};

type EventInsert = {
  session_id: string;
  type: UserEvent["type"];
  x: number | null;
  y: number | null;
  scroll_y: number;
  viewport_w: number;
  viewport_h: number;
  document_h: number;
  page: string;
  ts: string;
  dwell_ms: number | null;
  field: string | null;
  value: string | null;
};

function toInsert(
  envelope: SessionEnvelope,
  event: UserEvent
): EventInsert {
  const ts = new Date(event.timestamp).toISOString();
  const scrollY = "scrollY" in event ? event.scrollY : 0;

  if (event.type === "scroll") {
    return {
      session_id: envelope.sessionId,
      type: "scroll",
      x: null,
      y: null,
      scroll_y: Math.round(event.scrollY),
      viewport_w: envelope.viewportW,
      viewport_h: envelope.viewportH,
      document_h: envelope.documentH,
      page: envelope.page,
      ts,
      dwell_ms: null,
      field: null,
      value: null,
    };
  }

  if (event.type === "input") {
    return {
      session_id: envelope.sessionId,
      type: "input",
      x: null,
      y: null,
      scroll_y: 0,
      viewport_w: envelope.viewportW,
      viewport_h: envelope.viewportH,
      document_h: envelope.documentH,
      page: envelope.page,
      ts,
      dwell_ms: null,
      field: event.field,
      value: event.value,
    };
  }

  return {
    session_id: envelope.sessionId,
    type: event.type,
    x: Math.round(event.x),
    y: Math.round(event.y),
    scroll_y: Math.round(scrollY),
    viewport_w: envelope.viewportW,
    viewport_h: envelope.viewportH,
    document_h: envelope.documentH,
    page: envelope.page,
    ts,
    dwell_ms: event.type === "attention" ? Math.round(event.dwellMs) : null,
    field: null,
    value: null,
  };
}

function scrollPercent(scrollY: number, documentH: number, viewportH: number): number {
  const travel = Math.max(1, documentH - viewportH);
  return Math.min(100, Math.max(0, (scrollY / travel) * 100));
}

export function deviceFromUserAgent(ua: string | null): HeatmapDevice {
  if (!ua) return "desktop";
  const value = ua.toLowerCase();
  if (/ipad|tablet/.test(value)) return "tablet";
  if (/mobi|iphone|android/.test(value)) return "mobile";
  return "desktop";
}

export async function startOrTouchSession(
  envelope: SessionEnvelope,
  events: UserEvent[]
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();
  const maxScroll = events.reduce((max, event) => {
    if (!("scrollY" in event)) return max;
    return Math.max(max, scrollPercent(event.scrollY, envelope.documentH, envelope.viewportH));
  }, 0);

  const { data: existing } = await withSupabaseTimeout(
    supabase
      .from("analytics_sessions")
      .select("id, event_count, max_scroll_pct")
      .eq("id", envelope.sessionId)
      .maybeSingle()
  );

  const row = existing as
    | { id: string; event_count: number; max_scroll_pct: number }
    | null;

  if (!row) {
    const { error } = await withSupabaseTimeout(
      supabase.from("analytics_sessions").insert({
        id: envelope.sessionId,
        visitor_id: envelope.visitorId,
        page: envelope.page,
        referrer: envelope.referrer,
        viewport_w: envelope.viewportW,
        viewport_h: envelope.viewportH,
        document_h: envelope.documentH,
        device: envelope.device,
        ip: envelope.ip,
        started_at: now,
        ended_at: now,
        event_count: 0,
        max_scroll_pct: Number(maxScroll.toFixed(2)),
      })
    );

    if (error && error.code !== "23505") {
      throw new Error(error.message);
    }
    return;
  }

  await withSupabaseTimeout(
    supabase
      .from("analytics_sessions")
      .update({
        ended_at: now,
        document_h: envelope.documentH,
        viewport_w: envelope.viewportW,
        viewport_h: envelope.viewportH,
        max_scroll_pct: Number(
          Math.max(Number(row.max_scroll_pct), maxScroll).toFixed(2)
        ),
      })
      .eq("id", envelope.sessionId)
  );
}

export async function insertEventBatch(
  envelope: SessionEnvelope,
  events: UserEvent[]
): Promise<number> {
  if (events.length === 0) return 0;

  const supabase = getSupabaseAdminClient();
  await startOrTouchSession(envelope, events);

  const { data: session } = await withSupabaseTimeout(
    supabase
      .from("analytics_sessions")
      .select("event_count")
      .eq("id", envelope.sessionId)
      .maybeSingle()
  );

  const currentCount =
    (session as { event_count: number } | null)?.event_count ?? 0;
  const room = Math.max(0, MAX_EVENTS_PER_SESSION - currentCount);

  if (room === 0) {
    const incomingMoves = events.filter((event) => event.type === "move").length;
    if (incomingMoves === events.length) return 0;

    const { data: oldestMoves } = await withSupabaseTimeout(
      supabase
        .from("analytics_events")
        .select("id")
        .eq("session_id", envelope.sessionId)
        .eq("type", "move")
        .order("ts", { ascending: true })
        .limit(Math.min(events.length, 40))
    );

    const ids = ((oldestMoves ?? []) as Array<{ id: number }>).map((row) => row.id);
    if (ids.length > 0) {
      await withSupabaseTimeout(
        supabase.from("analytics_events").delete().in("id", ids)
      );
    }
  }

  const kept =
    room >= events.length
      ? events
      : [
          ...events.filter((event) => event.type !== "move"),
          ...events.filter((event) => event.type === "move"),
        ].slice(0, Math.max(room, events.filter((event) => event.type !== "move").length));

  const rows = kept
    .slice(0, Math.max(room, kept.filter((event) => event.type !== "move").length))
    .map((event) => toInsert(envelope, event));

  if (rows.length === 0) return 0;

  const { error } = await withSupabaseTimeout(
    supabase.from("analytics_events").insert(rows)
  );

  if (error) {
    throw new Error(error.message);
  }

  await withSupabaseTimeout(
    supabase
      .from("analytics_sessions")
      .update({
        event_count: currentCount + rows.length,
        ended_at: new Date().toISOString(),
      })
      .eq("id", envelope.sessionId)
  );

  return rows.length;
}

export async function deleteSessions(ids: string[]): Promise<number> {
  const unique = [...new Set(ids)].filter(Boolean);
  if (unique.length === 0) return 0;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await withSupabaseTimeout(
    supabase.from("analytics_sessions").delete().in("id", unique).select("id")
  );
  if (error) throw new Error(error.message);
  return (data ?? []).length;
}

export async function purgeAnalytics(): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await withSupabaseTimeout(
    supabase.from("analytics_sessions").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  );
  if (error) throw new Error(error.message);
}

export async function deleteExpiredAnalytics(retentionDays: number): Promise<number> {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await withSupabaseTimeout(
    supabase
      .from("analytics_sessions")
      .delete()
      .lt("started_at", cutoff)
      .select("id")
  );

  if (error) throw new Error(error.message);
  return (data ?? []).length;
}

export async function listTrackedPages(
  fromIso: string
): Promise<string[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await withSupabaseTimeout(
    supabase
      .from("analytics_sessions")
      .select("page")
      .gte("started_at", fromIso)
      .order("page", { ascending: true })
      .limit(500)
  );

  if (error) throw new Error(error.message);
  const pages = new Set<string>();
  for (const row of (data ?? []) as Array<{ page: string }>) {
    pages.add(row.page);
  }
  return [...pages];
}

export async function listRecentSessions(options: {
  page: string;
  fromIso: string;
  device: HeatmapDevice | "all";
  limit?: number;
}): Promise<AnalyticsSession[]> {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("analytics_sessions")
    .select(
      "id, visitor_id, page, referrer, viewport_w, viewport_h, document_h, device, ip, started_at, ended_at, event_count, max_scroll_pct"
    )
    .eq("page", options.page)
    .gte("started_at", options.fromIso)
    .order("started_at", { ascending: false })
    .limit(options.limit ?? 40);

  if (options.device !== "all") {
    query = query.eq("device", options.device);
  }

  const { data, error } = await withSupabaseTimeout(query);
  if (error) throw new Error(error.message);
  return (data ?? []) as AnalyticsSession[];
}

export async function getSessionById(
  id: string
): Promise<AnalyticsSession | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await withSupabaseTimeout(
    supabase
      .from("analytics_sessions")
      .select(
        "id, visitor_id, page, referrer, viewport_w, viewport_h, document_h, device, ip, started_at, ended_at, event_count, max_scroll_pct"
      )
      .eq("id", id)
      .maybeSingle()
  );

  if (error) throw new Error(error.message);
  return (data as AnalyticsSession | null) ?? null;
}

export async function listSessionEvents(
  sessionId: string
): Promise<AnalyticsEventRow[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await withSupabaseTimeout(
    supabase
      .from("analytics_events")
      .select(
        "id, session_id, type, x, y, scroll_y, viewport_w, viewport_h, document_h, page, ts, dwell_ms, field, value"
      )
      .eq("session_id", sessionId)
      .order("ts", { ascending: true })
      .limit(MAX_EVENTS_PER_SESSION)
  );

  if (error) throw new Error(error.message);
  return (data ?? []) as AnalyticsEventRow[];
}

export async function listEventsForGrid(options: {
  page: string;
  type: "click" | "move" | "attention";
  fromIso: string;
  device: HeatmapDevice | "all";
}): Promise<Array<Pick<AnalyticsEventRow, "x" | "y" | "dwell_ms" | "document_h" | "viewport_w">>> {
  const supabase = getSupabaseAdminClient();
  let sessionIds: string[] | null = null;

  if (options.device !== "all") {
    const { data: sessions, error: sessionError } = await withSupabaseTimeout(
      supabase
        .from("analytics_sessions")
        .select("id")
        .eq("page", options.page)
        .eq("device", options.device)
        .gte("started_at", options.fromIso)
        .limit(2000)
    );
    if (sessionError) throw new Error(sessionError.message);
    sessionIds = ((sessions ?? []) as Array<{ id: string }>).map((row) => row.id);
    if (sessionIds.length === 0) return [];
  }

  let query = supabase
    .from("analytics_events")
    .select("x, y, dwell_ms, document_h, viewport_w")
    .eq("page", options.page)
    .eq("type", options.type)
    .gte("ts", options.fromIso)
    .limit(20_000);

  if (sessionIds) {
    query = query.in("session_id", sessionIds);
  }

  const { data, error } = await withSupabaseTimeout(query);
  if (error) throw new Error(error.message);
  return (data ?? []) as Array<
    Pick<AnalyticsEventRow, "x" | "y" | "dwell_ms" | "document_h" | "viewport_w">
  >;
}

export async function listSessionScrolls(options: {
  page: string;
  fromIso: string;
  device: HeatmapDevice | "all";
}): Promise<Array<{ max_scroll_pct: number }>> {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("analytics_sessions")
    .select("max_scroll_pct")
    .eq("page", options.page)
    .gte("started_at", options.fromIso)
    .limit(5000);

  if (options.device !== "all") {
    query = query.eq("device", options.device);
  }

  const { data, error } = await withSupabaseTimeout(query);
  if (error) throw new Error(error.message);
  return (data ?? []) as Array<{ max_scroll_pct: number }>;
}

export async function countEventsSince(fromIso: string): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await withSupabaseTimeout(
    supabase
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .gte("ts", fromIso)
  );
  if (error) throw new Error(error.message);
  return count ?? 0;
}
