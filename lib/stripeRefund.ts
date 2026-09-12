import "server-only";

import { getPaymentsForBooking } from "@/lib/admin/data";
import { createAdminNotification } from "@/lib/admin/notifications";
import { createRefund, mapRefundStatus } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export type SystemRefundResult =
  | {
      ok: true;
      status: "pending" | "succeeded" | "failed" | "canceled";
      stripeRefundId: string;
    }
  | { ok: false; message: string };

/**
 * Issues a Stripe refund and records the row. Shared by admin actions and the
 * settle path when a paid checkout cannot claim its slot.
 */
export async function refundBookingPayment(input: {
  bookingId: string;
  amountOre: number;
  reason: string;
  createdBy: "admin" | "system";
}): Promise<SystemRefundResult> {
  const payments = await getPaymentsForBooking(input.bookingId);
  const paid = payments.find(
    (payment) =>
      payment.stripe_payment_intent_id &&
      (payment.status === "paid" || payment.status === "partially_refunded")
  );

  if (!paid?.stripe_payment_intent_id) {
    return { ok: false, message: "No Stripe payment to refund" };
  }

  const alreadyRefunded = await sumSucceededRefunds(paid.id);
  if (input.amountOre + alreadyRefunded > paid.amount_ore) {
    return { ok: false, message: "The amount is more than what was paid" };
  }

  const refund = await createRefund({
    paymentIntentId: paid.stripe_payment_intent_id,
    amountOre: input.amountOre,
    bookingId: input.bookingId,
    reason: input.reason,
  });

  if (!refund) return { ok: false, message: "Stripe declined the refund" };

  const status = mapRefundStatus(refund.status);
  const supabase = getSupabaseAdminClient();

  await supabase.from("refunds").insert({
    payment_id: paid.id,
    booking_id: input.bookingId,
    stripe_refund_id: refund.id,
    amount_ore: input.amountOre,
    reason: input.reason,
    status,
    created_by: input.createdBy,
  });

  return { ok: true, status, stripeRefundId: refund.id };
}

async function sumSucceededRefunds(paymentId: string): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("refunds")
    .select("amount_ore, status")
    .eq("payment_id", paymentId)
    .in("status", ["pending", "succeeded"]);

  return ((data ?? []) as Array<{ amount_ore: number }>).reduce(
    (total, row) => total + row.amount_ore,
    0
  );
}

/**
 * Paid checkout could not confirm the booking (usually unique slot 23505).
 * Notify admin and auto-refund, or flag for manual refund if Stripe declines.
 */
export async function handlePaidSlotConflict(input: {
  bookingId: string;
  sessionId: string;
  amountOre: number | null;
  slotLabel: string | null;
  errorMessage: string;
}): Promise<void> {
  const amount =
    typeof input.amountOre === "number"
      ? `${(input.amountOre / 100).toFixed(0)} kr`
      : "unknown amount";

  await createAdminNotification({
    kind: "webhook_error",
    title: "Paid checkout lost its slot",
    body: [
      `Booking ${input.bookingId} paid (${amount}) but confirming it hit: ${input.errorMessage}.`,
      input.slotLabel ? `Slot: ${input.slotLabel}.` : null,
      `Checkout session: ${input.sessionId}.`,
      "Attempting automatic refund.",
    ]
      .filter(Boolean)
      .join(" "),
    bookingId: input.bookingId,
  });

  if (typeof input.amountOre !== "number" || input.amountOre <= 0) {
    await createAdminNotification({
      kind: "refund_failed",
      title: "Manual refund required — amount unknown",
      body: `Could not auto-refund booking ${input.bookingId}; amount missing. Refund in Stripe Dashboard.`,
      bookingId: input.bookingId,
    });
    return;
  }

  const result = await refundBookingPayment({
    bookingId: input.bookingId,
    amountOre: input.amountOre,
    reason: "Automatic refund: slot taken before payment settled",
    createdBy: "system",
  });

  if (result.ok) {
    await createAdminNotification({
      kind: "refund_succeeded",
      title: "Auto-refund started after slot conflict",
      body: `Refund ${result.stripeRefundId} (${result.status}) for booking ${input.bookingId}. Customer paid but the slot was already taken.`,
      bookingId: input.bookingId,
    });
    return;
  }

  await createAdminNotification({
    kind: "refund_failed",
    title: "Manual refund required after slot conflict",
    body: `Auto-refund failed for booking ${input.bookingId}: ${result.message}. Customer was charged; refund in Stripe Dashboard.`,
    bookingId: input.bookingId,
  });
}
