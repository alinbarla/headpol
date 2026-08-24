"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import type { ActionState } from "@/app/admin/actions";
import { Button } from "@/components/shadcn/button";

type ButtonProps = React.ComponentProps<typeof Button>;

export function SubmitButton({
  children,
  pendingLabel = "Sparar…",
  ...props
}: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}

/**
 * Surfaces an action result as a toast. Server actions return plain objects
 * rather than throwing, so without this the user gets no feedback at all.
 */
export function ActionToast({ state }: { state: ActionState }) {
  const lastShown = useRef<string | null>(null);

  useEffect(() => {
    if (!state.message) return;

    // useActionState keeps the same object across re-renders, so a repeated
    // message would otherwise fire a toast on every render.
    const fingerprint = `${state.ok}:${state.message}`;
    if (lastShown.current === fingerprint) return;
    lastShown.current = fingerprint;

    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return null;
}
