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
        Alla bokningar
      </Link>

      <h1 className="mt-4 text-2xl font-bold">Ny bokning</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        För bokningar som kommer in via telefon eller på plats. Tiden bekräftas
        direkt.
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
