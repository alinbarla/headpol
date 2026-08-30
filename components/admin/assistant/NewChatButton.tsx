import { PlusIcon } from "lucide-react";
import { createThreadAction } from "@/app/admin/assistant/actions";
import { SubmitButton } from "@/components/admin/SubmitButton";

export function NewChatButton({ className }: { className?: string }) {
  return (
    <form action={createThreadAction} className={className}>
      <SubmitButton size="sm" pendingLabel="Starting…">
        <PlusIcon className="size-4" />
        New chat
      </SubmitButton>
    </form>
  );
}
