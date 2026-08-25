import "server-only";

import type Stripe from "stripe";
import { fromDbTime } from "@/lib/booking";
import {
  notifyOwnerBooking,
  notifyPaymentReceipt,
} from "@/lib/bookingNotify";
import { getStripe, isStripeConfigured, readPaymentMethod } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export type SettleResult = "settled" | "already" | "unpaid" | "missing";

/**
 * Marks a booking paid from a Stripe Checkout Session. Used by the webhook
 * and as a self-heal when the customer or admin comes back after Stripe took
 * the money but the webhook never landed.
 */
export async function settlePaidCheckoutSession(
  sessionId: string
): Promise<SettleResult> {
  if (!isStripeConfigured()) return "missing";

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return await settlePaidCheckout(session);
  } catch (error) {
    console.error("[stripe] could not retrieve checkout session", error);
    return "missing";
  }
}

export async function settlePaidCheckout(
  session: Stripe.Checkout.Session
): Promise<SettleResult> {
  const bookingId = session.metadata?.booking_id ?? session.client_reference_id;
  if (!bookingId) {
    console.error("[stripe] checkout session has no booking id", session.id);
    return "missing";
  }

  if (session.payment_status === "unpaid") return "unpaid";

  const supabase = getSupabaseAdminClient();
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const { data: existing } = await supabase
    .from("bookings")
    .select("id, status, payment_status, source")
    .eq("id", bookingId)
    .maybeSingle();

  if (!existing) return "missing";

  if (existing.payment_status === "paid") {
    await supabase
      .from("payments")
      .update({
        status: "paid",
        method: readPaymentMethod(session),
        stripe_payment_intent_id: paymentIntentId,
        paid_at: new Date().toISOString(),
      })
      .eq("stripe_checkout_session_id", session.id)
      .in("status", ["awaiting_payment", "failed", "cancelled"]);
    return "already";
  }

  const { error: paymentError } = await supabase
    .from("payments")
    .update({
      status: "paid",
      method: readPaymentMethod(session),
      stripe_payment_intent_id: paymentIntentId,
      paid_at: new Date().toISOString(),
    })
    .eq("stripe_checkout_session_id", session.id);

  if (paymentError) {
    console.error("[stripe] could not mark payment paid", paymentError.message);
  }

  const { data: updated, error: bookingError } = await supabase
    .from("bookings")
    .update({
      status:
        existing.status === "pending" || existing.status === "expired"
          ? "confirmed"
          : existing.status,
      payment_status: "paid",
      hold_expires_at: null,
    })
    .eq("id", bookingId)
    .in("payment_status", ["awaiting_payment", "unpaid"])
    .select(
      "id, booking_date, booking_time, customer_name, customer_email, customer_phone, customer_address, locale, price_ore, source"
    )
    .maybeSingle();

  if (bookingError) {
    console.error("[stripe] could not mark booking paid", bookingError.message);
    return "missing";
  }

  if (!updated) return "already";

  const time = fromDbTime(updated.booking_time);
  const amountOre = session.amount_total ?? updated.price_ore;

  await notifyPaymentReceipt({
    date: updated.booking_date,
    time,
    name: updated.customer_name ?? "",
    email: updated.customer_email ?? "",
    locale: updated.locale ?? "sv",
    amountOre,
    address: updated.customer_address ?? "",
  });

  if (updated.source === "web") {
    await notifyOwnerBooking({
      date: updated.booking_date,
      time,
      name: updated.customer_name ?? "",
      phone: updated.customer_phone ?? "",
      address: updated.customer_address ?? "",
      email: updated.customer_email ?? "",
      amountOre,
      source: "web",
    });
  }

  return "settled";
}

/** Pulls any unpaid Stripe attempts for a booking and settles those Stripe says are paid. */
export async function settleOpenPaymentsForBooking(
  bookingId: string
): Promise<SettleResult> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("payments")
    .select("stripe_checkout_session_id, status")
    .eq("booking_id", bookingId)
    .eq("provider", "stripe")
    .not("stripe_checkout_session_id", "is", null);

  const sessions = (data ?? []) as Array<{
    stripe_checkout_session_id: string | null;
    status: string;
  }>;

  let result: SettleResult = "missing";
  for (const row of sessions) {
    if (!row.stripe_checkout_session_id) continue;
    const next = await settlePaidCheckoutSession(row.stripe_checkout_session_id);
    if (next === "settled" || next === "already") return next;
    result = next;
  }
  return result;
}
