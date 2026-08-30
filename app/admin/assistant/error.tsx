"use client";

import { useEffect } from "react";
import { Button } from "@/components/shadcn/button";

export default function AssistantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[assistant] page error", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-xl font-bold">Assistant could not load</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The chat tables may still be warming up. Reload, or try New chat again.
      </p>
      <Button className="mt-6" onClick={reset}>
        Reload
      </Button>
    </div>
  );
}
