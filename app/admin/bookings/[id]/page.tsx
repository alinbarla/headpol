import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import {
  getBookingById,
  getPaymentsForBooking,
  getRefundsForBooking,
} from "@/lib/admin/data";
import {
  ADMIN_LOCALE,
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TONE,
  SOURCE_LABELS,
  STATUS_TONE,
  mapsLink,
  paymentMethodLabel,
  telLink,
} from "@/lib/admin/labels";
import { formatOre, fromDbTime } from "@/lib/booking";
import { isStripeConfigured } from "@/lib/stripe";
import { formatDateKey, formatTimestamp } from "@/lib/time";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  CancelCard,
  DeleteExpiredCard,
  NotesCard,
  PaymentCard,
  RescheduleCard,
  StatusCard,
} from "@/components/admin/BookingActions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const booking = await getBookingById(id);
  if (!booking) notFound();

  const [payments, refunds] = await Promise.all([
    getPaymentsForBooking(id),
    getRefundsForBooking(id),
  ]);

  const stripePayment = payments.find(
    (payment) =>
      payment.stripe_payment_intent_id &&
      (payment.status === "paid" || payment.status === "partially_refunded")
  );

  // Pending refunds count against the remaining balance, otherwise a slow
  // Swish settlement could be refunded twice.
  const refundedOre = refunds
    .filter((refund) => refund.status !== "failed" && refund.status !== "canceled")
    .reduce((total, refund) => total + refund.amount_ore, 0);

  const refundableOre = stripePayment
    ? Math.max(stripePayment.amount_ore - refundedOre, 0)
    : 0;

  const phone = telLink(booking.customer_phone);
  const maps = mapsLink(booking.customer_address);

  return (
    <AdminShell>
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        All bookings
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {booking.customer_name ?? "No name"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateKey(booking.booking_date, ADMIN_LOCALE)} ·{" "}
            {fromDbTime(booking.booking_time)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              STATUS_TONE[booking.status]
            )}
          >
            {BOOKING_STATUS_LABELS[booking.status]}
          </span>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              PAYMENT_TONE[booking.payment_status]
            )}
          >
            {PAYMENT_STATUS_LABELS[booking.payment_status]}
          </span>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {SOURCE_LABELS[booking.source]}
          </span>
        </div>
      </div>

      {(phone || maps) && (
        <div className="mt-4 flex gap-2">
          {phone && (
            <a
              href={phone}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 text-sm font-medium hover:border-primary"
            >
              <PhoneIcon className="size-4" />
              Call {booking.customer_phone}
            </a>
          )}
          {maps && (
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 text-sm font-medium hover:border-primary"
            >
              <MapPinIcon className="size-4" />
              Navigate
            </a>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Customer details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Name" value={booking.customer_name} />
            <Row label="Phone" value={booking.customer_phone} />
            <Row label="Email" value={booking.customer_email} />
            <Row label="Address" value={booking.customer_address} />
            <Row
              label="Language"
              value={booking.locale === "en" ? "English" : "Swedish"}
            />
            <Row label="Price" value={formatOre(booking.price_ore)} />
            <Row label="Booked" value={formatTimestamp(booking.created_at)} />
            {booking.cancelled_at && (
              <Row
                label="Cancelled"
                value={`${formatTimestamp(booking.cancelled_at)}${
                  booking.cancellation_reason
                    ? ` — ${booking.cancellation_reason}`
                    : ""
                }`}
              />
            )}
          </CardContent>
        </Card>

        <StatusCard booking={booking} />
        <RescheduleCard booking={booking} />
        <NotesCard booking={booking} />
        <PaymentCard
          booking={booking}
          refundableOre={refundableOre}
          stripeEnabled={isStripeConfigured()}
        />
        <CancelCard booking={booking} />
        <DeleteExpiredCard booking={booking} />
      </div>

      {(payments.length > 0 || refunds.length > 0) && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Payment history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 last:border-0"
              >
                <span className="text-muted-foreground">
                  {formatTimestamp(payment.created_at)} ·{" "}
                  {paymentMethodLabel(payment.method)} · {payment.status}
                </span>
                <span className="flex items-center gap-3 font-medium tabular-nums">
                  {formatOre(payment.amount_ore)}
                  {payment.checkout_url &&
                    payment.status === "awaiting_payment" && (
                      <a
                        href={payment.checkout_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Open payment link
                      </a>
                    )}
                  {payment.receipt_url && (
                    <a
                      href={payment.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Receipt
                    </a>
                  )}
                </span>
              </div>
            ))}

            {refunds.map((refund) => (
              <div
                key={refund.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 text-violet-200 last:border-0"
              >
                <span>
                  {formatTimestamp(refund.created_at)} · Refund ·{" "}
                  {refund.status}
                  {refund.reason ? ` · ${refund.reason}` : ""}
                </span>
                <span className="font-medium tabular-nums">
                  −{formatOre(refund.amount_ore)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </AdminShell>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value?.trim() || "—"}</span>
    </div>
  );
}
