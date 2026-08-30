import "server-only";

import Stripe from "stripe";
import { CONFIRMATION_PATH } from "@/lib/routes";
import { formatDateKey } from "@/lib/time";

let client: Stripe | null = null;

/**
 * The Stripe dashboard lists an `mk_`-prefixed id next to every key, which is
 * easy to copy in place of the token itself. Checking the prefix turns that
 * mistake into a clear "not configured" everywhere instead of an
 * authentication failure at the moment a customer tries to pay.
 */
function isSecretKeyShaped(value: string | undefined): value is string {
  return /^(sk|rk)_/.test(value ?? "");
}

export function isStripeConfigured(): boolean {
  return isSecretKeyShaped(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  if (!isSecretKeyShaped(secretKey)) {
    throw new Error(
      "STRIPE_SECRET_KEY is not a secret key; expected an sk_ or rk_ token"
    );
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
 * Stripe accepts an expiry between 30 minutes and 24 hours after the session is
 * created, measured against its own clock when the request lands. Asking for
 * exactly 30 minutes therefore fails: truncating to whole seconds and the
 * round trip both push the timestamp back under the floor. The bounds below
 * keep a minute of slack at each end.
 */
const MIN_SESSION_MINUTES = 31;
const MAX_SESSION_MINUTES = 23 * 60;

function sessionMinutes(input: CheckoutSessionInput): number {
  return Math.min(
    Math.max(input.holdMinutes, MIN_SESSION_MINUTES),
    MAX_SESSION_MINUTES
  );
}

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

  const expiresAt = new Date(Date.now() + sessionMinutes(input) * 60_000);

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      locale,
      customer_email: input.email,
      client_reference_id: input.bookingId,
      expires_at: Math.floor(expiresAt.getTime() / 1000),
      success_url: `${site}/${locale}/${CONFIRMATION_PATH}?session_id={CHECKOUT_SESSION_ID}`,
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
    // The booking API turns this into a generic message for the customer, so
    // the log line is the only place the cause survives. Stripe puts the
    // actionable part in type/code/param, which a bare object dump buries.
    console.error(
      "[stripe] could not create checkout session:",
      error instanceof Stripe.errors.StripeError
        ? `${error.type}${error.code ? ` ${error.code}` : ""}${
            error.param ? ` (${error.param})` : ""
          }: ${error.message}`
        : error
    );
    return null;
  }
}

/**
 * Whether Stripe itself considers the session paid. The webhook is what marks
 * the booking confirmed, but Stripe redirects the customer back at the same
 * moment it sends the event, so the confirmation page would otherwise report a
 * paid booking as pending for as long as the webhook takes to land.
 */
export async function isCheckoutSessionPaid(
  sessionId: string
): Promise<boolean> {
  if (!isStripeConfigured()) return false;

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return (
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required"
    );
  } catch (error) {
    console.error("[stripe] could not read checkout session", error);
    return false;
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

export type StripeBalanceBucket = {
  amount: number;
  currency: string;
};

export type StripeBalanceSnapshot = {
  available: StripeBalanceBucket[];
  pending: StripeBalanceBucket[];
};

let balanceCache: { at: number; value: StripeBalanceSnapshot } | null = null;
const BALANCE_CACHE_MS = 60_000;

export async function getStripeBalance(): Promise<StripeBalanceSnapshot | null> {
  if (!isStripeConfigured()) return null;
  if (balanceCache && Date.now() - balanceCache.at < BALANCE_CACHE_MS) {
    return balanceCache.value;
  }

  const balance = await getStripe().balance.retrieve();
  const value: StripeBalanceSnapshot = {
    available: balance.available.map((item) => ({
      amount: item.amount,
      currency: item.currency,
    })),
    pending: balance.pending.map((item) => ({
      amount: item.amount,
      currency: item.currency,
    })),
  };
  balanceCache = { at: Date.now(), value };
  return value;
}
