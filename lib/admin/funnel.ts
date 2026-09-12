import "server-only";

import {
  ACQUISITION_LABELS,
} from "@/lib/admin/labels";
import {
  addDaysToDateKey,
  stockholmDateKey,
} from "@/lib/time";
import {
  getSupabaseAdminClient,
  type AcquisitionChannel,
} from "@/lib/supabase/server";

export type FunnelMetrics = {
  sessions: number;
  bookingsStarted: number;
  paidCount: number;
  revenueOre: number;
};

export type FunnelChannelRow = FunnelMetrics & {
  channel: AcquisitionChannel;
  label: string;
};

export type FunnelReferrerRow = FunnelMetrics & {
  referrerHost: string;
  channel: AcquisitionChannel;
  channelLabel: string;
};

export type AcquisitionFunnelData = {
  days: number;
  fromDay: string;
  toDay: string;
  byChannel: FunnelChannelRow[];
  byReferrer: FunnelReferrerRow[];
  totals: FunnelMetrics;
};

type FunnelDailyRow = {
  day: string;
  acquisition_channel: string;
  referrer_host: string | null;
  sessions: number | string;
  bookings_started: number | string;
  paid_count: number | string;
  revenue_ore: number | string;
};

const CHANNEL_ORDER: AcquisitionChannel[] = [
  "google_ads",
  "organic_search",
  "direct",
  "referral",
  "unknown",
];

function asChannel(value: string): AcquisitionChannel {
  if (
    value === "google_ads" ||
    value === "organic_search" ||
    value === "direct" ||
    value === "referral" ||
    value === "unknown"
  ) {
    return value;
  }
  return "unknown";
}

function num(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function emptyMetrics(): FunnelMetrics {
  return { sessions: 0, bookingsStarted: 0, paidCount: 0, revenueOre: 0 };
}

function addMetrics(target: FunnelMetrics, row: FunnelDailyRow) {
  target.sessions += num(row.sessions);
  target.bookingsStarted += num(row.bookings_started);
  target.paidCount += num(row.paid_count);
  target.revenueOre += num(row.revenue_ore);
}

/**
 * Channel-cohort funnel for the last N Stockholm calendar days (inclusive).
 * Reads `acquisition_funnel_daily` — apply the matching migration first.
 */
export async function getAcquisitionFunnel(
  days = 30
): Promise<AcquisitionFunnelData> {
  const toDay = stockholmDateKey();
  const fromDay = addDaysToDateKey(toDay, -(Math.max(1, days) - 1));
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("acquisition_funnel_daily")
    .select(
      "day, acquisition_channel, referrer_host, sessions, bookings_started, paid_count, revenue_ore"
    )
    .gte("day", fromDay)
    .lte("day", toDay);

  if (error) {
    console.error("[admin] getAcquisitionFunnel failed", error.message);
    return {
      days,
      fromDay,
      toDay,
      byChannel: [],
      byReferrer: [],
      totals: emptyMetrics(),
    };
  }

  const rows = (data ?? []) as FunnelDailyRow[];
  const byChannelMap = new Map<AcquisitionChannel, FunnelMetrics>();
  const byReferrerMap = new Map<
    string,
    FunnelMetrics & { channel: AcquisitionChannel }
  >();
  const totals = emptyMetrics();

  for (const row of rows) {
    addMetrics(totals, row);
    const channel = asChannel(row.acquisition_channel);
    const channelMetrics = byChannelMap.get(channel) ?? emptyMetrics();
    addMetrics(channelMetrics, row);
    byChannelMap.set(channel, channelMetrics);

    const host = row.referrer_host?.trim();
    if (!host) continue;
    const key = `${channel}\0${host}`;
    const referrerMetrics =
      byReferrerMap.get(key) ??
      ({ ...emptyMetrics(), channel } satisfies FunnelMetrics & {
        channel: AcquisitionChannel;
      });
    addMetrics(referrerMetrics, row);
    byReferrerMap.set(key, referrerMetrics);
  }

  const byChannel: FunnelChannelRow[] = CHANNEL_ORDER.filter((channel) =>
    byChannelMap.has(channel)
  ).map((channel) => {
    const metrics = byChannelMap.get(channel)!;
    return {
      channel,
      label: ACQUISITION_LABELS[channel],
      ...metrics,
    };
  });

  // Include any unexpected channel keys that slipped past CHANNEL_ORDER.
  for (const [channel, metrics] of byChannelMap) {
    if (byChannel.some((row) => row.channel === channel)) continue;
    byChannel.push({
      channel,
      label: ACQUISITION_LABELS[channel] ?? channel,
      ...metrics,
    });
  }

  const byReferrer: FunnelReferrerRow[] = [...byReferrerMap.entries()]
    .map(([key, metrics]) => {
      const referrerHost = key.slice(key.indexOf("\0") + 1);
      return {
        referrerHost,
        channel: metrics.channel,
        channelLabel: ACQUISITION_LABELS[metrics.channel],
        sessions: metrics.sessions,
        bookingsStarted: metrics.bookingsStarted,
        paidCount: metrics.paidCount,
        revenueOre: metrics.revenueOre,
      };
    })
    .sort((a, b) => {
      if (b.paidCount !== a.paidCount) return b.paidCount - a.paidCount;
      if (b.bookingsStarted !== a.bookingsStarted) {
        return b.bookingsStarted - a.bookingsStarted;
      }
      return b.sessions - a.sessions;
    })
    .slice(0, 8);

  return { days, fromDay, toDay, byChannel, byReferrer, totals };
}
