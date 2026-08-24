import "server-only";

import Stripe from "stripe";
import { formatDateKey } from "@/lib/time";

let client: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  if (!client) {
    // Pinned to the version this SDK was generated against, so Stripe's own
    // upgrades cannot change webhook payload shapes underneath us.
    client = new Stripe(secretKey, { apiVersion: "2026-07-29.dahlia" });
  }

  return client;
}

/**
 * Products created in the Stripe Dashboard, one per language, so the name and
 * description on the Checkout page and the receipt are already localised.
 * The amount still comes from the booking rules, so a price change in the
 * admin does not require touching Stripe.
 */
const STRIPE_PRODUCTS: Record<"sv" | "en", string> = {
  sv: process.env.STRIPE_PRODUCT_ID_SV ?? "prod_V8HEVqnCcTf9mv",
  en: process.env.STRIPE_PRODUCT_ID_EN ?? "prod_V8HFUt4NzFNtz1",
};

function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  return (configured ?? "http://localhost:3000").replace(/\/$/, "");
}

export type CheckoutSessionInput = {
  bookingId: string;
  amountOre: number;
  dateKey: string;
  time: string;
  email: string;
  locale: string;
  /** Session lifetime; also the slot hold window. Stripe requires >= 30 min. */
  holdMinutes: number;
};

export type CheckoutSessionResult = {
  id: string;
  url: string;
  expiresAt: Date;
};

/**
 * Hosted Checkout rather than Elements: no Stripe.js in the browser, so the
 * site's CSP needs no script-src or frame-src exceptions. Payment methods come
 * from the Stripe Dashboard, so enabling Swish later needs no code change.
 */
export async function createBookingCheckoutSession(
  input: CheckoutSessionInput
): Promise<CheckoutSessionResult | null> {
  if (!isStripeConfigured()) return null;

  const site = getSiteUrl();
  const locale = input.locale === "en" ? "en" : "sv";
  const when = `${formatDateKey(input.dateKey, locale)} ${input.time}`;

  // Stripe rejects expires_at below 30 minutes from now.
  const expiresAt = new Date(
    Date.now() + Math.max(input.holdMinutes, 30) * 60_000
  );

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      locale,
      customer_email: input.email,
      client_reference_id: input.bookingId,
      expires_at: Math.floor(expiresAt.getTime() / 1000),
      success_url: `${site}/${locale}?booking=paid&session_id={CHECKOUT_SESSION_ID}#booking`,
      cancel_url: `${site}/${locale}?booking=cancelled#booking`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "sek",
            unit_amount: input.amountOre,
            product: STRIPE_PRODUCTS[locale],
          },
        },
      ],
      // The line item shows the product name; the appointment itself goes in
      // custom_text so the customer can see what they are paying for.
      custom_text: {
        submit: {
          message:
            locale === "sv"
              ? `Din tid: ${when}`
              : `Your appointment: ${when}`,
        },
      },
      metadata: {
        booking_id: input.bookingId,
        booking_date: input.dateKey,
        booking_time: input.time,
      },
      payment_intent_data: {
        metadata: { booking_id: input.bookingId },
      },
    });

    if (!session.url) return null;

    return { id: session.id, url: session.url, expiresAt };
  } catch (error) {
    console.error("[stripe] could not create checkout session", error);
    return null;
  }
}

export type RefundInput = {
  paymentIntentId: string;
  amountOre: number;
  bookingId: string;
  reason?: string;
};

/**
 * Swish refunds settle asynchronously, so the returned status is often
 * `pending` and the webhook confirms the final outcome.
 */
export async function createRefund(
  input: RefundInput
): Promise<Stripe.Refund | null> {
  try {
    return await getStripe().refunds.create({
      payment_intent: input.paymentIntentId,
      amount: input.amountOre,
      metadata: {
        booking_id: input.bookingId,
        ...(input.reason ? { admin_reason: input.reason.slice(0, 480) } : {}),
      },
    });
  } catch (error) {
    console.error("[stripe] refund failed", error);
    return null;
  }
}

/**
 * Maps a Stripe refund status onto the `refunds.status` check constraint.
 * Stripe types this as a bare string, and `requires_action` has no local
 * equivalent, so anything unrecognised stays pending until a later event.
 */
export function mapRefundStatus(
  status: string | null | undefined
): "pending" | "succeeded" | "failed" | "canceled" {
  switch (status) {
    case "succeeded":
      return "succeeded";
    case "failed":
      return "failed";
    case "canceled":
      return "canceled";
    default:
      return "pending";
  }
}

/** Best-effort payment method label for the admin ledger. */
export function readPaymentMethod(
  session: Stripe.Checkout.Session
): string | null {
  const types = session.payment_method_types;
  if (types && types.length === 1) return types[0];

  const intent = session.payment_intent;
  if (intent && typeof intent !== "string") {
    const method = intent.payment_method;
    if (method && typeof method !== "string") return method.type;
  }

  return types?.[0] ?? null;
}
