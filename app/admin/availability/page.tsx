import { requireAdmin } from "@/lib/admin/auth";
import { listOverrides } from "@/lib/admin/data";
import { getBookingRules } from "@/lib/bookingRules";
import { addDaysToDateKey, stockholmDateKey } from "@/lib/time";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  OverrideForm,
  OverrideList,
} from "@/components/admin/AvailabilityForms";
import { WEEKDAY_LABELS, WEEKDAY_ORDER } from "@/lib/admin/labels";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  await requireAdmin();

  const today = stockholmDateKey();
  const [rules, overrides] = await Promise.all([
    getBookingRules(),
    // Show a little history so a mistake made yesterday is still visible.
    listOverrides(addDaysToDateKey(today, -14), addDaysToDateKey(today, 365)),
  ]);

  const openDays = WEEKDAY_ORDER.filter((day) => rules.weekdays.includes(day))
    .map((day) => WEEKDAY_LABELS[day])
    .join(", ");

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold">Availability</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Regular opening hours: {openDays || "no days"}. Weekdays{" "}
        {String(rules.startHour).padStart(2, "0")}:00–
        {String(rules.endHour).padStart(2, "0")}:00. Sunday{" "}
        {String(rules.sundayStartHour).padStart(2, "0")}:00–
        {String(rules.sundayEndHour).padStart(2, "0")}:00. Change them under
        Settings.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
        <OverrideForm
          defaultDate={today}
          defaultStart={`${String(rules.startHour).padStart(2, "0")}:00`}
          defaultEnd={`${String(rules.endHour).padStart(2, "0")}:00`}
        />
        <OverrideList overrides={overrides} today={today} />
      </div>
    </AdminShell>
  );
}
