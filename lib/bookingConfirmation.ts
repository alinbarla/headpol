import "server-only";

import { fromDbTime } from "@/lib/booking";
import { isCheckoutSessionPaid } from "@/lib/stripe";
import {
  getSupabaseAdminClient,
  withSupabaseTimeout,
} from "@/lib/supabase/server";

/**
 * The confirmation page is reachable to whoever holds the Checkout Session id,
 * which is the only thing tying a visitor to someone else's contact details.
 * Rejecting anything that is not shaped like one keeps arbitrary strings from
 * reaching the database at all.
 */
const SESSION_ID = /^cs_[A-Za-z0-9_-]{8,250}$/;

export type BookingConfirmation = {
  paid: boolean;
  /** Full booking UUID, used as the Google Ads transaction id. */
  id: string;
  /** Short, human-readable prefix of the booking id. */
  reference: string;
  /** `YYYY-MM-DD`, Stockholm local. */
  date: string;
  /** `HH:MM`, Stockholm local. */
  time: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  amountOre: number;
};

type PaymentRow = {
  booking_id: string;
  amount_ore: number;
  status: string;
};

type BookingRow = {
  id: string;
  booking_date: string;
  booking_time: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  payment_status: string;
  price_ore: number;
};

/**
 * Resolves the booking behind a Stripe Checkout Session so the customer can be
 * shown what they just paid for. Read-only on purpose: confirming the booking
 * and sending the receipt stay with the webhook, so a customer who never
 * returns from Checkout is treated exactly like one who does.
 */
export async function getConfirmationBySession(
  sessionId: string
): Promise<BookingConfirmation | null> {
  if (!SESSION_ID.test(sessionId)) return null;

  try {
    const supabase = getSupabaseAdminClient();

    const { data: payment } = await withSupabaseTimeout(
      supabase
        .from("payments")
        .select("booking_id, amount_ore, status")
        .eq("stripe_checkout_session_id", sessionId)
        .maybeSingle()
    );

    if (!payment) return null;
    const paymentRow = payment as PaymentRow;

    const { data: booking } = await withSupabaseTimeout(
      supabase
        .from("bookings")
        .select(
          "id, booking_date, booking_time, customer_name, customer_email, customer_phone, customer_address, payment_status, price_ore"
        )
        .eq("id", paymentRow.booking_id)
        .maybeSingle()
    );

    if (!booking) return null;
    const bookingRow = booking as BookingRow;

    const settled =
      bookingRow.payment_status === "paid" || paymentRow.status === "paid";

    return {
      paid: settled || (await isCheckoutSessionPaid(sessionId)),
      id: bookingRow.id,
      reference: bookingRow.id.slice(0, 8).toUpperCase(),
      date: bookingRow.booking_date,
      time: fromDbTime(bookingRow.booking_time),
      name: bookingRow.customer_name ?? "",
      email: bookingRow.customer_email ?? "",
      phone: bookingRow.customer_phone ?? "",
      address: bookingRow.customer_address ?? "",
      amountOre: paymentRow.amount_ore || bookingRow.price_ore,
    };
  } catch (error) {
    // A missing service role key or a slow database must not turn a completed
    // payment into an error page; the caller falls back to "contact us".
    console.error("[booking] could not resolve confirmation", error);
    return null;
  }
}
