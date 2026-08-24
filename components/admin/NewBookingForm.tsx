"use client";

import { useActionState, useState } from "react";
import { createBookingAction, type ActionState } from "@/app/admin/actions";
import { ActionToast, SubmitButton } from "@/components/admin/SubmitButton";
import { Card, CardContent } from "@/components/shadcn/card";
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

const initial: ActionState = { ok: true };

export function NewBookingForm({
  defaultDate,
  defaultTime,
  defaultPriceOre,
  stripeEnabled,
}: {
  defaultDate: string;
  defaultTime: string;
  defaultPriceOre: number;
  stripeEnabled: boolean;
}) {
  const [state, formAction] = useActionState(createBookingAction, initial);
  const [priceOre, setPriceOre] = useState(defaultPriceOre);
  const [email, setEmail] = useState("");

  return (
    <Card>
      <CardContent className="pt-6">
        <ActionToast state={state} />
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={defaultDate}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                name="time"
                type="time"
                step={3600}
                required
                defaultValue={defaultTime}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required minLength={2} maxLength={80} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              minLength={6}
              maxLength={40}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              maxLength={120}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Required for the confirmation, reminder and payment link.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              required
              rows={2}
              minLength={4}
              maxLength={200}
              placeholder="Street 12, 123 45 Stockholm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="source">Channel</Label>
              <Select name="source" defaultValue="phone">
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="locale">Customer language</Label>
              <Select name="locale" defaultValue="sv">
                <SelectTrigger id="locale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sv">Swedish</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="priceOre">Price in öre</Label>
            <Input
              id="priceOre"
              name="priceOre"
              type="number"
              required
              min={0}
              step={100}
              value={priceOre}
              onChange={(event) => setPriceOre(Number(event.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {formatOre(Number.isFinite(priceOre) ? priceOre : 0)}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Internal notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              maxLength={2000}
              placeholder="Door code, car model, where the car is parked…"
            />
          </div>

          {stripeEnabled && (
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="sendPaymentLink"
                defaultChecked
                disabled={!email}
                className="mt-0.5 size-4 accent-[var(--primary)] disabled:opacity-40"
              />
              <span>
                Send a payment link now
                {!email && (
                  <span className="block text-xs text-muted-foreground">
                    Requires an email address.
                  </span>
                )}
              </span>
            </label>
          )}

          <SubmitButton className="w-full" pendingLabel="Creating…">
            Create booking
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
