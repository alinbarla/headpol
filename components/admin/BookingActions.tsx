"use client";

import { useActionState, useState } from "react";
import {
  cancelBookingAction,
  deleteAllExpiredBookingsAction,
  deleteBookingAction,
  markPaidOnSiteAction,
  refundAction,
  rescheduleBookingAction,
  sendPaymentLinkAction,
  sendStripeReceiptAction,
  setBookingStatusAction,
  syncStripePaymentAction,
  updateNotesAction,
  type ActionState,
} from "@/app/admin/actions";
import { ActionToast, SubmitButton } from "@/components/admin/SubmitButton";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { Trash2Icon, ExternalLinkIcon, MailIcon, ReceiptIcon } from "lucide-react";
import { formatOre, fromDbTime } from "@/lib/booking";
import type { BookingRecord } from "@/lib/supabase/server";

const initial: ActionState = { ok: true };

export function RescheduleCard({ booking }: { booking: BookingRecord }) {
  const [state, formAction] = useActionState(rescheduleBookingAction, initial);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Reschedule</CardTitle>
      </CardHeader>
      <CardContent>
        <ActionToast state={state} />
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={booking.id} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="reschedule-date">Date</Label>
              <Input
                id="reschedule-date"
                name="date"
                type="date"
                required
                defaultValue={booking.booking_date}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reschedule-time">Time</Label>
              <Input
                id="reschedule-time"
                name="time"
                type="time"
                step={3600}
                required
                defaultValue={booking.booking_time.slice(0, 5)}
              />
            </div>
          </div>
          <NotifyToggle id="reschedule-notify" />
          <SubmitButton className="w-full" pendingLabel="Moving…">
            Move booking
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

export function StatusCard({ booking }: { booking: BookingRecord }) {
  const [state, formAction] = useActionState(setBookingStatusAction, initial);

  const options: Array<{ value: string; label: string }> = [
    { value: "confirmed", label: "To do" },
    { value: "completed", label: "Completed" },
    { value: "no_show", label: "No-show" },
    { value: "pending", label: "Unconfirmed" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ActionToast state={state} />
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => (
            <form key={option.value} action={formAction}>
              <input type="hidden" name="id" value={booking.id} />
              <input type="hidden" name="status" value={option.value} />
              <SubmitButton
                variant={booking.status === option.value ? "default" : "outline"}
                className="w-full"
                disabled={booking.status === option.value}
                pendingLabel="…"
              >
                {option.label}
              </SubmitButton>
            </form>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CancelCard({ booking }: { booking: BookingRecord }) {
  const [state, formAction] = useActionState(cancelBookingAction, initial);
  const canRefund = booking.payment_status === "paid";

  if (booking.status === "cancelled" || booking.status === "expired") {
    return null;
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-sm text-destructive">Cancel</CardTitle>
      </CardHeader>
      <CardContent>
        <ActionToast state={state} />
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={booking.id} />
          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason">Reason</Label>
            <Input
              id="cancel-reason"
              name="reason"
              maxLength={500}
              placeholder="Customer rebooked, rain, illness…"
            />
          </div>
          <NotifyToggle id="cancel-notify" />
          {canRefund && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="refund"
                defaultChecked
                className="size-4 accent-[var(--primary)]"
              />
              Refund {formatOre(booking.price_ore)} at the same time
            </label>
          )}
          <SubmitButton
            variant="destructive"
            className="w-full"
            pendingLabel="Cancelling…"
          >
            Cancel booking
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

export function DeleteBookingCard({ booking }: { booking: BookingRecord }) {
  const [state, formAction] = useActionState(deleteBookingAction, initial);
  const paid =
    booking.payment_status === "paid" ||
    booking.payment_status === "partially_refunded";

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-sm text-destructive">Delete</CardTitle>
      </CardHeader>
      <CardContent>
        <ActionToast state={state} />
        <p className="mb-3 text-sm text-muted-foreground">
          Removes this booking from the calendar and lists, including payment
          history here. This cannot be undone
          {paid
            ? ", and it does not refund the customer in Stripe."
            : "."}
        </p>
        <form
          action={formAction}
          onSubmit={(event) => {
            const when = `${booking.booking_date} ${fromDbTime(booking.booking_time)}`;
            const name = booking.customer_name ?? "this booking";
            if (
              !window.confirm(
                `Delete ${name} on ${when}? This cannot be undone.${
                  paid ? " This does not refund Stripe." : ""
                }`
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={booking.id} />
          <SubmitButton
            variant="destructive"
            className="w-full"
            pendingLabel="Deleting…"
          >
            Delete permanently
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

export function DeleteBookingButton({
  booking,
}: {
  booking: BookingRecord;
}) {
  const [state, formAction] = useActionState(deleteBookingAction, initial);
  const paid =
    booking.payment_status === "paid" ||
    booking.payment_status === "partially_refunded";

  return (
    <form
      action={formAction}
      className="flex items-center"
      onSubmit={(event) => {
        const when = `${booking.booking_date} ${fromDbTime(booking.booking_time)}`;
        const name = booking.customer_name ?? "this booking";
        const extra = paid
          ? " This does not refund Stripe."
          : "";
        if (
          !window.confirm(
            `Delete ${name} on ${when}? This cannot be undone.${extra}`
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <ActionToast state={state} />
      <input type="hidden" name="id" value={booking.id} />
      <input type="hidden" name="stay" value="1" />
      <SubmitButton
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        pendingLabel="…"
        aria-label={`Delete ${booking.customer_name ?? "booking"}`}
      >
        <Trash2Icon />
      </SubmitButton>
    </form>
  );
}

export function DeleteAllExpiredForm() {
  const [state, formAction] = useActionState(
    deleteAllExpiredBookingsAction,
    initial
  );

  return (
    <form
      action={formAction}
      className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center"
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Delete every expired booking permanently? This cannot be undone."
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <ActionToast state={state} />
      <SubmitButton
        variant="destructive"
        size="sm"
        pendingLabel="Deleting…"
      >
        Delete all expired
      </SubmitButton>
    </form>
  );
}

export function NotesCard({ booking }: { booking: BookingRecord }) {
  const [state, formAction] = useActionState(updateNotesAction, initial);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Internal notes</CardTitle>
      </CardHeader>
      <CardContent>
        <ActionToast state={state} />
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={booking.id} />
          <Textarea
            name="notes"
            rows={4}
            maxLength={2000}
            defaultValue={booking.internal_notes ?? ""}
            placeholder="Door code, car model, where the car is parked, customer requests…"
          />
          <SubmitButton variant="outline" className="w-full">
            Save note
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

export function PaymentCard({
  booking,
  refundableOre,
  stripeEnabled,
  stripeReceipt,
}: {
  booking: BookingRecord;
  refundableOre: number;
  stripeEnabled: boolean;
  stripeReceipt?: { receiptUrl: string; customerEmail: string } | null;
}) {
  const [manualState, manualAction] = useActionState(
    markPaidOnSiteAction,
    initial
  );
  const [linkState, linkAction] = useActionState(sendPaymentLinkAction, initial);
  const [syncState, syncAction] = useActionState(
    syncStripePaymentAction,
    initial
  );
  const [receiptState, receiptAction] = useActionState(
    sendStripeReceiptAction,
    initial
  );
  const [refundState, refundAct] = useActionState(refundAction, initial);
  const [showRefund, setShowRefund] = useState(false);

  const unpaid =
    booking.payment_status === "unpaid" ||
    booking.payment_status === "awaiting_payment";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ActionToast state={manualState} />
        <ActionToast state={linkState} />
        <ActionToast state={syncState} />
        <ActionToast state={receiptState} />
        <ActionToast state={refundState} />

        {stripeReceipt && (
          <div className="overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-muted/40 via-background to-muted/20">
            <div className="flex items-start gap-3 border-b border-border/60 px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ReceiptIcon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">Stripe receipt</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Official payment receipt hosted by Stripe for this booking.
                </p>
              </div>
            </div>
            <div className="grid gap-2 p-3 sm:grid-cols-2">
              <Button
                asChild
                variant="outline"
                className="h-10 w-full justify-center bg-background/80"
              >
                <a
                  href={stripeReceipt.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLinkIcon />
                  View receipt
                </a>
              </Button>
              <form action={receiptAction}>
                <input type="hidden" name="id" value={booking.id} />
                <SubmitButton
                  variant="secondary"
                  className="h-10 w-full justify-center"
                  pendingLabel="Sending…"
                >
                  <MailIcon />
                  Send to {stripeReceipt.customerEmail}
                </SubmitButton>
              </form>
            </div>
          </div>
        )}

        {unpaid && stripeEnabled && (
          <form action={syncAction}>
            <input type="hidden" name="id" value={booking.id} />
            <p className="text-xs text-muted-foreground">
              If the customer already paid in Stripe, this checks Stripe and
              marks the booking paid without recording a second payment.
            </p>
            <SubmitButton
              variant="outline"
              className="mt-2 w-full"
              pendingLabel="Checking Stripe…"
            >
              Confirm payment from Stripe
            </SubmitButton>
          </form>
        )}

        {unpaid && (
          <form action={manualAction} className="space-y-3">
            <input type="hidden" name="id" value={booking.id} />
            <input
              type="hidden"
              name="amountOre"
              value={String(booking.price_ore)}
            />
            <div className="space-y-1.5">
              <Label htmlFor="paid-method">Record payment manually</Label>
              <p className="text-xs text-muted-foreground">
                Web bookings are always prepaid. Use this only for phone
                bookings settled outside Stripe.
              </p>
              <Select name="method" defaultValue="swish_manual">
                <SelectTrigger id="paid-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="swish_manual">Swish</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card_manual">Card terminal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SubmitButton variant="outline" className="w-full">
              Mark as paid ({formatOre(booking.price_ore)})
            </SubmitButton>
          </form>
        )}

        {unpaid && stripeEnabled && booking.customer_email && (
          <form action={linkAction}>
            <input type="hidden" name="id" value={booking.id} />
            <SubmitButton
              variant="secondary"
              className="w-full"
              pendingLabel="Sending…"
            >
              Send payment link to {booking.customer_email}
            </SubmitButton>
          </form>
        )}

        {refundableOre > 0 && (
          <div className="border-t border-border pt-4">
            {showRefund ? (
              <form action={refundAct} className="space-y-3">
                <input type="hidden" name="id" value={booking.id} />
                <div className="space-y-1.5">
                  <Label htmlFor="refund-amount">Amount in öre</Label>
                  <Input
                    id="refund-amount"
                    name="amountOre"
                    type="number"
                    required
                    min={1}
                    max={refundableOre}
                    step={100}
                    defaultValue={refundableOre}
                  />
                  <p className="text-xs text-muted-foreground">
                    Max {refundableOre} öre ({formatOre(refundableOre)}).
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="refund-reason">Reason (required)</Label>
                  <Input
                    id="refund-reason"
                    name="reason"
                    required
                    minLength={3}
                    maxLength={500}
                  />
                </div>
                <div className="flex gap-2">
                  <SubmitButton
                    variant="destructive"
                    className="flex-1"
                    pendingLabel="Refunding…"
                  >
                    Refund
                  </SubmitButton>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowRefund(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowRefund(true)}
              >
                Refund (up to {formatOre(refundableOre)})
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NotifyToggle({ id }: { id: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        id={id}
        type="checkbox"
        name="notify"
        defaultChecked
        className="size-4 accent-[var(--primary)]"
      />
      Notify the customer by email
    </label>
  );
}
