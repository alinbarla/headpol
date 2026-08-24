"use client";

import { useActionState, useState } from "react";
import {
  cancelBookingAction,
  markPaidOnSiteAction,
  refundAction,
  rescheduleBookingAction,
  sendPaymentLinkAction,
  setBookingStatusAction,
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
import { formatOre } from "@/lib/booking";
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
    { value: "confirmed", label: "Confirmed" },
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
}: {
  booking: BookingRecord;
  refundableOre: number;
  stripeEnabled: boolean;
}) {
  const [manualState, manualAction] = useActionState(
    markPaidOnSiteAction,
    initial
  );
  const [linkState, linkAction] = useActionState(sendPaymentLinkAction, initial);
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
        <ActionToast state={refundState} />

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
