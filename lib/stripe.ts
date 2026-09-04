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
      success_url: `${site}/${CONFIRMATION_PATH}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/?booking=cancelled#booking`,
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

export type StripeReceiptInfo = {
  chargeId: string;
  receiptUrl: string;
};

/** Hosted Stripe receipt for a settled PaymentIntent. */
export async function fetchStripeReceipt(
  paymentIntentId: string
): Promise<StripeReceiptInfo | null> {
  if (!isStripeConfigured()) return null;

  try {
    const intent = await getStripe().paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"],
    });
    const charge = intent.latest_charge;
    if (!charge || typeof charge === "string" || !charge.receipt_url) {
      return null;
    }

    return { chargeId: charge.id, receiptUrl: charge.receipt_url };
  } catch (error) {
    console.error("[stripe] could not fetch receipt", error);
    return null;
  }
}

/**
 * Triggers Stripe's official receipt email. Updating `receipt_email` sends a
 * new receipt; clearing first handles resends to the same address.
 */
export async function sendStripeReceiptEmail(
  chargeId: string,
  email: string
): Promise<boolean> {
  if (!isStripeConfigured()) return false;

  try {
    const stripe = getStripe();
    const charge = await stripe.charges.retrieve(chargeId);
    if (charge.receipt_email === email) {
      await stripe.charges.update(chargeId, { receipt_email: "" });
    }
    await stripe.charges.update(chargeId, { receipt_email: email });
    return true;
  } catch (error) {
    console.error("[stripe] could not send receipt email", error);
    return false;
  }
}

/** Events the booking webhook must receive. */
export const STRIPE_WEBHOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] =
  [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
    "checkout.session.expired",
    "charge.refunded",
    "refund.updated",
    "refund.failed",
  ];

export function getStripeWebhookUrl(): string {
  return `${getSiteUrl()}/api/stripe/webhook`;
}

export type StripeWebhookStatus = {
  configured: boolean;
  expectedUrl: string;
  endpoints: Array<{
    id: string;
    url: string;
    status: string;
    enabledEvents: string[];
  }>;
  healthy: boolean;
  message: string;
};

/**
 * Lists live-mode webhook endpoints and reports whether the correct URL is
 * enabled for the events we handle.
 */
export async function getStripeWebhookStatus(): Promise<StripeWebhookStatus> {
  const expectedUrl = getStripeWebhookUrl();

  if (!isStripeConfigured()) {
    return {
      configured: false,
      expectedUrl,
      endpoints: [],
      healthy: false,
      message: "STRIPE_SECRET_KEY is not set",
    };
  }

  try {
    const listed = await getStripe().webhookEndpoints.list({ limit: 100 });
    const endpoints = listed.data.map((endpoint) => ({
      id: endpoint.id,
      url: endpoint.url,
      status: endpoint.status,
      enabledEvents: endpoint.enabled_events ?? [],
    }));

    const match = endpoints.find(
      (endpoint) =>
        normalizeWebhookUrl(endpoint.url) === normalizeWebhookUrl(expectedUrl)
    );

    if (!match) {
      const rootMismatch = endpoints.find((endpoint) =>
        isSiteRootWebhook(endpoint.url, expectedUrl)
      );
      return {
        configured: true,
        expectedUrl,
        endpoints,
        healthy: false,
        message: rootMismatch
          ? `Endpoint points at the site root (${rootMismatch.url}) instead of ${expectedUrl}`
          : `No webhook endpoint for ${expectedUrl}`,
      };
    }

    if (match.status !== "enabled") {
      return {
        configured: true,
        expectedUrl,
        endpoints,
        healthy: false,
        message: `Endpoint ${match.id} is ${match.status}`,
      };
    }

    return {
      configured: true,
      expectedUrl,
      endpoints,
      healthy: true,
      message: `Receiving events at ${expectedUrl}`,
    };
  } catch (error) {
    return {
      configured: true,
      expectedUrl,
      endpoints: [],
      healthy: false,
      message:
        error instanceof Error ? error.message : "Could not list endpoints",
    };
  }
}

export type RepairWebhookResult = {
  ok: boolean;
  message: string;
  /** Present only when a brand-new endpoint was created — paste into Vercel. */
  signingSecret?: string;
  endpointId?: string;
  endpointUrl?: string;
};

/**
 * Points Stripe at `/api/stripe/webhook`, re-enables a disabled endpoint, and
 * creates one when nothing usable exists. Prefer updating the misconfigured
 * root URL so the existing `STRIPE_WEBHOOK_SECRET` keeps working.
 */
export async function repairStripeWebhookEndpoint(): Promise<RepairWebhookResult> {
  if (!isStripeConfigured()) {
    return { ok: false, message: "STRIPE_SECRET_KEY is not set" };
  }

  const expectedUrl = getStripeWebhookUrl();
  const stripe = getStripe();

  try {
    const listed = await stripe.webhookEndpoints.list({ limit: 100 });
    const endpoints = listed.data;

    const exact = endpoints.find(
      (endpoint) =>
        normalizeWebhookUrl(endpoint.url) === normalizeWebhookUrl(expectedUrl)
    );
    if (exact) {
      const updated = await stripe.webhookEndpoints.update(exact.id, {
        disabled: false,
        enabled_events: STRIPE_WEBHOOK_EVENTS,
        url: expectedUrl,
      });
      return {
        ok: true,
        message: `Re-enabled webhook ${updated.id}`,
        endpointId: updated.id,
        endpointUrl: updated.url,
      };
    }

    const root = endpoints.find((endpoint) =>
      isSiteRootWebhook(endpoint.url, expectedUrl)
    );
    if (root) {
      const updated = await stripe.webhookEndpoints.update(root.id, {
        disabled: false,
        enabled_events: STRIPE_WEBHOOK_EVENTS,
        url: expectedUrl,
      });
      return {
        ok: true,
        message: `Moved webhook from site root to ${expectedUrl}`,
        endpointId: updated.id,
        endpointUrl: updated.url,
      };
    }

    const created = await stripe.webhookEndpoints.create({
      url: expectedUrl,
      enabled_events: STRIPE_WEBHOOK_EVENTS,
      description: "Strålkastarpolering booking payments",
      api_version: "2026-07-29.dahlia",
    });

    return {
      ok: true,
      message:
        "Created a new webhook endpoint. Copy the signing secret into STRIPE_WEBHOOK_SECRET on Vercel, then redeploy.",
      signingSecret: created.secret ?? undefined,
      endpointId: created.id,
      endpointUrl: created.url,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not repair webhook",
    };
  }
}

function normalizeWebhookUrl(url: string): string {
  return url.replace(/\/$/, "").toLowerCase();
}

function isSiteRootWebhook(url: string, expectedWebhookUrl: string): boolean {
  try {
    const actual = new URL(url);
    const expected = new URL(expectedWebhookUrl);
    return (
      actual.origin === expected.origin &&
      (actual.pathname === "/" || actual.pathname === "")
    );
  } catch {
    return false;
  }
}
