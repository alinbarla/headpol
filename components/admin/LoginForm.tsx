"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent } from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";

const initialState: ActionState = { ok: true };

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">PIN-kod</Label>
            <Input
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              autoFocus
              required
              minLength={4}
              maxLength={64}
              className="text-center text-lg tracking-[0.4em]"
            />
          </div>

          {state.message && !state.ok && (
            <p role="alert" className="text-sm text-destructive">
              {state.message}
            </p>
          )}

          <SubmitButton />

          <p className="text-center text-xs text-muted-foreground">
            Fem felaktiga försök låser inloggningen i 15 minuter.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Loggar in…" : "Logga in"}
    </Button>
  );
}
