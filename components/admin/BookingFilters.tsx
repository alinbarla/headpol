"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { BOOKING_STATUS_LABELS } from "@/lib/admin/labels";
import { Input } from "@/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";

export function BookingFilters({
  query,
  status,
}: {
  query: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(query);

  // The list is server-rendered, so typing debounces into a URL change rather
  // than filtering locally.
  useEffect(() => {
    if (value === query) return;

    const timer = setTimeout(() => {
      const search = new URLSearchParams();
      if (value.trim()) search.set("q", value.trim());
      if (status !== "all") search.set("status", status);
      router.replace(`/admin/bookings?${search.toString()}`);
    }, 350);

    return () => clearTimeout(timer);
  }, [value, query, status, router]);

  function changeStatus(next: string) {
    const search = new URLSearchParams();
    if (value.trim()) search.set("q", value.trim());
    if (next !== "all") search.set("status", next);
    router.replace(`/admin/bookings?${search.toString()}`);
  }

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search name, phone, email or address"
          className="pl-9"
          type="search"
          inputMode="search"
        />
      </div>

      <Select value={status} onValueChange={changeStatus}>
        <SelectTrigger className="sm:w-52">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {Object.entries(BOOKING_STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
