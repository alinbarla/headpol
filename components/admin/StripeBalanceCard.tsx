import { formatOre } from "@/lib/booking";
import { getStripeBalance, isStripeConfigured } from "@/lib/stripe";

function formatBucket(amount: number, currency: string): string {
  if (currency.toLowerCase() === "sek") return formatOre(amount);
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export async function StripeBalanceCard() {
  if (!isStripeConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-3">
        <p className="text-xs text-muted-foreground">Stripe balance</p>
        <p className="mt-1 text-sm text-muted-foreground">Not configured</p>
      </div>
    );
  }

  try {
    const balance = await getStripeBalance();
    if (!balance) {
      return (
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">Stripe balance</p>
          <p className="mt-1 text-sm text-muted-foreground">Unavailable</p>
        </div>
      );
    }

    const available = balance.available[0];
    const pending = balance.pending[0];

    return (
      <div className="rounded-xl border border-border bg-card p-3">
        <p className="text-xs text-muted-foreground">Stripe balance</p>
        <p className="mt-1 text-lg font-bold tabular-nums">
          {available
            ? formatBucket(available.amount, available.currency)
            : "0 kr"}
        </p>
        {pending && pending.amount > 0 ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatBucket(pending.amount, pending.currency)} pending
          </p>
        ) : null}
      </div>
    );
  } catch {
    return (
      <div className="rounded-xl border border-border bg-card p-3">
        <p className="text-xs text-muted-foreground">Stripe balance</p>
        <p className="mt-1 text-sm text-muted-foreground">Could not load</p>
      </div>
    );
  }
}
