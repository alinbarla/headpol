import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getBookingRules } from "@/lib/bookingRules";
import { isStripeConfigured } from "@/lib/stripe";
import { stockholmDateKey } from "@/lib/time";
import { AdminShell } from "@/components/admin/AdminShell";
import { NewBookingForm } from "@/components/admin/NewBookingForm";

export const dynamic = "force-dynamic";

export default async function NewBookingPage() {
  await requireAdmin();
  const rules = await getBookingRules();

  return (
    <AdminShell>
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        All bookings
      </Link>

      <h1 className="mt-4 text-2xl font-bold">New booking</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        For bookings taken by phone or in person. The slot is confirmed
        immediately.
      </p>

      <div className="mt-6 max-w-xl">
        <NewBookingForm
          defaultDate={stockholmDateKey()}
          defaultPriceOre={rules.priceOre}
          defaultTime={`${String(rules.startHour).padStart(2, "0")}:00`}
          stripeEnabled={isStripeConfigured()}
        />
      </div>
    </AdminShell>
  );
}
