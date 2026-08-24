import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { listBookingsBetween, listOverrides } from "@/lib/admin/data";
import { getBookingRules } from "@/lib/bookingRules";
import { addDaysToDateKey, stockholmDateKey } from "@/lib/time";
import { AdminShell } from "@/components/admin/AdminShell";
import { BookingCalendar } from "@/components/admin/BookingCalendar";
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
          <h1 className="text-2xl font-bold">Kalender</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dra en bokning till en ny ruta för att flytta den. Grå rutor är
            stängda.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/bookings/new">
            <PlusIcon className="size-4" />
            Ny bokning
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        <BookingCalendar
          bookings={bookings}
          overrides={overrides}
          rules={rules}
          anchorDate={today}
        />
      </div>
    </AdminShell>
  );
}
