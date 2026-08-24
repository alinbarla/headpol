"use client";

import { useActionState, useState } from "react";
import { updateRulesAction, type ActionState } from "@/app/admin/actions";
import { ActionToast, SubmitButton } from "@/components/admin/SubmitButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import type { BookingRules } from "@/lib/availability";
import { WEEKDAY_LABELS, WEEKDAY_ORDER } from "@/lib/admin/labels";
import { formatOre } from "@/lib/booking";

const initial: ActionState = { ok: true };

export function RulesForm({ rules }: { rules: BookingRules }) {
  const [state, formAction] = useActionState(updateRulesAction, initial);
  const [priceOre, setPriceOre] = useState(rules.priceOre);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Öppettider och pris</CardTitle>
      </CardHeader>
      <CardContent>
        <ActionToast state={state} />
        <form action={formAction} className="space-y-4">
          <fieldset>
            <legend className="text-sm font-medium">Öppna dagar</legend>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {WEEKDAY_ORDER.map((day) => (
                <label
                  key={day}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary/50"
                >
                  <input
                    type="checkbox"
                    name="weekdays"
                    value={day}
                    defaultChecked={rules.weekdays.includes(day)}
                    className="size-4 accent-[var(--primary)]"
                  />
                  {WEEKDAY_LABELS[day]}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startHour">Öppnar (timme)</Label>
              <Input
                id="startHour"
                name="startHour"
                type="number"
                min={0}
                max={23}
                required
                defaultValue={rules.startHour}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endHour">Stänger (timme)</Label>
              <Input
                id="endHour"
                name="endHour"
                type="number"
                min={1}
                max={24}
                required
                defaultValue={rules.endHour}
              />
              <p className="text-xs text-muted-foreground">
                Sista tiden startar timmen innan.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="horizonDays">Bokningsbart antal dagar framåt</Label>
            <Input
              id="horizonDays"
              name="horizonDays"
              type="number"
              min={1}
              max={365}
              required
              defaultValue={rules.horizonDays}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="priceOre">Pris i öre</Label>
            <Input
              id="priceOre"
              name="priceOre"
              type="number"
              min={0}
              step={100}
              required
              value={priceOre}
              onChange={(event) => setPriceOre(Number(event.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {formatOre(Number.isFinite(priceOre) ? priceOre : 0)} inklusive
              moms.
            </p>
          </div>

          <SubmitButton className="w-full">Spara inställningar</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
