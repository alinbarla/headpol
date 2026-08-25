"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logAdminAction, login, logout, requireAdmin } from "@/lib/admin/auth";
import { getBookingById, getPaymentsForBooking } from "@/lib/admin/data";
import { isSlotOpen, parseBookingRules } from "@/lib/availability";
import { fromDbTime, toDbTime } from "@/lib/booking";
import { getAvailabilityOverrides, getBookingRules } from "@/lib/bookingRules";
import {
  notifyBookingCancelled,
  notifyBookingRescheduled,
  notifyOwnerBooking,
  notifyPaymentLink,
} from "@/lib/bookingNotify";
import {
  createBookingCheckoutSession,
  createRefund,
  isStripeConfigured,
  mapRefundStatus,
} from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { addDaysToDateKey } from "@/lib/time";

export type ActionState = { ok: boolean; message?: string };

function fail(message: string): ActionState {
  return { ok: false, message };
}

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");
const timeKey = z.string().regex(/^\d{2}:\d{2}$/, "Invalid time");
const uuid = z.uuid("Invalid id");

function refreshAdmin(bookingId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/availability");
  if (bookingId) revalidatePath(`/admin/bookings/${bookingId}`);
}

/**
 * zod's flatten output is verbose; the admin only ever shows one line, so the
 * first message is enough.
 */
function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Ogiltiga uppgifter";
}

// -- Authentication ---------------------------------------------------------

const loginSchema = z.object({
  pin: z.string().min(4).max(64),
});

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ pin: formData.get("pin") });
  if (!parsed.success) return fail("Enter your PIN");

  const result = await login(parsed.data.pin);

  if (!result.ok) {
    if (result.reason === "locked") {
      return fail("Too many attempts. Wait 15 minutes and try again.");
    }
    if (result.reason === "misconfigured") {
      return fail("Sign-in is not configured. Check the environment variables.");
    }
    return fail("Wrong PIN");
  }

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await logAdminAction("admin.logout");
  await logout();
  redirect("/admin/login");
}

// -- Bookings ---------------------------------------------------------------

const createBookingSchema = z.object({
  date: dateKey,
  time: timeKey,
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(40),
  email: z.email().max(120).or(z.literal("")),
  address: z.string().trim().min(4).max(200),
  locale: z.enum(["sv", "en"]).default("sv"),
  source: z.enum(["phone", "walk_in", "admin"]).default("phone"),
  priceOre: z.coerce.number().int().min(0).max(10_000_000),
  notes: z.string().trim().max(2000).optional(),
  sendPaymentLink: z.boolean().default(false),
});

export async function createBookingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = createBookingSchema.safeParse({
    date: formData.get("date"),
    time: formData.get("time"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    address: formData.get("address"),
    locale: formData.get("locale") ?? "sv",
    source: formData.get("source") ?? "phone",
    priceOre: formData.get("priceOre"),
    notes: formData.get("notes") ?? undefined,
    sendPaymentLink: formData.get("sendPaymentLink") === "on",
  });

  if (!parsed.success) return fail(firstIssue(parsed.error));
  const input = parsed.data;

  const conflict = await slotConflict(input.date, input.time);
  if (conflict) return fail(conflict);

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      booking_date: input.date,
      booking_time: toDbTime(input.time),
      // An owner-entered booking is agreed on the phone, so it starts confirmed.
      status: "confirmed",
      source: input.source,
      payment_status: "unpaid",
      price_ore: input.priceOre,
      customer_name: input.name,
      customer_email: input.email || null,
      customer_phone: input.phone,
      customer_address: input.address,
      locale: input.locale,
      internal_notes: input.notes ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return fail("That slot is already booked");
    return fail(error.message);
  }

  const bookingId = data.id as string;

  await logAdminAction("booking.create", {
    entityType: "booking",
    entityId: bookingId,
    details: { date: input.date, time: input.time, source: input.source },
  });

  await notifyOwnerBooking({
    date: input.date,
    time: input.time,
    name: input.name,
    phone: input.phone,
    address: input.address,
    email: input.email || undefined,
    source: "admin",
  });

  if (input.sendPaymentLink && input.email) {
    const linkResult = await issuePaymentLink(bookingId);
    refreshAdmin(bookingId);
    return linkResult.ok
      ? { ok: true, message: "Booking created and payment link sent" }
      : { ok: true, message: "Booking created, but the payment link failed" };
  }

  refreshAdmin(bookingId);
  return { ok: true, message: "Booking created" };
}

const rescheduleSchema = z.object({
  id: uuid,
  date: dateKey,
  time: timeKey,
  notify: z.boolean().default(true),
});

export async function rescheduleBookingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = rescheduleSchema.safeParse({
    id: formData.get("id"),
    date: formData.get("date"),
    time: formData.get("time"),
    // An unchecked checkbox is absent from FormData entirely.
    notify: formData.get("notify") === "on",
  });

  if (!parsed.success) return fail(firstIssue(parsed.error));
  return rescheduleBooking(parsed.data);
}

/**
 * Shared by the form and the calendar's drag-and-drop, which needs a plain
 * argument call rather than a FormData one.
 */
export async function rescheduleBooking(input: {
  id: string;
  date: string;
  time: string;
  notify?: boolean;
}): Promise<ActionState> {
  await requireAdmin();

  const parsed = rescheduleSchema.safeParse({
    ...input,
    notify: input.notify ?? true,
  });
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const booking = await getBookingById(parsed.data.id);
  if (!booking) return fail("That booking does not exist");

  const unchanged =
    booking.booking_date === parsed.data.date &&
    fromDbTime(booking.booking_time) === parsed.data.time;
  if (unchanged) return { ok: true, message: "The slot is unchanged" };

  const conflict = await slotConflict(
    parsed.data.date,
    parsed.data.time,
    parsed.data.id
  );
  if (conflict) return fail(conflict);

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      booking_date: parsed.data.date,
      booking_time: toDbTime(parsed.data.time),
    })
    .eq("id", parsed.data.id);

  if (error) {
    if (error.code === "23505") return fail("That slot is already booked");
    return fail(error.message);
  }

  await logAdminAction("booking.reschedule", {
    entityType: "booking",
    entityId: parsed.data.id,
    details: {
      from: `${booking.booking_date} ${fromDbTime(booking.booking_time)}`,
      to: `${parsed.data.date} ${parsed.data.time}`,
    },
  });

  if (parsed.data.notify && booking.customer_email) {
    await notifyBookingRescheduled({
      date: parsed.data.date,
      time: parsed.data.time,
      previousDate: booking.booking_date,
      previousTime: fromDbTime(booking.booking_time),
      name: booking.customer_name ?? "",
      email: booking.customer_email,
      locale: booking.locale ?? "sv",
    });
  }

  refreshAdmin(parsed.data.id);
  return { ok: true, message: "Booking moved" };
}

const cancelSchema = z.object({
  id: uuid,
  reason: z.string().trim().max(500).optional(),
  notify: z.boolean().default(true),
  refund: z.boolean().default(false),
});

export async function cancelBookingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = cancelSchema.safeParse({
    id: formData.get("id"),
    reason: formData.get("reason") ?? undefined,
    notify: formData.get("notify") === "on",
    refund: formData.get("refund") === "on",
  });

  if (!parsed.success) return fail(firstIssue(parsed.error));

  const booking = await getBookingById(parsed.data.id);
  if (!booking) return fail("That booking does not exist");

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: parsed.data.reason ?? null,
      hold_expires_at: null,
    })
    .eq("id", parsed.data.id);

  if (error) return fail(error.message);

  await logAdminAction("booking.cancel", {
    entityType: "booking",
    entityId: parsed.data.id,
    details: { reason: parsed.data.reason ?? null, refund: parsed.data.refund },
  });

  let refundNote = "";
  if (parsed.data.refund && booking.payment_status === "paid") {
    const result = await refundBooking({
      bookingId: parsed.data.id,
      amountOre: booking.price_ore,
      reason: parsed.data.reason ?? "Cancelled",
    });
    refundNote = result.ok
      ? " and a refund has been started"
      : ` (refund failed: ${result.message})`;
  }

  if (parsed.data.notify && booking.customer_email) {
    await notifyBookingCancelled({
      date: booking.booking_date,
      time: fromDbTime(booking.booking_time),
      name: booking.customer_name ?? "",
      email: booking.customer_email,
      locale: booking.locale ?? "sv",
      reason: parsed.data.reason,
    });
  }

  refreshAdmin(parsed.data.id);
  return { ok: true, message: `Booking cancelled${refundNote}` };
}

const deleteExpiredSchema = z.object({
  id: uuid,
});

/**
 * Expired rows are abandoned Stripe holds, not real jobs. Hard-delete is
 * allowed only in that status; payments/refunds cascade with the booking.
 */
export async function deleteExpiredBookingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = deleteExpiredSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const booking = await getBookingById(parsed.data.id);
  if (!booking) return fail("That booking does not exist");
  if (booking.status !== "expired") {
    return fail("Only expired bookings can be deleted");
  }

  const result = await deleteExpiredByIds([parsed.data.id]);
  if (!result.ok) return result;

  await logAdminAction("booking.delete", {
    entityType: "booking",
    entityId: parsed.data.id,
    details: {
      date: booking.booking_date,
      time: booking.booking_time,
      name: booking.customer_name,
    },
  });

  refreshAdmin();
  redirect("/admin/bookings?status=expired");
}

export async function deleteAllExpiredBookingsAction(
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("status", "expired");

  if (error) return fail(error.message);

  const ids = (data ?? []).map((row) => row.id as string);
  if (ids.length === 0) return fail("There are no expired bookings to delete");

  const result = await deleteExpiredByIds(ids);
  if (!result.ok) return result;

  await logAdminAction("booking.delete_expired", {
    entityType: "booking",
    details: { count: ids.length },
  });

  refreshAdmin();
  return {
    ok: true,
    message:
      ids.length === 1
        ? "1 expired booking deleted"
        : `${ids.length} expired bookings deleted`,
  };
}

async function deleteExpiredByIds(ids: string[]): Promise<ActionState> {
  if (ids.length === 0) return { ok: true };

  const supabase = getSupabaseAdminClient();

  // Later bookings may still point at an expired row via reschedule history.
  const { error: unlinkError } = await supabase
    .from("bookings")
    .update({ rescheduled_from_id: null })
    .in("rescheduled_from_id", ids);

  if (unlinkError) return fail(unlinkError.message);

  const { error } = await supabase
    .from("bookings")
    .delete()
    .in("id", ids)
    .eq("status", "expired");

  if (error) return fail(error.message);
  return { ok: true };
}

const statusSchema = z.object({
  id: uuid,
  status: z.enum(["pending", "confirmed", "completed", "no_show"]),
});

export async function setBookingStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = statusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });

  if (!parsed.success) return fail(firstIssue(parsed.error));

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status: parsed.data.status, hold_expires_at: null })
    .eq("id", parsed.data.id);

  if (error) return fail(error.message);

  await logAdminAction("booking.status", {
    entityType: "booking",
    entityId: parsed.data.id,
    details: { status: parsed.data.status },
  });

  refreshAdmin(parsed.data.id);
  return { ok: true, message: "Status updated" };
}

const notesSchema = z.object({
  id: uuid,
  notes: z.string().trim().max(2000),
});

export async function updateNotesAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = notesSchema.safeParse({
    id: formData.get("id"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) return fail(firstIssue(parsed.error));

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("bookings")
    .update({ internal_notes: parsed.data.notes || null })
    .eq("id", parsed.data.id);

  if (error) return fail(error.message);

  await logAdminAction("booking.notes", {
    entityType: "booking",
    entityId: parsed.data.id,
  });

  refreshAdmin(parsed.data.id);
  return { ok: true, message: "Note saved" };
}

// -- Payments ---------------------------------------------------------------

const markPaidSchema = z.object({
  id: uuid,
  method: z.enum(["cash", "swish_manual", "card_manual"]),
  amountOre: z.coerce.number().int().min(0).max(10_000_000),
});

export async function markPaidOnSiteAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = markPaidSchema.safeParse({
    id: formData.get("id"),
    method: formData.get("method"),
    amountOre: formData.get("amountOre"),
  });

  if (!parsed.success) return fail(firstIssue(parsed.error));

  const supabase = getSupabaseAdminClient();

  // Recorded as a `manual` provider payment so the ledger and the accountant's
  // CSV stay complete even when no money moved through Stripe.
  const { error: paymentError } = await supabase.from("payments").insert({
    booking_id: parsed.data.id,
    provider: "manual",
    amount_ore: parsed.data.amountOre,
    status: "paid",
    method: parsed.data.method,
    paid_at: new Date().toISOString(),
  });

  if (paymentError) return fail(paymentError.message);

  const { error } = await supabase
    .from("bookings")
    .update({ payment_status: "paid" })
    .eq("id", parsed.data.id);

  if (error) return fail(error.message);

  await logAdminAction("payment.manual", {
    entityType: "booking",
    entityId: parsed.data.id,
    details: { method: parsed.data.method, amountOre: parsed.data.amountOre },
  });

  refreshAdmin(parsed.data.id);
  return { ok: true, message: "Payment recorded" };
}

export async function sendPaymentLinkAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = z.object({ id: uuid }).safeParse({ id: formData.get("id") });
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const result = await issuePaymentLink(parsed.data.id);
  refreshAdmin(parsed.data.id);
  return result;
}

async function issuePaymentLink(bookingId: string): Promise<ActionState> {
  if (!isStripeConfigured()) return fail("Stripe is not configured");

  const booking = await getBookingById(bookingId);
  if (!booking) return fail("That booking does not exist");
  if (!booking.customer_email) return fail("That booking has no email address");

  const session = await createBookingCheckoutSession({
    bookingId,
    amountOre: booking.price_ore,
    dateKey: booking.booking_date,
    time: fromDbTime(booking.booking_time),
    email: booking.customer_email,
    locale: booking.locale ?? "sv",
    // Admin links are sent ahead of the visit, so they should outlive the
    // 20-minute hold used for self-service checkout.
    holdMinutes: 60 * 24,
  });

  if (!session) return fail("Could not create a payment link");

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("payments").insert({
    booking_id: bookingId,
    provider: "stripe",
    stripe_checkout_session_id: session.id,
    amount_ore: booking.price_ore,
    status: "awaiting_payment",
    checkout_url: session.url,
  });

  if (error) return fail(error.message);

  // The slot is already confirmed for an admin booking, so no hold is set —
  // only the payment state changes.
  await supabase
    .from("bookings")
    .update({ payment_status: "awaiting_payment" })
    .eq("id", bookingId);

  await notifyPaymentLink({
    date: booking.booking_date,
    time: fromDbTime(booking.booking_time),
    name: booking.customer_name ?? "",
    email: booking.customer_email,
    locale: booking.locale ?? "sv",
    amountOre: booking.price_ore,
    checkoutUrl: session.url,
  });

  await logAdminAction("payment.link", {
    entityType: "booking",
    entityId: bookingId,
    details: { amountOre: booking.price_ore },
  });

  return { ok: true, message: "Payment link sent" };
}

const refundSchema = z.object({
  id: uuid,
  amountOre: z.coerce.number().int().min(1).max(10_000_000),
  reason: z.string().trim().min(3, "Give a reason").max(500),
});

export async function refundAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = refundSchema.safeParse({
    id: formData.get("id"),
    amountOre: formData.get("amountOre"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) return fail(firstIssue(parsed.error));

  const result = await refundBooking({
    bookingId: parsed.data.id,
    amountOre: parsed.data.amountOre,
    reason: parsed.data.reason,
  });

  refreshAdmin(parsed.data.id);
  return result;
}

async function refundBooking(input: {
  bookingId: string;
  amountOre: number;
  reason: string;
}): Promise<ActionState> {
  const payments = await getPaymentsForBooking(input.bookingId);
  const paid = payments.find(
    (payment) =>
      payment.stripe_payment_intent_id &&
      (payment.status === "paid" || payment.status === "partially_refunded")
  );

  if (!paid?.stripe_payment_intent_id) {
    return fail("No Stripe payment to refund");
  }

  const alreadyRefunded = await sumSucceededRefunds(paid.id);
  if (input.amountOre + alreadyRefunded > paid.amount_ore) {
    return fail("The amount is more than what was paid");
  }

  const refund = await createRefund({
    paymentIntentId: paid.stripe_payment_intent_id,
    amountOre: input.amountOre,
    bookingId: input.bookingId,
    reason: input.reason,
  });

  if (!refund) return fail("Stripe declined the refund");

  const status = mapRefundStatus(refund.status);
  const supabase = getSupabaseAdminClient();

  // Swish settles asynchronously, so this row may stay pending until the
  // refund.updated webhook arrives.
  await supabase.from("refunds").insert({
    payment_id: paid.id,
    booking_id: input.bookingId,
    stripe_refund_id: refund.id,
    amount_ore: input.amountOre,
    reason: input.reason,
    status,
    created_by: "admin",
  });

  await logAdminAction("refund.create", {
    entityType: "booking",
    entityId: input.bookingId,
    details: {
      amountOre: input.amountOre,
      reason: input.reason,
      stripeRefundId: refund.id,
      status,
    },
  });

  return {
    ok: true,
    message:
      status === "succeeded"
        ? "Refund completed"
        : "Refund started, Stripe will confirm it",
  };
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

// -- Availability -----------------------------------------------------------

const overrideSchema = z
  .object({
    date: dateKey,
    endDate: dateKey.optional().or(z.literal("")),
    kind: z.enum(["block", "open"]),
    wholeDay: z.boolean().default(true),
    startTime: timeKey.optional().or(z.literal("")),
    endTime: timeKey.optional().or(z.literal("")),
    note: z.string().trim().max(200).optional(),
  })
  .refine(
    (value) =>
      value.wholeDay ||
      (Boolean(value.startTime) &&
        Boolean(value.endTime) &&
        value.startTime! < value.endTime!),
    { message: "The end time must be after the start time" }
  );

export async function createOverrideAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = overrideSchema.safeParse({
    date: formData.get("date"),
    endDate: formData.get("endDate") ?? "",
    kind: formData.get("kind"),
    wholeDay: formData.get("wholeDay") === "on",
    startTime: formData.get("startTime") ?? "",
    endTime: formData.get("endTime") ?? "",
    note: formData.get("note") ?? undefined,
  });

  if (!parsed.success) return fail(firstIssue(parsed.error));
  const input = parsed.data;

  // A vacation is a range, so one submission can expand into many day rows.
  const lastDate =
    input.endDate && input.endDate >= input.date ? input.endDate : input.date;

  const rows: Array<Record<string, unknown>> = [];
  let cursor = input.date;
  for (let i = 0; i <= 365 && cursor <= lastDate; i++) {
    rows.push({
      override_date: cursor,
      kind: input.kind,
      start_time: input.wholeDay ? null : toDbTime(input.startTime!),
      end_time: input.wholeDay ? null : toDbTime(input.endTime!),
      note: input.note ?? null,
    });
    cursor = addDaysToDateKey(cursor, 1);
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("availability_overrides").insert(rows);

  if (error) return fail(error.message);

  await logAdminAction("availability.create", {
    entityType: "availability",
    details: { from: input.date, to: lastDate, kind: input.kind },
  });

  refreshAdmin();
  return {
    ok: true,
    message:
      rows.length > 1
        ? `${rows.length} days updated`
        : "Exception saved",
  };
}

export async function deleteOverrideAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = z.object({ id: uuid }).safeParse({ id: formData.get("id") });
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("availability_overrides")
    .delete()
    .eq("id", parsed.data.id);

  if (error) return fail(error.message);

  await logAdminAction("availability.delete", {
    entityType: "availability",
    entityId: parsed.data.id,
  });

  refreshAdmin();
  return { ok: true, message: "Exception deleted" };
}

// -- Settings ---------------------------------------------------------------

const rulesSchema = z
  .object({
    weekdays: z.array(z.coerce.number().int().min(0).max(6)).min(1, "Pick at least one day"),
    startHour: z.coerce.number().int().min(0).max(23),
    endHour: z.coerce.number().int().min(1).max(24),
    horizonDays: z.coerce.number().int().min(1).max(365),
    priceOre: z.coerce.number().int().min(0).max(10_000_000),
  })
  .refine((value) => value.endHour > value.startHour, {
    message: "The closing time must be after the opening time",
  });

export async function updateRulesAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = rulesSchema.safeParse({
    weekdays: formData.getAll("weekdays"),
    startHour: formData.get("startHour"),
    endHour: formData.get("endHour"),
    horizonDays: formData.get("horizonDays"),
    priceOre: formData.get("priceOre"),
  });

  if (!parsed.success) return fail(firstIssue(parsed.error));

  const value = parseBookingRules(parsed.data);
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "booking_rules", value }, { onConflict: "key" });

  if (error) return fail(error.message);

  await logAdminAction("settings.rules", {
    entityType: "settings",
    entityId: "booking_rules",
    details: value,
  });

  revalidatePath("/admin/settings");
  refreshAdmin();
  return { ok: true, message: "Settings saved" };
}

// -- Shared helpers ---------------------------------------------------------

/**
 * Returns a message when the slot is taken. The partial unique index is the
 * real guarantee; this exists so the admin sees a readable error instead of a
 * Postgres constraint name. Times outside the published schedule are allowed
 * deliberately — the owner can always squeeze in a job.
 */
async function slotConflict(
  date: string,
  time: string,
  ignoreBookingId?: string
): Promise<string | null> {
  const supabase = getSupabaseAdminClient();
  let request = supabase
    .from("bookings")
    .select("id")
    .eq("booking_date", date)
    .eq("booking_time", toDbTime(time))
    .in("status", ["pending", "confirmed", "completed", "no_show"]);

  if (ignoreBookingId) request = request.neq("id", ignoreBookingId);

  const { data } = await request;
  return (data ?? []).length > 0 ? "That slot is already booked" : null;
}

/** Used by the new-booking form to warn about times outside the schedule. */
export async function isOutsideSchedule(
  date: string,
  time: string
): Promise<boolean> {
  const [rules, overrides] = await Promise.all([
    getBookingRules(),
    getAvailabilityOverrides(date, date),
  ]);
  return !isSlotOpen(date, time, rules, overrides);
}
