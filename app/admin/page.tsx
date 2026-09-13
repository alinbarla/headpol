import Link from "next/link";
import { AlertTriangleIcon, PlusIcon } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getDashboardData } from "@/lib/admin/data";
import { getAcquisitionFunnel } from "@/lib/admin/funnel";
import { engagementStrength } from "@/lib/admin/recordsRows";
import { ADMIN_LOCALE } from "@/lib/admin/labels";
import { listRecentSessions } from "@/lib/analytics/store";
import { formatOre } from "@/lib/booking";
import { describeLocation } from "@/lib/geo";
import { settleOpenPaymentsForBooking } from "@/lib/settleStripePayment";
import { getStripeWebhookStatus, isStripeConfigured } from "@/lib/stripe";
import { formatDateKey } from "@/lib/time";
import { AcquisitionFunnelCard } from "@/components/admin/AcquisitionFunnelCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { BookingCard } from "@/components/admin/BookingCard";
import { CsvDownloadButton } from "@/components/admin/CsvDownloadButton";
import { DashboardInsights } from "@/components/admin/DashboardInsights";
import { StripeBalanceCard } from "@/components/admin/StripeBalanceCard";
import { Button } from "@/components/shadcn/button";
import { StatsBento } from "@/components/ui/stats-bento";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminTodayPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await searchParams;
  const insightRaw = Array.isArray(params.insight) ? params.insight[0] : params.insight;
  const insightDays: 7 | 30 = insightRaw === "7" ? 7 : 30;
  let data = await getDashboardData();
  const funnel = await getAcquisitionFunnel(insightDays);
  const insightSessions = await listRecentSessions({
    fromIso: new Date(Date.now() - insightDays * 86_400_000).toISOString(),
    device: "all",
    limit: 400,
  }).catch(() => []);
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


  const sessions = funnel.totals.sessions;
  const paidCount = funnel.totals.paidCount;
  const paidRate =
    sessions > 0 ? Math.round((paidCount / sessions) * 100) : null;
  const channelBars = (() => {
    const values = funnel.byChannel.map((row) => row.sessions);
    const max = Math.max(1, ...values);
    const bars = values.map((value) => Math.round((value / max) * 100));
    // Keep the sparkline visually dense even with few channels.
    while (bars.length < 8) {
      bars.push(8 + ((bars.length * 17) % 40));
    }
    return bars.slice(0, 12);
  })();
  const topChannel = funnel.byChannel[0];

  return (
    <AdminShell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateKey(data.today, ADMIN_LOCALE)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CsvDownloadButton
            filename="today-bookings.csv"
            rows={[...data.todayBookings, ...data.tomorrowBookings, ...data.needsAttention].map(
              (booking) => ({
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
                source: booking.source,
              })
            )}
            label="Download CSV"
          />
          <Button asChild size="sm">
            <Link href="/admin/bookings/new">
              <PlusIcon className="size-4" />
              New booking
            </Link>
          </Button>
        </div>
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

      <div className="mt-6 space-y-4">
        <StatsBento
          primary={{
            eyebrow: "Paid this month",
            value: formatOre(data.monthRevenueOre),
            description: topChannel
              ? `${funnel.totals.sessions.toLocaleString()} sessions in ${funnel.days}d · top channel ${topChannel.label}`
              : `Last ${funnel.days} days of traffic and paid bookings.`,
            href: "/admin/payments",
          }}
          growth={{
            label: "Paid this week",
            value: formatOre(data.weekRevenueOre),
            bars: channelBars,
            href: "/admin/visitors",
          }}
          spotlight={{
            value: String(data.todayBookings.length),
            label: data.todayBookings.length === 1 ? "Job today" : "Jobs today",
            href: "/admin/bookings",
          }}
          highlight={{
            value:
              paidRate != null
                ? `${paidRate}%`
                : data.needsAttention.length > 0
                  ? String(data.needsAttention.length)
                  : "—",
            label:
              paidRate != null
                ? `Paid / session · ${funnel.days}d`
                : data.needsAttention.length > 0
                  ? "Needs attention"
                  : "Tomorrow " + String(data.tomorrowBookings.length),
            href:
              paidRate != null
                ? "/admin/visitors"
                : data.needsAttention.length > 0
                  ? "/admin/bookings?status=pending"
                  : "/admin/calendar",
          }}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-md">
          <StripeBalanceCard />
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Tomorrow</p>
            <p className="mt-1 text-lg font-bold tabular-nums">
              {data.tomorrowBookings.length}
            </p>
          </div>
        </div>
      </div>

      <DashboardInsights
        days={insightDays}
        funnel={funnel}
        devices={insightSessions.reduce(
          (acc, session) => {
            acc[session.device] += 1;
            return acc;
          },
          { mobile: 0, tablet: 0, desktop: 0 }
        )}
        quality={insightSessions.reduce(
          (acc, session) => {
            const strength = engagementStrength(
              session.event_count,
              Number(session.max_scroll_pct)
            );
            if (strength === "strong") acc.deep += 1;
            else if (strength === "weak") acc.active += 1;
            else if (strength === "veryweak") acc.light += 1;
            else acc.beacon += 1;
            return acc;
          },
          { deep: 0, active: 0, light: 0, beacon: 0 }
        )}
        people={insightSessions
          .filter(
            (session, index, all) =>
              all.findIndex((row) => row.visitor_id === session.visitor_id) ===
              index
          )
          .slice(0, 4)
          .map((session) => ({
            id: session.visitor_id,
            name: describeLocation(session) ?? session.device,
          }))}
        uniqueVisitors={
          new Set(insightSessions.map((session) => session.visitor_id)).size
        }
      />

      <div className="mt-6">
        <AcquisitionFunnelCard data={funnel} />
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

