import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import type {
  AcquisitionFunnelData,
  FunnelMetrics,
} from "@/lib/admin/funnel";
import { formatOre } from "@/lib/booking";

function rate(numerator: number, denominator: number): string {
  if (denominator <= 0) return "—";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function MetricsCells({ metrics }: { metrics: FunnelMetrics }) {
  return (
    <>
      <td className="px-3 py-2 text-right tabular-nums">{metrics.sessions}</td>
      <td className="px-3 py-2 text-right tabular-nums">
        {metrics.bookingsStarted}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">{metrics.paidCount}</td>
      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
        {rate(metrics.paidCount, metrics.bookingsStarted)}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {metrics.revenueOre > 0 ? formatOre(metrics.revenueOre) : "—"}
      </td>
    </>
  );
}

function FunnelTableHead() {
  return (
    <thead>
      <tr className="border-b border-border text-left text-xs text-muted-foreground">
        <th className="px-3 py-2 font-medium">Channel</th>
        <th className="px-3 py-2 text-right font-medium">Sessions</th>
        <th className="px-3 py-2 text-right font-medium">Bookings</th>
        <th className="px-3 py-2 text-right font-medium">Paid</th>
        <th className="px-3 py-2 text-right font-medium">Paid/Book</th>
        <th className="px-3 py-2 text-right font-medium">Revenue</th>
      </tr>
    </thead>
  );
}

export function AcquisitionFunnelCard({
  data,
}: {
  data: AcquisitionFunnelData;
}) {
  const empty =
    data.byChannel.length === 0 &&
    data.totals.sessions === 0 &&
    data.totals.bookingsStarted === 0 &&
    data.totals.paidCount === 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">
          Acquisition funnel · last {data.days} days
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Sessions → web bookings → paid, by traffic channel. Cohort counts (not
          person-matched).
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {empty ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No funnel data yet. Enable visit collection and wait for traffic,
            bookings, or paid checkouts — and apply the{" "}
            <code className="text-xs">acquisition_funnel_daily</code> migration
            if this stays empty after that.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[36rem] text-sm">
                <FunnelTableHead />
                <tbody>
                  {data.byChannel.map((row) => (
                    <tr
                      key={row.channel}
                      className="border-b border-border/70 last:border-0"
                    >
                      <td className="px-3 py-2 font-medium">{row.label}</td>
                      <MetricsCells metrics={row} />
                    </tr>
                  ))}
                  <tr className="bg-muted/30 font-medium">
                    <td className="px-3 py-2">Total</td>
                    <MetricsCells metrics={data.totals} />
                  </tr>
                </tbody>
              </table>
            </div>

            {data.byReferrer.length > 0 ? (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Top referrers
                </h3>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[36rem] text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Host</th>
                        <th className="px-3 py-2 font-medium">Channel</th>
                        <th className="px-3 py-2 text-right font-medium">
                          Sessions
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Bookings
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Paid
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Paid/Book
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byReferrer.map((row) => (
                        <tr
                          key={`${row.channel}:${row.referrerHost}`}
                          className="border-b border-border/70 last:border-0"
                        >
                          <td className="px-3 py-2 font-mono text-xs">
                            {row.referrerHost}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {row.channelLabel}
                          </td>
                          <MetricsCells metrics={row} />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
