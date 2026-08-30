"use client";

import { useActionState } from "react";
import { PlusIcon } from "lucide-react";
import { createThreadAction } from "@/app/admin/assistant/actions";
import type { ActionState } from "@/app/admin/actions";
import { ActionToast, SubmitButton } from "@/components/admin/SubmitButton";

const idle: ActionState = { ok: false };

export function NewChatButton({ className }: { className?: string }) {
  const [state, action] = useActionState(createThreadAction, idle);

  return (
    <form action={action} className={className}>
      <ActionToast state={state} />
      <SubmitButton size="sm" pendingLabel="Starting…">
        <PlusIcon className="size-4" />
        New chat
      </SubmitButton>
    </form>
  );
}
