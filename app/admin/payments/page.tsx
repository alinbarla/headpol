import { DownloadIcon } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { listPayments, listRefunds } from "@/lib/admin/data";
import { paymentMethodLabel } from "@/lib/admin/labels";
import { formatOre, fromDbTime } from "@/lib/booking";
import { startOfMonth, stockholmDateKey } from "@/lib/time";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/shadcn/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readDate(
  params: Record<string, string | string[] | undefined>,
  key: string,
  fallback: string
): string {
  const raw = params[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback;
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await searchParams;

  const today = stockholmDateKey();
  const from = readDate(params, "from", startOfMonth(today));
  const to = readDate(params, "to", today);

  const [payments, refunds] = await Promise.all([
    listPayments(from, to),
    listRefunds(from, to),
  ]);

  const paidOre = payments
    .filter((payment) => payment.status === "paid")
    .reduce((total, payment) => total + payment.amount_ore, 0);

  const refundedOre = refunds
    .filter((refund) => refund.status === "succeeded")
    .reduce((total, refund) => total + refund.amount_ore, 0);

  return (
    <AdminShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {from} to {to}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={`/api/admin/export?from=${from}&to=${to}`}>
            <DownloadIcon className="size-4" />
            Export CSV
          </a>
        </Button>
      </div>

      <form className="mt-4 flex flex-wrap items-end gap-2" method="get">
        <label className="text-xs text-muted-foreground">
          From
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="mt-1 block h-9 rounded-md border border-input bg-transparent px-3 text-base text-foreground md:text-sm"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          To
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="mt-1 block h-9 rounded-md border border-input bg-transparent px-3 text-base text-foreground md:text-sm"
          />
        </label>
        <Button type="submit" variant="secondary" size="sm">
          Show
        </Button>
      </form>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Received" value={formatOre(paidOre)} />
        <Stat label="Refunded" value={`−${formatOre(refundedOre)}`} />
        <Stat label="Net" value={formatOre(paidOre - refundedOre)} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  No payments in this period.
                </TableCell>
              </TableRow>
            )}
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="whitespace-nowrap tabular-nums">
                  {payment.created_at.slice(0, 10)}
                </TableCell>
                <TableCell className="max-w-40 truncate">
                  {payment.booking?.customer_name ?? "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
                  {payment.booking
                    ? `${payment.booking.booking_date} ${fromDbTime(
                        payment.booking.booking_time
                      )}`
                    : "—"}
                </TableCell>
                <TableCell>{paymentMethodLabel(payment.method)}</TableCell>
                <TableCell>{payment.status}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatOre(payment.amount_ore)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {refunds.length > 0 && (
        <>
          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Refunds
          </h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {refund.created_at.slice(0, 10)}
                    </TableCell>
                    <TableCell className="max-w-64 truncate">
                      {refund.reason ?? "—"}
                    </TableCell>
                    <TableCell>{refund.status}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      −{formatOre(refund.amount_ore)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </AdminShell>
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
