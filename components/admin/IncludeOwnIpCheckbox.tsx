"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Label } from "@/components/shadcn/label";
import { EXCLUDED_VIEWER_IPS } from "@/lib/analytics/constants";
import { cn } from "@/lib/utils";

/**
 * Toggle whether sessions from EXCLUDED_VIEWER_IPS appear in Visitors / Heatmap.
 * Default is off (excluded). Persists via the `includeMine` search param.
 */
export function IncludeOwnIpCheckbox({
  checked,
  className,
}: {
  checked: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const ipLabel = EXCLUDED_VIEWER_IPS.join(", ");

  function onChange(next: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("includeMine", "1");
    else params.delete("includeMine");
    // Reset visitors pagination (numeric `page`) when toggling. Heatmap uses
    // `page` for the tracked path — leave those alone.
    const pageValue = params.get("page");
    if (pageValue && /^\d+$/.test(pageValue)) {
      params.delete("page");
    }
    startTransition(() => {
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  return (
    <Label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-normal text-muted-foreground",
        pending && "opacity-60",
        className
      )}
    >
      <input
        type="checkbox"
        className="size-4 accent-primary"
        checked={checked}
        disabled={pending}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={`Include my IP (${ipLabel})`}
      />
      <span>
        Include my IP
        <span className="ml-1 font-mono text-[10px] opacity-70">({ipLabel})</span>
      </span>
    </Label>
  );
}
