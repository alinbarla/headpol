"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { setVisitorBookedAction } from "@/app/admin/visitors/actions";
import { ActionToast, SubmitButton } from "@/components/admin/SubmitButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";

const initial: ActionState = { ok: true };

export function VisitorBookedCard({
  sessionId,
  booked,
  bookedOverride,
  autoBooked,
}: {
  sessionId: string;
  booked: boolean;
  bookedOverride: boolean | null;
  /** What automatic linking would say without a manual override. */
  autoBooked: boolean;
}) {
  const [state, formAction] = useActionState(setVisitorBookedAction, initial);

  const mode =
    bookedOverride === true
      ? "booked"
      : bookedOverride === false
        ? "not_booked"
        : "auto";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Booked status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ActionToast state={state} />
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {booked ? "Booked" : "Not booked"}
          </span>
          {mode === "auto"
            ? ` (automatic: ${autoBooked ? "linked booking found" : "no linked booking"}).`
            : " (manual override)."}{" "}
          Change this if the system link is wrong.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <form action={formAction}>
            <input type="hidden" name="id" value={sessionId} />
            <input type="hidden" name="booked" value="true" />
            <SubmitButton
              variant={mode === "booked" ? "default" : "outline"}
              className="w-full"
              disabled={mode === "booked"}
              pendingLabel="…"
            >
              Booked
            </SubmitButton>
          </form>
          <form action={formAction}>
            <input type="hidden" name="id" value={sessionId} />
            <input type="hidden" name="booked" value="false" />
            <SubmitButton
              variant={mode === "not_booked" ? "default" : "outline"}
              className="w-full"
              disabled={mode === "not_booked"}
              pendingLabel="…"
            >
              Not booked
            </SubmitButton>
          </form>
        </div>
        {mode !== "auto" ? (
          <form action={formAction}>
            <input type="hidden" name="id" value={sessionId} />
            <input type="hidden" name="booked" value="auto" />
            <SubmitButton
              variant="ghost"
              size="sm"
              className="w-full"
              pendingLabel="…"
            >
              Use automatic detection
            </SubmitButton>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
