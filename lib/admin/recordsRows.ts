import { acquisitionLabel } from "@/lib/admin/labels";
import { referrerSourceLabel } from "@/lib/attribution/constants";
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

export function visitorToRecord(
  session: AnalyticsSession,
  options: { booked: boolean }
): RecordsTableRow {
  const location = describeLocation(session);
  const channel = acquisitionLabel(session.acquisition_channel);
  const campaign = session.utm_campaign?.trim() || null;
  const referrer = referrerSourceLabel(
    session.referrer_host,
    session.utm_source
  );
  return {
    id: session.id,
    name: location ?? session.ip ?? session.visitor_id,
    tags: [
      options.booked ? "Booked" : "Not booked",
      deviceTag(session.device),
      channel,
      session.page,
      campaign,
      referrer,
    ].filter((value): value is string => Boolean(value)),
    last: formatTimestamp(session.started_at),
    lastAt: session.started_at,
    device: session.device,
    source: session.acquisition_channel ?? "unknown",
    strength: engagementStrength(
      session.event_count,
      Number(session.max_scroll_pct)
    ),
    href: `/admin/visitors/${session.id}`,
    linkLabel: "Open",
  };
}

export function sessionCsvRows(
  sessions: AnalyticsSession[],
  options?: {
    bookedSessionIds?: Set<string>;
    bookedIps?: Set<string>;
    bookedVisitorIds?: Set<string>;
    forcedBookedSessionIds?: Set<string>;
    forcedNotBookedSessionIds?: Set<string>;
  }
) {
  return sessions.map((session) => {
    const forcedBooked = options?.forcedBookedSessionIds?.has(session.id);
    const forcedNotBooked =
      options?.forcedNotBookedSessionIds?.has(session.id);
    const booked =
      session.booked_override === true ||
      forcedBooked ||
      (session.booked_override !== false &&
        !forcedNotBooked &&
        (options?.bookedSessionIds?.has(session.id) ||
          (session.visitor_id
            ? options?.bookedVisitorIds?.has(session.visitor_id)
            : false) ||
          (session.ip ? options?.bookedIps?.has(session.ip) : false)));
    return {
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
      booked: booked ? "yes" : "no",
    };
  });
}
