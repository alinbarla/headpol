import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show"
  | "expired";

export type PaymentStatus =
  | "unpaid"
  | "awaiting_payment"
  | "paid"
  | "refunded"
  | "partially_refunded";

export type BookingSource = "web" | "phone" | "walk_in" | "admin";

export type BookingRecord = {
  id: string;
  booking_date: string;
  booking_time: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  locale: string | null;
  source: BookingSource;
  payment_status: PaymentStatus;
  price_ore: number;
  internal_notes: string | null;
  hold_expires_at: string | null;
  rescheduled_from_id: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  reminder_sent_at: string | null;
};

export type PaymentRecord = {
  id: string;
  booking_id: string;
  provider: "stripe" | "manual";
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_ore: number;
  currency: string;
  status:
    | "awaiting_payment"
    | "paid"
    | "failed"
    | "cancelled"
    | "refunded"
    | "partially_refunded";
  method: string | null;
  paid_at: string | null;
  receipt_url: string | null;
  checkout_url: string | null;
  created_at: string;
  updated_at: string;
};

export type RefundRecord = {
  id: string;
  payment_id: string;
  booking_id: string;
  stripe_refund_id: string | null;
  amount_ore: number;
  reason: string | null;
  status: "pending" | "succeeded" | "failed" | "canceled";
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AvailabilityOverrideRecord = {
  id: string;
  override_date: string;
  start_time: string | null;
  end_time: string | null;
  kind: "block" | "open";
  note: string | null;
  created_at: string;
};

let supabase: SupabaseClient | null = null;
let adminSupabase: SupabaseClient | null = null;

function createSupabaseClient(key: string, timeoutMs: number): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error("Missing Supabase env var: NEXT_PUBLIC_SUPABASE_URL");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) }),
    },
  });
}

export function getSupabaseServerClient(): SupabaseClient {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(
      "Missing Supabase env vars: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  if (!supabase) {
    supabase = createSupabaseClient(key, 4000);
  }

  return supabase;
}

/**
 * Admin and payment writes touch tables with RLS enabled and no policies, so
 * the anon key would fail silently. The service role key is mandatory here.
 * The timeout is longer than the public client's because admin pages fan out
 * across bookings, payments and refunds.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. The admin and Stripe webhook write to tables that RLS blocks for the anon key."
    );
  }

  if (!adminSupabase) {
    adminSupabase = createSupabaseClient(key, 10000);
  }

  return adminSupabase;
}

export async function withSupabaseTimeout<T>(
  work: PromiseLike<T>,
  ms = 2500
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      Promise.resolve(work),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Supabase timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
