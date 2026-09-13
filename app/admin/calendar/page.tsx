import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { listBookingsBetween, listOverrides } from "@/lib/admin/data";
import { getBookingRules } from "@/lib/bookingRules";
import { addDaysToDateKey, stockholmDateKey, stockholmTime } from "@/lib/time";
import { AdminShell } from "@/components/admin/AdminShell";
import { BookingCalendar } from "@/components/admin/BookingCalendar";
import { CsvDownloadButton } from "@/components/admin/CsvDownloadButton";
import { Button } from "@/components/shadcn/button";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  await requireAdmin();

  const today = stockholmDateKey();
  // Wide enough that paging a month or a week either way never hits an empty
  // grid, and small enough to stay one query.
  const from = addDaysToDateKey(today, -90);
  const to = addDaysToDateKey(today, 180);

  const [bookings, overrides, rules] = await Promise.all([
    listBookingsBetween(from, to),
    listOverrides(from, to),
    getBookingRules(),
  ]);

  return (
    <AdminShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Blue is To do, green is Completed. Grey slots have already passed
            or are closed. Click empty open hours to select them, then confirm
            blocking. Mark Completed on the booking — it is never set
            automatically.
          </p>
          <p className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border border-blue-500/40 bg-blue-500/20" />
              To do
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border border-emerald-500/40 bg-emerald-500/20" />
              Completed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border border-border bg-zinc-900/80" />
              Passed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border border-primary/40 bg-primary/25" />
              Selected to block
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CsvDownloadButton
            filename="calendar-bookings.csv"
            rows={bookings.map((booking) => ({
              id: booking.id,
              date: booking.booking_date,
              time: booking.booking_time,
              status: booking.status,
              payment: booking.payment_status,
              name: booking.customer_name,
              email: booking.customer_email,
              phone: booking.customer_phone,
              address: booking.customer_address,
              price_ore: booking.price_ore,
            }))}
          />
          <Button asChild size="sm">
            <Link href="/admin/bookings/new">
              <PlusIcon className="size-4" />
              New booking
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <BookingCalendar
          bookings={bookings}
          overrides={overrides}
          rules={rules}
          anchorDate={today}
          anchorTime={stockholmTime()}
        />
      </div>
    </AdminShell>
  );
}
