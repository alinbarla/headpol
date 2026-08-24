import Link from "next/link";
import { AlertTriangleIcon, PlusIcon } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getDashboardData } from "@/lib/admin/data";
import { formatOre } from "@/lib/booking";
import { formatDateKey } from "@/lib/time";
import { AdminShell } from "@/components/admin/AdminShell";
import { BookingCard } from "@/components/admin/BookingCard";
import { Button } from "@/components/shadcn/button";

export const dynamic = "force-dynamic";

export default async function AdminTodayPage() {
  await requireAdmin();
  const data = await getDashboardData();

  return (
    <AdminShell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Idag</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateKey(data.today, "sv")}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/bookings/new">
            <PlusIcon className="size-4" />
            Ny bokning
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Jobb idag" value={String(data.todayBookings.length)} />
        <Stat label="Imorgon" value={String(data.tomorrowBookings.length)} />
        <Stat label="Betalt 7 dagar" value={formatOre(data.weekRevenueOre)} />
        <Stat label="Betalt denna månad" value={formatOre(data.monthRevenueOre)} />
      </div>

      {data.needsAttention.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-300">
            <AlertTriangleIcon className="size-4" />
            Behöver åtgärd
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Bokningar som fortfarande är obekräftade trots att datumet passerat.
          </p>
          <div className="mt-3 space-y-3">
            {data.needsAttention.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}

      <DaySection
        title="Dagens jobb"
        emptyLabel="Inga bokningar idag."
        bookings={data.todayBookings}
      />

      <DaySection
        title={`Imorgon · ${formatDateKey(data.tomorrow, "sv")}`}
        emptyLabel="Inga bokningar imorgon."
        bookings={data.tomorrowBookings}
      />
    </AdminShell>
  );
}

function DaySection({
  title,
  emptyLabel,
  bookings,
}: {
  title: string;
  emptyLabel: string;
  bookings: Awaited<ReturnType<typeof getDashboardData>>["todayBookings"];
}) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {bookings.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}
