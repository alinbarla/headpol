import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminNotification } from "@/lib/admin/notifications";
import { fromDbTime, formatOre } from "@/lib/booking";
import { notifyRefund } from "@/lib/bookingNotify";
import { getStripe, mapRefundStatus } from "@/lib/stripe";
import { settlePaidCheckout } from "@/lib/settleStripePayment";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { formatDateKey } from "@/lib/time";

export const runtime = "nodejs";
export const maxDuration = 30;

const HANDLED_EVENTS = new Set<string>([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "charge.refunded",
  "refund.updated",
  "refund.failed",
]);

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // The signature is computed over the exact bytes Stripe sent, so the body
  // must be read raw rather than parsed as JSON.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid payload";
    console.error("[stripe] signature verification failed", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  // Stripe retries aggressively. Claiming the event id first turns a replay
  // into a unique violation, which means the work is already done.
  const supabase = getSupabaseAdminClient();
  const { error: claimError } = await supabase
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });

  if (claimError) {
    if (claimError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[stripe] could not claim event", claimError.message);
    // Returning 500 makes Stripe retry, which is the safe direction.
    return NextResponse.json({ error: "Storage error" }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(event.data.object, event.id);
        break;
      case "checkout.session.async_payment_failed":
        await handleAsyncPaymentFailed(event.data.object, event.id);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object, event.id);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;
      case "refund.updated":
      case "refund.failed":
        await handleRefundUpdated(
          event.data.object as Stripe.Refund,
          event.id,
          event.type
        );
        break;
    }
  } catch (error) {
    console.error(`[stripe] handler failed for ${event.type}`, error);
    await createAdminNotification({
      kind: "webhook_error",
      title: `Stripe webhook failed: ${event.type}`,
      body:
        error instanceof Error
          ? error.message
          : "Handler threw while processing the event",
      stripeEventId: event.id,
    });
    // Release the idempotency claim so the retry can do the work.
    await supabase.from("stripe_events").delete().eq("id", event.id);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  eventId: string
) {
  const result = await settlePaidCheckout(session);
  if (result !== "settled") return;

  const bookingId = session.metadata?.booking_id ?? session.client_reference_id;
  const amount =
    typeof session.amount_total === "number"
      ? formatOre(session.amount_total)
      : null;
  const when = session.metadata?.booking_date
    ? `${formatDateKey(session.metadata.booking_date, "sv")} ${session.metadata.booking_time ?? ""}`.trim()
    : null;

  await createAdminNotification({
    kind: "payment_received",
    title: amount ? `Payment received · ${amount}` : "Payment received",
    body: when ? `Booking ${when}` : null,
    bookingId: bookingId ?? null,
    stripeEventId: eventId,
  });
}

/**
 * A delayed payment method reported failure after Checkout closed. The session
 * is spent, so nothing more can arrive against it and the slot has to go back.
 */
async function handleAsyncPaymentFailed(
  session: Stripe.Checkout.Session,
  eventId: string
) {
  const bookingId = session.metadata?.booking_id ?? session.client_reference_id;
  if (!bookingId) return;

  const supabase = getSupabaseAdminClient();

  await supabase
    .from("payments")
    .update({ status: "failed" })
    .eq("stripe_checkout_session_id", session.id);

  await supabase
    .from("bookings")
    .update({ status: "expired", hold_expires_at: null })
    .eq("id", bookingId)
    .eq("status", "pending")
    .eq("payment_status", "awaiting_payment");

  await createAdminNotification({
    kind: "payment_failed",
    title: "Payment failed",
    body: "A delayed payment (e.g. Swish) failed after checkout.",
    bookingId,
    stripeEventId: eventId,
  });
}

async function handleCheckoutExpired(
  session: Stripe.Checkout.Session,
  eventId: string
) {
  const bookingId = session.metadata?.booking_id ?? session.client_reference_id;
  if (!bookingId) return;

  const supabase = getSupabaseAdminClient();

  await supabase
    .from("payments")
    .update({ status: "cancelled" })
    .eq("stripe_checkout_session_id", session.id);

  // Only release a booking that is still waiting on this payment; the owner
  // may have confirmed it manually in the meantime.
  const { data } = await supabase
    .from("bookings")
    .update({ status: "expired", hold_expires_at: null })
    .eq("id", bookingId)
    .eq("status", "pending")
    .eq("payment_status", "awaiting_payment")
    .select("id");

  if ((data ?? []).length > 0) {
    await createAdminNotification({
      kind: "checkout_expired",
      title: "Checkout expired",
      body: "The customer did not finish paying; the slot was released.",
      bookingId,
      stripeEventId: eventId,
    });
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) return;

  const supabase = getSupabaseAdminClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, booking_id, amount_ore")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (!payment) return;

  const refunded = charge.amount_refunded ?? 0;
  const isFull = refunded >= (charge.amount ?? payment.amount_ore);
  const status = isFull ? "refunded" : "partially_refunded";

  await supabase.from("payments").update({ status }).eq("id", payment.id);
  await supabase
    .from("bookings")
    .update({ payment_status: status })
    .eq("id", payment.booking_id);
}

async function handleRefundUpdated(
  refund: Stripe.Refund,
  eventId: string,
  eventType: string
) {
  const supabase = getSupabaseAdminClient();
  const status = mapRefundStatus(refund.status);

  const { data: row } = await supabase
    .from("refunds")
    .update({ status })
    .eq("stripe_refund_id", refund.id)
    .select("booking_id, amount_ore")
    .maybeSingle();

  if (!row) return;

  if (status === "failed" || eventType === "refund.failed") {
    await createAdminNotification({
      kind: "refund_failed",
      title: `Refund failed · ${formatOre(row.amount_ore)}`,
      body: "Check Stripe for the decline reason, then retry from the booking.",
      bookingId: row.booking_id,
      stripeEventId: eventId,
    });
    return;
  }

  if (status !== "succeeded") return;

  const booking = await loadBooking(row.booking_id);
  if (!booking) return;

  await createAdminNotification({
    kind: "refund_succeeded",
    title: `Refund completed · ${formatOre(row.amount_ore)}`,
    body: `${booking.customer_name ?? "Customer"} · ${formatDateKey(booking.booking_date, "sv")} ${fromDbTime(booking.booking_time)}`,
    bookingId: row.booking_id,
    stripeEventId: eventId,
  });

  await notifyRefund({
    date: booking.booking_date,
    time: fromDbTime(booking.booking_time),
    name: booking.customer_name ?? "",
    email: booking.customer_email ?? "",
    locale: booking.locale ?? "sv",
    amountOre: row.amount_ore,
  });
}

async function loadBooking(bookingId: string) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("bookings")
    .select(
      "id, booking_date, booking_time, customer_name, customer_email, customer_phone, customer_address, locale, price_ore, source"
    )
    .eq("id", bookingId)
    .maybeSingle();

  return data as {
    id: string;
    booking_date: string;
    booking_time: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    locale: string | null;
    price_ore: number;
    source: string | null;
  } | null;
}
