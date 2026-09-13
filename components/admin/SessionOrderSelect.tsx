"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {
  SESSION_LIST_ORDER_LABELS,
  SESSION_LIST_ORDERS,
  type SessionListOrder,
} from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

/**
 * Shared Order-by control for Visitors and Heatmap session lists.
 * Default is newest → oldest. Persists via the `order` search param.
 */
export function SessionOrderSelect({
  value,
  className,
  /** Heatmap keeps `page` as a path; visitors uses numeric pagination. */
  resetPageOnChange = false,
}: {
  value: SessionListOrder;
  className?: string;
  resetPageOnChange?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "newest") params.delete("order");
    else params.set("order", next);
    if (resetPageOnChange) {
      const pageValue = params.get("page");
      if (pageValue && /^\d+$/.test(pageValue)) params.delete("page");
    }
    startTransition(() => {
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 text-xs text-muted-foreground",
        pending && "opacity-60",
        className
      )}
    >
      <span className="font-medium text-foreground">Order by</span>
      <Select value={value} onValueChange={onChange} disabled={pending}>
        <SelectTrigger className="h-8 w-40" aria-label="Order list by">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SESSION_LIST_ORDERS.map((order) => (
            <SelectItem key={order} value={order}>
              {SESSION_LIST_ORDER_LABELS[order]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
