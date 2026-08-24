"use client";

import { useActionState, useState } from "react";
import { Trash2Icon } from "lucide-react";
import {
  createOverrideAction,
  deleteOverrideAction,
  type ActionState,
} from "@/app/admin/actions";
import { ActionToast, SubmitButton } from "@/components/admin/SubmitButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import type { AvailabilityOverride } from "@/lib/availability";
import { formatDateKey } from "@/lib/time";

const initial: ActionState = { ok: true };

export function OverrideForm({
  defaultDate,
  defaultStart,
  defaultEnd,
}: {
  defaultDate: string;
  defaultStart: string;
  defaultEnd: string;
}) {
  const [state, formAction] = useActionState(createOverrideAction, initial);
  const [wholeDay, setWholeDay] = useState(true);
  const [kind, setKind] = useState("block");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Lägg till undantag</CardTitle>
      </CardHeader>
      <CardContent>
        <ActionToast state={state} />
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="kind">Typ</Label>
            <Select name="kind" value={kind} onValueChange={setKind}>
              <SelectTrigger id="kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="block">Stäng tid</SelectItem>
                <SelectItem value="open">Öppna extra tid</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {kind === "block"
                ? "Semester, sjukdom eller en enskild timme du behöver för dig själv."
                : "Öppnar tid som annars är stängd, till exempel en lördag."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Från datum</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={defaultDate}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">Till datum (valfritt)</Label>
              <Input id="endDate" name="endDate" type="date" />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="wholeDay"
              checked={wholeDay}
              onChange={(event) => setWholeDay(event.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            Hela dagen
          </label>

          {!wholeDay && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="startTime">Från kl</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  step={3600}
                  defaultValue={defaultStart}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endTime">Till kl</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  step={3600}
                  defaultValue={defaultEnd}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="note">Notering (valfritt)</Label>
            <Input id="note" name="note" maxLength={200} placeholder="Semester" />
          </div>

          <SubmitButton className="w-full">Spara undantag</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

export function OverrideList({
  overrides,
  today,
}: {
  overrides: AvailabilityOverride[];
  today: string;
}) {
  const [state, formAction] = useActionState(deleteOverrideAction, initial);

  if (overrides.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Inga undantag. Ordinarie öppettider gäller.
      </p>
    );
  }

  return (
    <div>
      <ActionToast state={state} />
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {overrides.map((override) => (
          <li
            key={override.id}
            className={`flex items-center gap-3 bg-card px-4 py-3 ${
              override.override_date < today ? "opacity-50" : ""
            }`}
          >
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                override.kind === "block"
                  ? "border-red-500/40 bg-red-500/15 text-red-200"
                  : "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
              }`}
            >
              {override.kind === "block" ? "Stängt" : "Extra"}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {formatDateKey(override.override_date, "sv")}
              </p>
              <p className="text-xs text-muted-foreground">
                {override.start_time && override.end_time
                  ? `${override.start_time}–${override.end_time}`
                  : "Hela dagen"}
                {override.note ? ` · ${override.note}` : ""}
              </p>
            </div>

            <form action={formAction}>
              <input type="hidden" name="id" value={override.id} />
              <SubmitButton
                variant="ghost"
                size="icon"
                pendingLabel="…"
                aria-label="Ta bort"
              >
                <Trash2Icon className="size-4" />
              </SubmitButton>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
