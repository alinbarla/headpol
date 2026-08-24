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
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={defaultDate}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time">Tid</Label>
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
            <Label htmlFor="name">Namn</Label>
            <Input id="name" name="name" required minLength={2} maxLength={80} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefon</Label>
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
            <Label htmlFor="email">E-post (valfritt)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              maxLength={120}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Krävs för bekräftelse, påminnelse och betallänk.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Adress</Label>
            <Textarea
              id="address"
              name="address"
              required
              rows={2}
              minLength={4}
              maxLength={200}
              placeholder="Gata 12, 123 45 Stockholm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="source">Kanal</Label>
              <Select name="source" defaultValue="phone">
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Telefon</SelectItem>
                  <SelectItem value="walk_in">Drop-in</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="locale">Språk</Label>
              <Select name="locale" defaultValue="sv">
                <SelectTrigger id="locale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sv">Svenska</SelectItem>
                  <SelectItem value="en">Engelska</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="priceOre">Pris i öre</Label>
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
            <Label htmlFor="notes">Interna anteckningar</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              maxLength={2000}
              placeholder="Portkod, bilmodell, var bilen står…"
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
                Skicka betallänk direkt
                {!email && (
                  <span className="block text-xs text-muted-foreground">
                    Kräver en e-postadress.
                  </span>
                )}
              </span>
            </label>
          )}

          <SubmitButton className="w-full" pendingLabel="Skapar…">
            Skapa bokning
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
