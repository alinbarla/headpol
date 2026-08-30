import { requireAdmin } from "@/lib/admin/auth";
import { listRecentAudit } from "@/lib/admin/data";
import { getBookingRules } from "@/lib/bookingRules";
import { isDataForSeoConfigured } from "@/lib/seo/providers/dataforseo";
import { isStripeConfigured } from "@/lib/stripe";
import { formatTimestamp } from "@/lib/time";
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
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Opening hours and price apply to new bookings immediately, with no
        redeploy.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <div className="space-y-6">
          <RulesForm rules={rules} />

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <StatusRow
                label="Stripe"
                ok={isStripeConfigured()}
                okLabel="Enabled"
                offLabel="STRIPE_SECRET_KEY missing or not an sk_/rk_ token"
              />
              <StatusRow
                label="Email"
                ok={Boolean(process.env.GMAIL_APP_PASSWORD)}
                okLabel="Enabled"
                offLabel="GMAIL_APP_PASSWORD missing"
              />
              <StatusRow
                label="Cron"
                ok={Boolean(process.env.CRON_SECRET)}
                okLabel="Enabled"
                offLabel="CRON_SECRET missing"
              />
              <StatusRow
                label="DataForSEO"
                ok={isDataForSeoConfigured()}
                okLabel="Enabled"
                offLabel="DATAFORSEO_LOGIN / PASSWORD missing"
              />
              <StatusRow
                label="SEO schedule"
                ok={Boolean(process.env.CRON_SECRET)}
                okLabel="Route ready — schedule via Supabase pg_cron"
                offLabel="CRON_SECRET missing; /api/cron/seo will refuse"
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Activity log</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-muted-foreground">
              The PIN is shared, so the log shows what was done but not by
              whom.
            </p>
            {audit.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing logged yet.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {audit.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-wrap justify-between gap-2 border-b border-border pb-1.5 last:border-0"
                  >
                    <span className="font-mono text-xs">{entry.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(entry.created_at)}
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
