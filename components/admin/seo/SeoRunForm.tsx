"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { ActionToast, SubmitButton } from "@/components/admin/SubmitButton";

const idle: ActionState = { ok: false };

export function SeoRunForm({
  action,
  label = "Run check now",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  label?: string;
}) {
  const [state, formAction] = useActionState(action, idle);

  return (
    <form action={formAction}>
      <ActionToast state={state} />
      <SubmitButton size="sm" pendingLabel="Running…">
        {label}
      </SubmitButton>
    </form>
  );
}
