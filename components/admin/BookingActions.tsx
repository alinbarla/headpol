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
        <CardTitle className="text-sm">Flytta bokningen</CardTitle>
      </CardHeader>
      <CardContent>
        <ActionToast state={state} />
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={booking.id} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="reschedule-date">Datum</Label>
              <Input
                id="reschedule-date"
                name="date"
                type="date"
                required
                defaultValue={booking.booking_date}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reschedule-time">Tid</Label>
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
          <SubmitButton className="w-full" pendingLabel="Flyttar…">
            Flytta
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

export function StatusCard({ booking }: { booking: BookingRecord }) {
  const [state, formAction] = useActionState(setBookingStatusAction, initial);

  const options: Array<{ value: string; label: string }> = [
    { value: "confirmed", label: "Bekräftad" },
    { value: "completed", label: "Utförd" },
    { value: "no_show", label: "Uteblev" },
    { value: "pending", label: "Ej bekräftad" },
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
        <CardTitle className="text-sm text-destructive">Avboka</CardTitle>
      </CardHeader>
      <CardContent>
        <ActionToast state={state} />
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={booking.id} />
          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason">Anledning</Label>
            <Input
              id="cancel-reason"
              name="reason"
              maxLength={500}
              placeholder="Kunden ombokade, regn, sjukdom…"
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
              Återbetala {formatOre(booking.price_ore)} samtidigt
            </label>
          )}
          <SubmitButton
            variant="destructive"
            className="w-full"
            pendingLabel="Avbokar…"
          >
            Avboka bokningen
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
        <CardTitle className="text-sm">Interna anteckningar</CardTitle>
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
            placeholder="Portkod, bilmodell, var bilen står, kundens önskemål…"
          />
          <SubmitButton variant="outline" className="w-full">
            Spara anteckning
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
        <CardTitle className="text-sm">Betalning</CardTitle>
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
              <Label htmlFor="paid-method">Registrera betalning manuellt</Label>
              <p className="text-xs text-muted-foreground">
                Webbokningar betalas alltid i förväg. Använd det här bara för
                telefonbokningar som betalats utanför Stripe.
              </p>
              <Select name="method" defaultValue="swish_manual">
                <SelectTrigger id="paid-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="swish_manual">Swish</SelectItem>
                  <SelectItem value="cash">Kontant</SelectItem>
                  <SelectItem value="card_manual">Kortterminal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SubmitButton variant="outline" className="w-full">
              Markera som betald ({formatOre(booking.price_ore)})
            </SubmitButton>
          </form>
        )}

        {unpaid && stripeEnabled && booking.customer_email && (
          <form action={linkAction}>
            <input type="hidden" name="id" value={booking.id} />
            <SubmitButton
              variant="secondary"
              className="w-full"
              pendingLabel="Skickar…"
            >
              Skicka betallänk till {booking.customer_email}
            </SubmitButton>
          </form>
        )}

        {refundableOre > 0 && (
          <div className="border-t border-border pt-4">
            {showRefund ? (
              <form action={refundAct} className="space-y-3">
                <input type="hidden" name="id" value={booking.id} />
                <div className="space-y-1.5">
                  <Label htmlFor="refund-amount">Belopp i öre</Label>
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
                  <Label htmlFor="refund-reason">Anledning (krävs)</Label>
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
                    pendingLabel="Återbetalar…"
                  >
                    Återbetala
                  </SubmitButton>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowRefund(false)}
                  >
                    Avbryt
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
                Återbetala (upp till {formatOre(refundableOre)})
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
      Meddela kunden via e-post
    </label>
  );
}
