import "server-only";

import { listBookingsBetween } from "@/lib/admin/data";
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/admin/labels";
import { fromDbTime } from "@/lib/booking";
import { toolHeadline } from "@/lib/seo/overview";
import { latestAuditLogs } from "@/lib/seo/store";
import { SEO_AUDIT_TYPES } from "@/lib/seo/types";
import { addDaysToDateKey, stockholmDateKey } from "@/lib/time";
import { composeUserContent } from "./compose";

export { composeUserContent };

const CONTEXT_CAP = 6000;

const SYSTEM_PROMPT = `You are the Strålkastarpolering admin assistant. You help the shop owner with bookings, payments, availability, and SEO data already collected for this business.

Rules:
- Reply in Swedish unless the user writes in another language.
- Use only the snapshot and conversation below. If a figure is missing or a tool has never run, say so. Never invent SEO scores, ranks, volumes, or booking details.
- Do not mention the underlying model vendor or product name.
- Do not include customer email or phone unless the user explicitly asked for contact details (they are omitted from the snapshot).
- You cannot change bookings, refunds, or SEO checks. Describe what to do in the admin UI instead.
- Be concise. Prefer tables or short lists for bookings.`;

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

export async function buildAssistantContext(): Promise<string> {
  const [bookings, seo] = await Promise.all([bookingLines(), seoLines()]);
  return truncate([bookings, "", seo].join("\n"), CONTEXT_CAP);
}

export function systemPrompt(): string {
  return SYSTEM_PROMPT;
}
