import "server-only";

import type { AvailabilityOverride } from "@/lib/availability";
import {
  addDaysToDateKey,
  endOfIsoWeek,
  endOfMonth,
  startOfIsoWeek,
  startOfMonth,
  stockholmDateKey,
  stockholmDateTimeToInstant,
} from "@/lib/time";
import {
  getSupabaseAdminClient,
  type BookingRecord,
  type BookingStatus,
  type PaymentRecord,
  type RefundRecord,
} from "@/lib/supabase/server";

const BOOKING_COLUMNS =
  "id, booking_date, booking_time, status, created_at, updated_at, customer_name, customer_email, customer_phone, customer_address, locale, source, payment_status, price_ore, internal_notes, hold_expires_at, rescheduled_from_id, cancelled_at, cancellation_reason, reminder_sent_at";

/** Statuses that occupy a slot; `cancelled` and `expired` release it. */
export const ACTIVE_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "no_show",
];

export async function listBookingsBetween(
  fromDateKey: string,
  toDateKey: string,
  statuses: BookingStatus[] = ACTIVE_STATUSES
): Promise<BookingRecord[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .gte("booking_date", fromDateKey)
    .lte("booking_date", toDateKey)
    .in("status", statuses)
    .order("booking_date", { ascending: true })
    .order("booking_time", { ascending: true });

  if (error) {
    console.error("[admin] listBookingsBetween failed", error.message);
    return [];
  }

  return (data ?? []) as BookingRecord[];
}

export async function getBookingById(
  id: string
): Promise<BookingRecord | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[admin] getBookingById failed", error.message);
    return null;
  }

  return (data as BookingRecord) ?? null;
}

export async function getPaymentsForBooking(
  bookingId: string
): Promise<PaymentRecord[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as PaymentRecord[];
}

export async function getRefundsForBooking(
  bookingId: string
): Promise<RefundRecord[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("refunds")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as RefundRecord[];
}

export type BookingSearch = {
  query?: string;
  status?: BookingStatus | "all";
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

/**
 * Powers the "a customer is on the phone" lookup, so it searches name, email
 * and phone at once. Phone matching strips formatting from the query because
 * numbers are stored exactly as typed.
 */
export async function searchBookings(
  search: BookingSearch
): Promise<{ rows: BookingRecord[]; total: number }> {
  const supabase = getSupabaseAdminClient();
  const limit = Math.min(search.limit ?? 50, 200);
  const offset = search.offset ?? 0;

  let request = supabase
    .from("bookings")
    .select(BOOKING_COLUMNS, { count: "exact" })
    .order("booking_date", { ascending: false })
    .order("booking_time", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search.status && search.status !== "all") {
    request = request.eq("status", search.status);
  }
  if (search.from) request = request.gte("booking_date", search.from);
  if (search.to) request = request.lte("booking_date", search.to);

  const term = search.query?.trim();
  if (term) {
    const escaped = term.replace(/[%,()]/g, " ");
    const digits = term.replace(/\D/g, "");
    const filters = [
      `customer_name.ilike.%${escaped}%`,
      `customer_email.ilike.%${escaped}%`,
      `customer_address.ilike.%${escaped}%`,
    ];
    if (digits.length >= 3) {
      filters.push(`customer_phone.ilike.%${digits}%`);
    }
    request = request.or(filters.join(","));
  }

  const { data, error, count } = await request;

  if (error) {
    console.error("[admin] searchBookings failed", error.message);
    return { rows: [], total: 0 };
  }

  return { rows: (data ?? []) as BookingRecord[], total: count ?? 0 };
}

export type DashboardData = {
  today: string;
  tomorrow: string;
  todayBookings: BookingRecord[];
  tomorrowBookings: BookingRecord[];
  needsAttention: BookingRecord[];
  weekRevenueOre: number;
  monthRevenueOre: number;
};

export async function getDashboardData(): Promise<DashboardData> {
  const today = stockholmDateKey();
  const tomorrow = addDaysToDateKey(today, 1);
  const weekStart = startOfIsoWeek(today);
  const weekEnd = endOfIsoWeek(today);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const paidFrom = weekStart < monthStart ? weekStart : monthStart;

  const supabase = getSupabaseAdminClient();

  const [twoDays, unconfirmed, revenue] = await Promise.all([
    listBookingsBetween(today, tomorrow),
    // Anything still pending in the past or paid-but-unconfirmed needs a look.
    supabase
      .from("bookings")
      .select(BOOKING_COLUMNS)
      .eq("status", "pending")
      .lte("booking_date", today)
      .order("booking_date", { ascending: true }),
    supabase
      .from("payments")
      .select("amount_ore, paid_at")
      .eq("status", "paid")
      .gte("paid_at", stockholmDateTimeToInstant(paidFrom, "00:00").toISOString()),
  ]);

  const paid = (revenue.data ?? []) as Array<{
    amount_ore: number;
    paid_at: string | null;
  }>;

  const sumBetween = (from: string, to: string) =>
    paid
      .filter((row) => {
        if (!row.paid_at) return false;
        const day = stockholmDateKey(new Date(row.paid_at));
        return day >= from && day <= to;
      })
      .reduce((total, row) => total + row.amount_ore, 0);

  return {
    today,
    tomorrow,
    todayBookings: twoDays.filter((b) => b.booking_date === today),
    tomorrowBookings: twoDays.filter((b) => b.booking_date === tomorrow),
    needsAttention: ((unconfirmed.data ?? []) as BookingRecord[]).filter(
      // A live hold is not an anomaly, it is a checkout in progress.
      (b) =>
        !b.hold_expires_at || new Date(b.hold_expires_at).getTime() < Date.now()
    ),
    weekRevenueOre: sumBetween(weekStart, weekEnd),
    monthRevenueOre: sumBetween(monthStart, monthEnd),
  };
}

export type PaymentLedgerRow = PaymentRecord & {
  booking: Pick<
    BookingRecord,
    "booking_date" | "booking_time" | "customer_name" | "customer_email"
  > | null;
};

export async function listPayments(
  fromDateKey: string,
  toDateKey: string
): Promise<PaymentLedgerRow[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("payments")
    .select(
      "*, booking:bookings(booking_date, booking_time, customer_name, customer_email)"
    )
    .gte("created_at", `${fromDateKey}T00:00:00Z`)
    .lte("created_at", `${toDateKey}T23:59:59Z`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin] listPayments failed", error.message);
    return [];
  }

  return (data ?? []) as PaymentLedgerRow[];
}

export async function listRefunds(
  fromDateKey: string,
  toDateKey: string
): Promise<RefundRecord[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("refunds")
    .select("*")
    .gte("created_at", `${fromDateKey}T00:00:00Z`)
    .lte("created_at", `${toDateKey}T23:59:59Z`)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as RefundRecord[];
}

export async function listOverrides(
  fromDateKey: string,
  toDateKey: string
): Promise<AvailabilityOverride[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("availability_overrides")
    .select("id, override_date, start_time, end_time, kind, note")
    .gte("override_date", fromDateKey)
    .lte("override_date", toDateKey)
    .order("override_date", { ascending: true });

  if (error) return [];

  return ((data ?? []) as AvailabilityOverride[]).map((row) => ({
    ...row,
    start_time: row.start_time ? row.start_time.slice(0, 5) : null,
    end_time: row.end_time ? row.end_time.slice(0, 5) : null,
  }));
}

export type AuditEntry = {
  id: number;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export async function listRecentAudit(limit = 50): Promise<AuditEntry[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("id, action, entity_type, entity_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as AuditEntry[];
}
