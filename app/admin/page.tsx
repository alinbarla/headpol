import Link from "next/link";
import { AlertTriangleIcon, PlusIcon } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getDashboardData } from "@/lib/admin/data";
import { ADMIN_LOCALE } from "@/lib/admin/labels";
import { formatOre } from "@/lib/booking";
import { settleOpenPaymentsForBooking } from "@/lib/settleStripePayment";
import { getStripeWebhookStatus, isStripeConfigured } from "@/lib/stripe";
import { formatDateKey } from "@/lib/time";
import { AdminShell } from "@/components/admin/AdminShell";
import { BookingCard } from "@/components/admin/BookingCard";
import { StripeBalanceCard } from "@/components/admin/StripeBalanceCard";
import { Button } from "@/components/shadcn/button";

export const dynamic = "force-dynamic";

export default async function AdminTodayPage() {
  await requireAdmin();
  let data = await getDashboardData();
  const webhookStatus = isStripeConfigured()
    ? await getStripeWebhookStatus()
    : null;

  if (isStripeConfigured()) {
    const unpaidIds = [
      ...new Set(
        [...data.todayBookings, ...data.tomorrowBookings, ...data.needsAttention]
          .filter(
            (booking) =>
              booking.payment_status === "awaiting_payment" ||
              booking.payment_status === "unpaid"
          )
          .map((booking) => booking.id)
      ),
    ];

    if (unpaidIds.length > 0) {
      await Promise.all(unpaidIds.map((id) => settleOpenPaymentsForBooking(id)));
      data = await getDashboardData();
    }
  }

  return (
    <AdminShell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateKey(data.today, ADMIN_LOCALE)}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/bookings/new">
            <PlusIcon className="size-4" />
            New booking
          </Link>
        </Button>
      </div>

      {webhookStatus && !webhookStatus.healthy && (
        <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <p className="font-medium">Stripe webhook needs repair</p>
          <p className="mt-1 text-amber-100/80">{webhookStatus.message}</p>
          <Link
            href="/admin/settings"
            className="mt-2 inline-block text-amber-50 underline underline-offset-2"
          >
            Open Settings to repair
          </Link>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Jobs today" value={String(data.todayBookings.length)} />
        <Stat label="Tomorrow" value={String(data.tomorrowBookings.length)} />
        <Stat label="Paid this week" value={formatOre(data.weekRevenueOre)} />
        <Stat label="Paid this month" value={formatOre(data.monthRevenueOre)} />
        <StripeBalanceCard />
      </div>

      {data.needsAttention.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-300">
            <AlertTriangleIcon className="size-4" />
            Needs attention
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Bookings still unconfirmed even though the date has passed.
          </p>
          <div className="mt-3 space-y-3">
            {data.needsAttention.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}

      <DaySection
        title="Today's jobs"
        emptyLabel="No bookings today."
        bookings={data.todayBookings}
      />

      <DaySection
        title={`Tomorrow · ${formatDateKey(data.tomorrow, ADMIN_LOCALE)}`}
        emptyLabel="No bookings tomorrow."
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
