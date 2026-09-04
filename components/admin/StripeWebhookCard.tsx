"use client";

import { useActionState } from "react";
import {
  repairStripeWebhookAction,
  type ActionState,
} from "@/app/admin/actions";
import { ActionToast, SubmitButton } from "@/components/admin/SubmitButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import type { StripeWebhookStatus } from "@/lib/stripe";

const initial: ActionState = { ok: true };

export function StripeWebhookCard({ status }: { status: StripeWebhookStatus }) {
  const [state, formAction] = useActionState(repairStripeWebhookAction, initial);

  return (
    <Card className={status.healthy ? undefined : "border-amber-500/40"}>
      <CardHeader>
        <CardTitle className="text-sm">Stripe webhook</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <ActionToast state={state} />
        <p
          className={
            status.healthy
              ? "text-emerald-200"
              : "text-amber-200"
          }
        >
          {status.message}
        </p>
        <p className="text-xs text-muted-foreground">
          Expected URL:{" "}
          <code className="break-all text-foreground">{status.expectedUrl}</code>
        </p>
        {status.endpoints.length > 0 && (
          <ul className="space-y-1 text-xs text-muted-foreground">
            {status.endpoints.map((endpoint) => (
              <li key={endpoint.id} className="break-all">
                <span className="text-foreground">{endpoint.status}</span> ·{" "}
                {endpoint.url}
              </li>
            ))}
          </ul>
        )}
        {!status.healthy && status.configured && (
          <form action={formAction}>
            <SubmitButton className="w-full" pendingLabel="Repairing…">
              Repair webhook endpoint
            </SubmitButton>
          </form>
        )}
        {typeof state === "object" &&
          state &&
          "signingSecret" in state &&
          typeof state.signingSecret === "string" &&
          state.signingSecret && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
              <p className="font-medium text-amber-100">
                New signing secret — set as STRIPE_WEBHOOK_SECRET on Vercel, then
                redeploy:
              </p>
              <code className="mt-2 block break-all text-amber-50">
                {state.signingSecret}
              </code>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
