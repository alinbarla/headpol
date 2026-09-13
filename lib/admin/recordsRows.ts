import { acquisitionLabel } from "@/lib/admin/labels";
import type { RecordsTableRow, Strength } from "@/components/ui/records-table";
import type { AnalyticsSession } from "@/lib/analytics/types";
import { describeLocation } from "@/lib/geo";
import { formatTimestamp } from "@/lib/time";

export const SESSION_STRENGTH_LABELS: Record<Strength, string> = {
  strong: "Deep session",
  weak: "Active",
  veryweak: "Light",
  none: "Beacon only",
};

export function engagementStrength(
  eventCount: number,
  scrollPct: number
): Strength {
  if (eventCount >= 80 || scrollPct >= 75) return "strong";
  if (eventCount >= 20 || scrollPct >= 40) return "weak";
  if (eventCount > 0) return "veryweak";
  return "none";
}

function deviceTag(device: string): string {
  return device.charAt(0).toUpperCase() + device.slice(1);
}

export function sessionToRecord(session: AnalyticsSession): RecordsTableRow {
  const location = describeLocation(session);
  const channel = acquisitionLabel(session.acquisition_channel);
  return {
    id: session.id,
    name: session.page,
    tags: [deviceTag(session.device), location, channel].filter(
      (value): value is string => Boolean(value)
    ),
    last: formatTimestamp(session.started_at),
    strength: engagementStrength(
      session.event_count,
      Number(session.max_scroll_pct)
    ),
    href: `/admin/heatmap/sessions/${session.id}`,
    linkLabel: "Replay",
  };
}

export function visitorToRecord(session: AnalyticsSession): RecordsTableRow {
  const location = describeLocation(session);
  const channel = acquisitionLabel(session.acquisition_channel);
  return {
    id: session.id,
    name: location ?? session.ip ?? session.visitor_id,
    tags: [deviceTag(session.device), channel, session.page].filter(
      (value): value is string => Boolean(value)
    ),
    last: formatTimestamp(session.started_at),
    strength: engagementStrength(
      session.event_count,
      Number(session.max_scroll_pct)
    ),
    href: `/admin/heatmap/sessions/${session.id}`,
    linkLabel: "Open",
  };
}

export function sessionCsvRows(sessions: AnalyticsSession[]) {
  return sessions.map((session) => ({
    id: session.id,
    started_at: session.started_at,
    page: session.page,
    device: session.device,
    ip: session.ip,
    city: session.city,
    region: session.region,
    country: session.country,
    events: session.event_count,
    max_scroll_pct: session.max_scroll_pct,
    visitor_id: session.visitor_id,
    channel: session.acquisition_channel,
    utm_source: session.utm_source,
    utm_medium: session.utm_medium,
    utm_campaign: session.utm_campaign,
    referrer: session.referrer_host ?? session.referrer,
  }));
}
