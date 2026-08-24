import { requireAdmin } from "@/lib/admin/auth";
import { listRecentAudit } from "@/lib/admin/data";
import { getBookingRules } from "@/lib/bookingRules";
import { isStripeConfigured } from "@/lib/stripe";
import { AdminShell } from "@/components/admin/AdminShell";
import { RulesForm } from "@/components/admin/RulesForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();

  const [rules, audit] = await Promise.all([
    getBookingRules(),
    listRecentAudit(40),
  ]);

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold">Inställningar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Öppettider och pris gäller nya bokningar direkt, utan ny driftsättning.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <div className="space-y-6">
          <RulesForm rules={rules} />

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Integrationer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <StatusRow
                label="Stripe"
                ok={isStripeConfigured()}
                okLabel="Aktiverat"
                offLabel="STRIPE_SECRET_KEY saknas"
              />
              <StatusRow
                label="E-post"
                ok={Boolean(process.env.GMAIL_APP_PASSWORD)}
                okLabel="Aktiverat"
                offLabel="GMAIL_APP_PASSWORD saknas"
              />
              <StatusRow
                label="Cron"
                ok={Boolean(process.env.CRON_SECRET)}
                okLabel="Aktiverat"
                offLabel="CRON_SECRET saknas"
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Händelselogg</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-muted-foreground">
              PIN-koden är delad, så loggen visar vad som gjorts men inte av
              vem.
            </p>
            {audit.length === 0 ? (
              <p className="text-sm text-muted-foreground">Inget loggat ännu.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {audit.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-wrap justify-between gap-2 border-b border-border pb-1.5 last:border-0"
                  >
                    <span className="font-mono text-xs">{entry.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleString("sv-SE")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

function StatusRow({
  label,
  ok,
  okLabel,
  offLabel,
}: {
  label: string;
  ok: boolean;
  okLabel: string;
  offLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          ok
            ? "rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200"
            : "rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-200"
        }
      >
        {ok ? okLabel : offLabel}
      </span>
    </div>
  );
}
