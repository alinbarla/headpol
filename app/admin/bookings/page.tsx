import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { searchBookings } from "@/lib/admin/data";
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TONE,
  SOURCE_LABELS,
  STATUS_TONE,
} from "@/lib/admin/labels";
import { formatOre, fromDbTime } from "@/lib/booking";
import type { BookingStatus } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { BookingFilters } from "@/components/admin/BookingFilters";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const STATUS_VALUES = new Set<string>([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
  "expired",
]);

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await searchParams;

  const query = readParam(params, "q")?.trim() || undefined;
  const statusParam = readParam(params, "status");
  const status =
    statusParam && STATUS_VALUES.has(statusParam)
      ? (statusParam as BookingStatus)
      : "all";
  const page = Math.max(1, Number(readParam(params, "page") ?? "1") || 1);

  const { rows, total } = await searchBookings({
    query,
    status,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminShell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} results. Search by name, phone, email or address.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/bookings/new">
            <PlusIcon className="size-4" />
            New
          </Link>
        </Button>
      </div>

      <BookingFilters query={query ?? ""} status={status} />

      {rows.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No bookings match this search.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {rows.map((booking) => (
            <li key={booking.id}>
              <Link
                href={`/admin/bookings/${booking.id}`}
                className="flex items-center gap-3 bg-card px-4 py-3 transition-colors hover:bg-secondary/50"
              >
                <div className="w-24 shrink-0">
                  <p className="text-sm font-semibold tabular-nums">
                    {booking.booking_date}
                  </p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {fromDbTime(booking.booking_time)}
                  </p>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {booking.customer_name ?? "No name"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {booking.customer_phone ?? booking.customer_email ?? "—"}
                    {" · "}
                    {SOURCE_LABELS[booking.source]}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      STATUS_TONE[booking.status]
                    )}
                  >
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </span>
                  <span
                    className={cn(
                      "hidden rounded-full border px-2 py-0.5 text-[11px] sm:inline",
                      PAYMENT_TONE[booking.payment_status]
                    )}
                  >
                    {PAYMENT_STATUS_LABELS[booking.payment_status]} ·{" "}
                    {formatOre(booking.price_ore)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <PageLink
            page={page - 1}
            query={query}
            status={status}
            disabled={page <= 1}
          >
            Previous
          </PageLink>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <PageLink
            page={page + 1}
            query={query}
            status={status}
            disabled={page >= pageCount}
          >
            Next
          </PageLink>
        </div>
      )}
    </AdminShell>
  );
}

function PageLink({
  page,
  query,
  status,
  disabled,
  children,
}: {
  page: number;
  query?: string;
  status: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="text-sm text-muted-foreground opacity-40">
        {children}
      </span>
    );
  }

  const search = new URLSearchParams();
  if (query) search.set("q", query);
  if (status !== "all") search.set("status", status);
  search.set("page", String(page));

  return (
    <Link
      href={`/admin/bookings?${search.toString()}`}
      className="text-sm text-primary hover:underline"
    >
      {children}
    </Link>
  );
}
