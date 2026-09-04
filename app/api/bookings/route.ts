import { NextResponse } from "next/server";
import {
  applyDailyBookingCaps,
  buildAvailabilityMap,
  isDateAtBookingCap,
  isSlotOpen,
  type AvailabilityMap,
  type BookingRules,
} from "@/lib/availability";
import { fromDbTime, slotKey, toDbTime } from "@/lib/booking";
import { getAvailabilityOverrides, getBookingRules } from "@/lib/bookingRules";
import { parseBookingContact } from "@/lib/bookingNotify";
import { createBookingCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { addDaysToDateKey, stockholmDateKey } from "@/lib/time";
import {
  getSupabaseAdminClient,
  withSupabaseTimeout,
} from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * How long a slot is held while the customer completes Stripe Checkout. A
 * Checkout Session cannot live less than 30 minutes, and releasing the slot
 * while the session is still payable would let a second customer book a time
 * the first one can still pay for, so the hold has to outlast the session.
 */
const CHECKOUT_HOLD_MINUTES = 31;

export type BookingsGetResponse = {
  /** Slot keys already taken, in `YYYY-MM-DDTHH:MM` form. */
  slots: string[];
  /** Open slot times per date. Dates absent from the map are closed. */
  availability: AvailabilityMap;
  rules: BookingRules;
  error?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rules = await getBookingRules();

  const today = stockholmDateKey();
  const from = normalizeDateKey(searchParams.get("from")) ?? today;
  const to =
    normalizeDateKey(searchParams.get("to")) ??
    addDaysToDateKey(today, rules.horizonDays);

  try {
    const overrides = await getAvailabilityOverrides(from, to);
    const availability = buildAvailabilityMap(from, to, rules, overrides);

    const supabase = getSupabaseAdminClient();
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("bookings")
        .select("booking_date, booking_time, hold_expires_at")
        .gte("booking_date", from)
        .lte("booking_date", to)
        .in("status", ["pending", "confirmed"])
    );

    if (error) {
      // Dead/unreachable Supabase should not block the marketing page.
      return NextResponse.json(
        { slots: [], availability, rules, error: error.message },
        { status: 200 }
      );
    }

    const rows = (data ?? []) as Array<{
      booking_date: string;
      booking_time: string;
      hold_expires_at: string | null;
    }>;

    const now = Date.now();
    const isLapsed = (row: (typeof rows)[number]) =>
      Boolean(
        row.hold_expires_at && new Date(row.hold_expires_at).getTime() <= now
      );

    // An abandoned Stripe Checkout leaves a pending row behind. Treat the slot
    // as free as soon as the hold lapses rather than waiting for cron.
    const booked = rows
      .filter((row) => !isLapsed(row))
      .map((row) => slotKey(row.booking_date, fromDbTime(row.booking_time)));

    // Weekday/weekend daily caps: once the max jobs for that day are held,
    // remaining open hours are returned as unavailable so the picker strikes
    // them out without removing them from the schedule.
    const slots = applyDailyBookingCaps(availability, booked, rules);

    // Vercel Hobby cannot run the 5-minute release cron, so tidy up here
    // instead. Only fires when a lapsed hold was actually observed, and never
    // blocks the response.
    if (rows.some(isLapsed)) {
      void sweepExpiredHolds();
    }

    return NextResponse.json({ slots, availability, rules });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { slots: [], availability: {}, rules, error: message },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      date?: string;
      time?: string;
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      postalCode?: string;
      locale?: string;
      withdrawalConsent?: boolean;
    };

    const { date, time } = body;
    const contact = parseBookingContact(body);

    if ("error" in contact) {
      return NextResponse.json(
        { error: contact.error },
        { status: contact.error === "OUT_OF_SERVICE_AREA" ? 422 : 400 }
      );
    }

    if (!date || !time) {
      return NextResponse.json(
        { error: "Missing date or time" },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json(
        { error: "Invalid date or time format" },
        { status: 400 }
      );
    }

    const rules = await getBookingRules();
    const today = stockholmDateKey();
    const horizon = addDaysToDateKey(today, rules.horizonDays);

    if (date < today || date > horizon) {
      return NextResponse.json({ error: "Date not available" }, { status: 400 });
    }

    const overrides = await getAvailabilityOverrides(date, date);
    if (!isSlotOpen(date, time, rules, overrides)) {
      return NextResponse.json(
        { error: "That time is not available" },
        { status: 400 }
      );
    }

    // Web bookings are prepaid, so there is no path through here without
    // Stripe. Failing loudly beats silently accepting an unpaid booking.
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "PAYMENTS_UNAVAILABLE" },
        { status: 503 }
      );
    }

    // Swedish distance selling rules: starting a service inside the 14-day
    // withdrawal window requires the customer's explicit consent.
    if (body.withdrawalConsent !== true) {
      return NextResponse.json(
        { error: "WITHDRAWAL_CONSENT_REQUIRED" },
        { status: 400 }
      );
    }

    const dayCap = await dayBookingCount(date);
    if (isDateAtBookingCap(date, dayCap, rules)) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      );
    }

    const booking = await insertBooking({
      date,
      time,
      contact,
      priceOre: rules.priceOre,
    });

    if ("error" in booking) {
      return NextResponse.json(
        { error: booking.error },
        { status: booking.status }
      );
    }

    const checkout = await createBookingCheckoutSession({
      bookingId: booking.data.id,
      amountOre: rules.priceOre,
      dateKey: date,
      time,
      email: contact.email,
      locale: contact.locale,
      holdMinutes: CHECKOUT_HOLD_MINUTES,
    });

    if (!checkout) {
      // Do not strand a slot behind a checkout that never opened.
      await releaseBooking(booking.data.id);
      return NextResponse.json(
        { error: "Could not start payment" },
        { status: 502 }
      );
    }

    // The payment record is created up front so the webhook can find the
    // session by id and the admin ledger shows the attempt even if it lapses.
    await recordCheckoutAttempt({
      bookingId: booking.data.id,
      sessionId: checkout.id,
      checkoutUrl: checkout.url,
      amountOre: rules.priceOre,
    });

    return NextResponse.json(
      { booking: booking.data, checkoutUrl: checkout.url },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type InsertedBooking = {
  id: string;
  booking_date: string;
  booking_time: string;
};

type InsertResult = { data: InsertedBooking } | { error: string; status: number };

async function insertBooking(input: {
  date: string;
  time: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    locale: string;
  };
  priceOre: number;
}): Promise<InsertResult> {
  const supabase = getSupabaseAdminClient();

  const row = {
    booking_date: input.date,
    booking_time: toDbTime(input.time),
    status: "pending" as const,
    payment_status: "awaiting_payment" as const,
    price_ore: input.priceOre,
    source: "web" as const,
    // The partial unique index holds the slot for exactly as long as this.
    hold_expires_at: new Date(
      Date.now() + CHECKOUT_HOLD_MINUTES * 60_000
    ).toISOString(),
    customer_name: input.contact.name,
    customer_email: input.contact.email,
    customer_phone: input.contact.phone,
    customer_address: `${input.contact.address}, ${input.contact.postalCode}`,
    locale: input.contact.locale,
  };

  const attempt = async () =>
    withSupabaseTimeout(
      supabase
        .from("bookings")
        .insert(row)
        .select("id, booking_date, booking_time")
        .single()
    );

  let { data, error } = await attempt();

  if (error?.code === "23505") {
    // The conflicting row may be an abandoned checkout whose hold has lapsed.
    // Expire it and retry once before reporting the slot as taken.
    const reclaimed = await expireLapsedHold(input.date, toDbTime(input.time));
    if (!reclaimed) {
      return { error: "This time slot is already booked", status: 409 };
    }
    ({ data, error } = await attempt());
  }

  if (error) {
    if (error.code === "23505") {
      return { error: "This time slot is already booked", status: 409 };
    }
    return { error: error.message, status: 500 };
  }

  return { data: data as InsertedBooking };
}

async function dayBookingCount(dateKey: string): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await withSupabaseTimeout(
    supabase
      .from("bookings")
      .select("hold_expires_at")
      .eq("booking_date", dateKey)
      .in("status", ["pending", "confirmed"])
  );

  if (error || !data) return 0;

  const now = Date.now();
  return data.filter((row) => {
    const hold = (row as { hold_expires_at: string | null }).hold_expires_at;
    return !(hold && new Date(hold).getTime() <= now);
  }).length;
}

async function expireLapsedHold(
  dateKey: string,
  dbTime: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("bookings")
        .update({ status: "expired" })
        .eq("booking_date", dateKey)
        .eq("booking_time", dbTime)
        .eq("status", "pending")
        .eq("payment_status", "awaiting_payment")
        .lt("hold_expires_at", new Date().toISOString())
        .select("id")
    );

    if (error) return false;
    return (data ?? []).length > 0;
  } catch {
    return false;
  }
}

async function releaseBooking(bookingId: string): Promise<void> {
  try {
    const supabase = getSupabaseAdminClient();
    await withSupabaseTimeout(
      supabase.from("bookings").update({ status: "expired" }).eq("id", bookingId)
    );
  } catch {
    // The hold expires on its own within CHECKOUT_HOLD_MINUTES regardless.
  }
}

/**
 * `payments` has RLS enabled with no policies, so this needs the service role
 * key rather than the shared public client.
 */
async function recordCheckoutAttempt(input: {
  bookingId: string;
  sessionId: string;
  checkoutUrl: string;
  amountOre: number;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("payments").insert({
      booking_id: input.bookingId,
      provider: "stripe",
      stripe_checkout_session_id: input.sessionId,
      amount_ore: input.amountOre,
      status: "awaiting_payment",
      checkout_url: input.checkoutUrl,
    });
  } catch (error) {
    // The customer can still pay; the webhook will not find a row to update,
    // so log loudly rather than failing the booking they already started.
    console.error("[bookings] could not record checkout attempt", error);
  }
}

/** Opportunistic replacement for the 5-minute cron on Vercel Hobby. */
async function sweepExpiredHolds(): Promise<void> {
  try {
    const supabase = getSupabaseAdminClient();
    await supabase
      .from("bookings")
      .update({ status: "expired", hold_expires_at: null })
      .eq("status", "pending")
      .eq("payment_status", "awaiting_payment")
      .lt("hold_expires_at", new Date().toISOString());
  } catch (error) {
    console.error("[bookings] hold sweep failed", error);
  }
}

function normalizeDateKey(value: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}
