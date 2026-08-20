import { addDays, startOfDay } from "date-fns";
import { NextResponse } from "next/server";
import {
  BOOKING_HORIZON_DAYS,
  isBookableWeekday,
  isBeyondHorizon,
  isPastDate,
  isValidTimeSlot,
  parseDateKey,
  toDateKey,
  toDbTime,
  fromDbTime,
  slotKey,
} from "@/lib/booking";
import { notifyBooking, parseBookingContact } from "@/lib/bookingNotify";
import { getSupabaseServerClient, withSupabaseTimeout } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const from = fromParam ?? toDateKey(startOfDay(new Date()));
    const to =
      toParam ??
      toDateKey(startOfDay(addDays(new Date(), BOOKING_HORIZON_DAYS)));

    const supabase = getSupabaseServerClient();
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("bookings")
        .select("booking_date, booking_time")
        .gte("booking_date", from)
        .lte("booking_date", to)
        .in("status", ["pending", "confirmed"])
    );

    if (error) {
      // Dead/unreachable Supabase should not block the marketing page.
      return NextResponse.json({ slots: [], error: error.message }, { status: 200 });
    }

    const rows = (data ?? []) as Array<{
      booking_date: string;
      booking_time: string;
    }>;

    const slots = rows.map((row) =>
      slotKey(row.booking_date, fromDbTime(row.booking_time))
    );

    return NextResponse.json({ slots });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ slots: [], error: message }, { status: 200 });
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
      locale?: string;
    };
    const { date, time } = body;
    const contact = parseBookingContact(body);

    if ("error" in contact) {
      return NextResponse.json({ error: contact.error }, { status: 400 });
    }

    if (!date || !time) {
      return NextResponse.json(
        { error: "Missing date or time" },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    if (!isValidTimeSlot(time)) {
      return NextResponse.json({ error: "Invalid time slot" }, { status: 400 });
    }

    const bookingDate = parseDateKey(date);

    if (!isBookableWeekday(bookingDate)) {
      return NextResponse.json(
        { error: "Bookings only available Sunday–Friday" },
        { status: 400 }
      );
    }

    if (isPastDate(bookingDate) || isBeyondHorizon(bookingDate)) {
      return NextResponse.json({ error: "Date not available" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("bookings")
        .insert({
          booking_date: date,
          booking_time: toDbTime(time),
          status: "pending",
          customer_name: contact.name,
          customer_email: contact.email,
          customer_phone: contact.phone,
          locale: contact.locale,
        })
        .select("id, booking_date, booking_time")
        .single()
    );

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This time slot is already booked" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await notifyBooking({
      date,
      time,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      locale: contact.locale,
    });

    return NextResponse.json({ booking: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
