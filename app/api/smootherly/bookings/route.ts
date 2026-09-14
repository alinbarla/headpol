import { NextResponse } from "next/server";
import {
  classifyAcquisition,
  type AttributionInput,
} from "@/lib/attribution/classify";
import {
  isDateAtBookingCap,
  isSlotOpen,
} from "@/lib/availability";
import { toDbTime, SLOT_OCCUPYING_STATUSES } from "@/lib/booking";
import { getAvailabilityOverrides, getBookingRules } from "@/lib/bookingRules";
import {
  notifySmootherlyBooking,
  parseBookingContact,
} from "@/lib/bookingNotify";
import { SMOOTHERLY_PATH, SMOOTHERLY_PRICE_ORE } from "@/lib/routes";
import { addDaysToDateKey, stockholmDateKey } from "@/lib/time";
import { clientIpFromRequest } from "@/lib/analytics/rateLimit";
import { visitorGeo, type VisitorGeo } from "@/lib/geo";
import {
  getSupabaseAdminClient,
  withSupabaseTimeout,
} from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_MESSAGE_LENGTH = 1000;

/**
 * Unpaid booking intake for the Smootherly.se collaboration landing.
 * Confirms the slot immediately (no Stripe) and emails both sides.
 */
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
      message?: string;
      attribution?: Partial<AttributionInput> | null;
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

    const message = normalizeOptionalMessage(body.message);
    if (message === undefined) {
      return NextResponse.json(
        { error: "Invalid message" },
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

    const dayCap = await dayBookingCount(date);
    if (isDateAtBookingCap(date, dayCap, rules)) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      );
    }

    const booking = await insertSmootherlyBooking({
      date,
      time,
      contact,
      message,
      priceOre: SMOOTHERLY_PRICE_ORE,
      attribution: body.attribution ?? null,
      geo: visitorGeo(request.headers),
      visitorIp: clientIpFromRequest(request),
    });

    if ("error" in booking) {
      return NextResponse.json(
        { error: booking.error },
        { status: booking.status }
      );
    }

    const fullAddress = `${contact.address}, ${contact.postalCode}`;

    await notifySmootherlyBooking({
      date,
      time,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      address: fullAddress,
      locale: contact.locale,
      message,
      amountOre: SMOOTHERLY_PRICE_ORE,
    });

    return NextResponse.json(
      { booking: booking.data, ok: true },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Returns null for empty, the trimmed string, or undefined when invalid. */
function normalizeOptionalMessage(
  raw: string | undefined
): string | null | undefined {
  if (raw == null) return null;
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  if (trimmed.length > MAX_MESSAGE_LENGTH) return undefined;
  return trimmed;
}

type InsertedBooking = {
  id: string;
  booking_date: string;
  booking_time: string;
};

type InsertResult = { data: InsertedBooking } | { error: string; status: number };

async function insertSmootherlyBooking(input: {
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
  message: string | null;
  priceOre: number;
  attribution?: Partial<AttributionInput> | null;
  geo?: VisitorGeo | null;
  visitorIp?: string | null;
}): Promise<InsertResult> {
  const supabase = getSupabaseAdminClient();
  const classified = classifyAcquisition({
    ...input.attribution,
    landingPath: `/${SMOOTHERLY_PATH}`,
    referrerHost: input.attribution?.referrerHost ?? "smootherly.se",
  });
  const geo = input.geo;

  const noteParts = [
    "Smootherly.se collaboration (no Stripe)",
    input.message ? `Message: ${input.message}` : null,
  ].filter(Boolean);

  const row = {
    booking_date: input.date,
    booking_time: toDbTime(input.time),
    // Confirmed immediately — payment is handled outside Stripe.
    status: "confirmed" as const,
    payment_status: "unpaid" as const,
    price_ore: input.priceOre,
    source: "web" as const,
    hold_expires_at: null,
    customer_name: input.contact.name,
    customer_email: input.contact.email,
    customer_phone: input.contact.phone,
    customer_address: `${input.contact.address}, ${input.contact.postalCode}`,
    customer_postal_code: input.contact.postalCode,
    locale: input.contact.locale,
    internal_notes: noteParts.join("\n"),
    acquisition_channel: classified.channel === "direct" ? "referral" : classified.channel,
    utm_source: classified.utmSource ?? "smootherly",
    utm_medium: classified.utmMedium ?? "partner",
    utm_campaign: classified.utmCampaign ?? "smootherly",
    utm_content: classified.utmContent,
    utm_term: classified.utmTerm,
    gclid: classified.gclid,
    landing_path: `/${SMOOTHERLY_PATH}`,
    referrer_host: classified.referrerHost ?? "smootherly.se",
    geo_city: geo?.city ?? null,
    geo_region: geo?.region ?? null,
    geo_country: geo?.country ?? null,
    geo_postal_code: geo?.postal_code ?? null,
    geo_latitude: geo?.latitude ?? null,
    geo_longitude: geo?.longitude ?? null,
    visitor_ip: input.visitorIp ?? null,
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
      .in("status", [...SLOT_OCCUPYING_STATUSES])
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
