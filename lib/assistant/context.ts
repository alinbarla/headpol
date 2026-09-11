import "server-only";

import {
  listBookingsBetween,
  listOverrides,
  listPayments,
  listRefunds,
} from "@/lib/admin/data";
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  acquisitionLabel,
  paymentMethodLabel,
} from "@/lib/admin/labels";
import { RANGE_MS } from "@/lib/analytics/constants";
import {
  countEventsSince,
  countVisitors,
  listRecentSessions,
  listTrackedPages,
  listVisitors,
} from "@/lib/analytics/store";
import { formatOre, fromDbTime } from "@/lib/booking";
import { toolHeadline } from "@/lib/seo/overview";
import { latestAuditLogs } from "@/lib/seo/store";
import { SEO_AUDIT_TYPES } from "@/lib/seo/types";
import { addDaysToDateKey, startOfMonth, stockholmDateKey } from "@/lib/time";
import { composeUserContent } from "./compose";
import { lastGithubPushLines } from "./github";
import type { AssistantContextKind } from "./context-kinds";

export { composeUserContent };
export {
  ASSISTANT_CONTEXT_KINDS,
  ASSISTANT_CONTEXT_LABELS,
  isAssistantContextKind,
  type AssistantContextKind,
} from "./context-kinds";

const CONTEXT_CAP = 6000;
const ATTACH_CAP = 20_000;

const SYSTEM_PROMPT = `You are the Strålkastarpolering admin assistant. You help the shop owner with bookings, payments, availability, analytics, SEO, and recent code changes already collected for this business.

Rules:
- Reply in Swedish unless the user writes in another language.
- Use only the snapshot and conversation below. If a figure is missing or a tool has never run, say so. Never invent SEO scores, ranks, volumes, booking details, or git history.
- Do not mention the underlying model vendor or product name.
- Do not include customer email or phone unless the user explicitly asked for contact details (they are omitted from the snapshot).
- You cannot change bookings, refunds, SEO checks, or the GitHub repo. Describe what to do in the admin UI instead.
- Be concise. Prefer tables or short lists for bookings and file lists.`;

function truncate(text: string, cap: number): string {
  if (text.length <= cap) return text;
  return `${text.slice(0, cap - 20).trimEnd()}\n\n[Snapshot truncated]`;
}

function bookingLines(): Promise<string> {
  const from = stockholmDateKey();
  const to = addDaysToDateKey(from, 14);
  return listBookingsBetween(from, to).then((rows) => {
    if (rows.length === 0) {
      return `Bookings ${from}–${to}: none.`;
    }
    const lines = rows.map((row) => {
      const name = row.customer_name?.trim() || "Unnamed";
      return `- ${row.booking_date} ${fromDbTime(row.booking_time)} · ${name} · ${BOOKING_STATUS_LABELS[row.status]} · ${PAYMENT_STATUS_LABELS[row.payment_status]}`;
    });
    return [`Bookings ${from}–${to} (${rows.length}):`, ...lines].join("\n");
  });
}

async function seoLines(): Promise<string> {
  const logs = await latestAuditLogs([...SEO_AUDIT_TYPES]);
  const lines = SEO_AUDIT_TYPES.map((type) => {
    const headline = toolHeadline(type, logs[type]);
    return `- ${type}: ${headline.value} (${headline.hint})`;
  });
  return ["Latest SEO headlines (never run stays —):", ...lines].join("\n");
}

async function visitorsLines(): Promise<string> {
  const fromIso = new Date(Date.now() - RANGE_MS["7d"]).toISOString();
  const [total, rows] = await Promise.all([
    countVisitors({ fromIso, device: "all", channel: "all" }),
    listVisitors({ fromIso, device: "all", channel: "all", limit: 40 }),
  ]);

  const byDevice = new Map<string, number>();
  const byChannel = new Map<string, number>();
  for (const row of rows) {
    byDevice.set(row.device, (byDevice.get(row.device) ?? 0) + 1);
    const channel =
      acquisitionLabel(row.acquisition_channel) ??
      row.acquisition_channel ??
      "unknown";
    byChannel.set(channel, (byChannel.get(channel) ?? 0) + 1);
  }

  const lines = [
    `Visitors last 7d: ${total} sessions (showing up to 40).`,
    "By device (sample):",
    ...[...byDevice.entries()].map(([k, n]) => `- ${k}: ${n}`),
    "By channel (sample):",
    ...[...byChannel.entries()].map(([k, n]) => `- ${k}: ${n}`),
    "Recent:",
    ...rows.slice(0, 25).map((row) => {
      const channel =
        acquisitionLabel(row.acquisition_channel) ??
        row.acquisition_channel ??
        "unknown";
      return `- ${row.started_at.slice(0, 16)} · ${row.page} · ${row.device} · ${channel} · scroll ${row.max_scroll_pct}% · ${row.event_count} events`;
    }),
  ];
  return lines.join("\n");
}

async function heatmapLines(): Promise<string> {
  const fromIso = new Date(Date.now() - RANGE_MS["7d"]).toISOString();
  const [eventCount, pages] = await Promise.all([
    countEventsSince(fromIso),
    listTrackedPages(fromIso),
  ]);

  const topPages = pages.slice(0, 12);
  const sessionCounts = await Promise.all(
    topPages.map(async (page) => {
      const sessions = await listRecentSessions({
        page,
        fromIso,
        device: "all",
        limit: 40,
      });
      const events = sessions.reduce((sum, row) => sum + row.event_count, 0);
      const avgScroll =
        sessions.length === 0
          ? 0
          : Math.round(
              sessions.reduce((sum, row) => sum + row.max_scroll_pct, 0) /
                sessions.length
            );
      return { page, sessions: sessions.length, events, avgScroll };
    })
  );

  sessionCounts.sort((a, b) => b.sessions - a.sessions);

  return [
    `Heatmap summary last 7d: ${eventCount} events across ${pages.length} pages.`,
    "Top pages (session sample ≤40 each):",
    ...sessionCounts.map(
      (row) =>
        `- ${row.page}: ${row.sessions} sessions · ~${row.events} events · avg scroll ${row.avgScroll}%`
    ),
    "Open /admin/heatmap for the visual grid.",
  ].join("\n");
}

async function sessionsLines(): Promise<string> {
  const fromIso = new Date(Date.now() - RANGE_MS["7d"]).toISOString();
  const rows = await listVisitors({
    fromIso,
    device: "all",
    channel: "all",
    limit: 50,
  });

  if (rows.length === 0) {
    return "Sessions last 7d: none.";
  }

  return [
    `Recent sessions last 7d (${rows.length} shown):`,
    ...rows.map((row) => {
      const channel =
        acquisitionLabel(row.acquisition_channel) ??
        row.acquisition_channel ??
        "unknown";
      const ended = row.ended_at.slice(0, 16);
      return `- ${row.started_at.slice(0, 16)}→${ended} · ${row.page} · ${row.device} · ${channel} · scroll ${row.max_scroll_pct}% · ${row.event_count} events · id ${row.id.slice(0, 8)}`;
    }),
  ].join("\n");
}

async function paymentsLines(): Promise<string> {
  const today = stockholmDateKey();
  const from = startOfMonth(today);
  const [payments, refunds] = await Promise.all([
    listPayments(from, today),
    listRefunds(from, today),
  ]);

  const paid = payments.filter((row) => row.status === "paid");
  const paidOre = paid.reduce((sum, row) => sum + row.amount_ore, 0);
  const refundedOre = refunds
    .filter((row) => row.status === "succeeded")
    .reduce((sum, row) => sum + row.amount_ore, 0);

  const lines = [
    `Payments ${from}–${today}: ${payments.length} rows · paid ${formatOre(paidOre)} · refunded ${formatOre(refundedOre)}.`,
    ...payments.slice(0, 40).map((row) => {
      const name = row.booking?.customer_name?.trim() || "Unnamed";
      const when = row.booking
        ? `${row.booking.booking_date} ${fromDbTime(row.booking.booking_time)}`
        : row.created_at.slice(0, 16);
      return `- ${when} · ${name} · ${formatOre(row.amount_ore)} · ${row.status} · ${paymentMethodLabel(row.method)}`;
    }),
  ];

  if (refunds.length > 0) {
    lines.push(
      "Refunds:",
      ...refunds.slice(0, 20).map(
        (row) =>
          `- ${row.created_at.slice(0, 16)} · ${formatOre(row.amount_ore)} · ${row.status}`
      )
    );
  }

  return lines.join("\n");
}

async function calendarLines(): Promise<string> {
  const from = stockholmDateKey();
  const to = addDaysToDateKey(from, 30);
  const [bookings, overrides] = await Promise.all([
    listBookingsBetween(from, to),
    listOverrides(from, to),
  ]);

  const bookingLinesOut =
    bookings.length === 0
      ? ["Bookings: none."]
      : [
          `Bookings ${from}–${to} (${bookings.length}):`,
          ...bookings.map((row) => {
            const name = row.customer_name?.trim() || "Unnamed";
            return `- ${row.booking_date} ${fromDbTime(row.booking_time)} · ${name} · ${BOOKING_STATUS_LABELS[row.status]} · ${PAYMENT_STATUS_LABELS[row.payment_status]}`;
          }),
        ];

  const overrideLines =
    overrides.length === 0
      ? ["Availability overrides: none."]
      : [
          `Availability overrides (${overrides.length}):`,
          ...overrides.map((row) => {
            const range =
              row.start_time && row.end_time
                ? `${row.start_time}–${row.end_time}`
                : "all day";
            const note = row.note?.trim() ? ` · ${row.note.trim()}` : "";
            return `- ${row.override_date} · ${row.kind} · ${range}${note}`;
          }),
        ];

  return [`Calendar ${from}–${to}:`, ...bookingLinesOut, "", ...overrideLines].join(
    "\n"
  );
}

export async function buildContextForKind(
  kind: AssistantContextKind
): Promise<string> {
  const text = await (async () => {
    switch (kind) {
      case "seo":
        return seoLines();
      case "visitors":
        return visitorsLines();
      case "heatmap":
        return heatmapLines();
      case "sessions":
        return sessionsLines();
      case "payments":
        return paymentsLines();
      case "bookings":
        return bookingLines();
      case "calendar":
        return calendarLines();
      case "github":
        return lastGithubPushLines();
      default: {
        const _exhaustive: never = kind;
        return _exhaustive;
      }
    }
  })();

  return truncate(text, ATTACH_CAP);
}

/** Lightweight always-on system snapshot (bookings + SEO). Richer slices attach via paperclip. */
export async function buildAssistantContext(): Promise<string> {
  const [bookings, seo] = await Promise.all([bookingLines(), seoLines()]);
  return truncate([bookings, "", seo].join("\n"), CONTEXT_CAP);
}

export function systemPrompt(): string {
  return SYSTEM_PROMPT;
}
