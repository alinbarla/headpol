import { logAdminAction, isAuthenticated } from "@/lib/admin/auth";
import { listPayments, listRefunds } from "@/lib/admin/data";
import { fromDbTime } from "@/lib/booking";
import { paymentMethodLabel } from "@/lib/admin/labels";
import { addDaysToDateKey, stockholmDateKey } from "@/lib/time";

export const runtime = "nodejs";

/**
 * The accountant's export. A route handler rather than a server action
 * because it streams a file download.
 *
 * Bokföringslagen requires seven years of retention, so nothing here is ever
 * deleted; the export simply slices a date range out of the ledger.
 */
export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const today = stockholmDateKey();
  const from = readDate(searchParams.get("from"), addDaysToDateKey(today, -30));
  const to = readDate(searchParams.get("to"), today);

  const [payments, refunds] = await Promise.all([
    listPayments(from, to),
    listRefunds(from, to),
  ]);

  const rows: string[][] = [
    [
      "type",
      "date",
      "booking_date",
      "booking_time",
      "customer",
      "email",
      "method",
      "status",
      "amount_ore",
      "amount_sek",
      "vat_ore",
      "stripe_id",
      "reason",
    ],
  ];

  for (const payment of payments) {
    rows.push([
      "payment",
      payment.created_at.slice(0, 10),
      payment.booking?.booking_date ?? "",
      payment.booking ? fromDbTime(payment.booking.booking_time) : "",
      payment.booking?.customer_name ?? "",
      payment.booking?.customer_email ?? "",
      paymentMethodLabel(payment.method),
      payment.status,
      String(payment.amount_ore),
      (payment.amount_ore / 100).toFixed(2),
      // 25% moms on a VAT-inclusive price is 20% of the gross.
      String(Math.round(payment.amount_ore * 0.2)),
      payment.stripe_payment_intent_id ?? payment.stripe_checkout_session_id ?? "",
      "",
    ]);
  }

  for (const refund of refunds) {
    rows.push([
      "refund",
      refund.created_at.slice(0, 10),
      "",
      "",
      "",
      "",
      "",
      refund.status,
      String(-refund.amount_ore),
      (-refund.amount_ore / 100).toFixed(2),
      String(-Math.round(refund.amount_ore * 0.2)),
      refund.stripe_refund_id ?? "",
      refund.reason ?? "",
    ]);
  }

  await logAdminAction("payments.export", {
    entityType: "payments",
    details: { from, to, rows: rows.length - 1 },
  });

  // Excel in a Swedish locale expects semicolons, and the BOM keeps åäö intact.
  const csv = rows.map((row) => row.map(escapeCsv).join(";")).join("\r\n");

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="payments-${from}-${to}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

function escapeCsv(value: string): string {
  if (!/[";\r\n]/.test(value)) return value;
  return `"${value.replaceAll('"', '""')}"`;
}

function readDate(value: string | null, fallback: string): string {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback;
}
