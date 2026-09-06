import { requireAdmin } from "@/lib/admin/auth";
import { listDroppedVisitors } from "@/lib/analytics/droppedVisitors";
import { AdminShell } from "@/components/admin/AdminShell";
import { DroppedVisitorTable } from "@/components/admin/DroppedVisitorTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";

export const dynamic = "force-dynamic";

export default async function MailListPage() {
  await requireAdmin();

  let leads: Awaited<ReturnType<typeof listDroppedVisitors>> = [];
  let syncError: string | null = null;
  try {
    leads = await listDroppedVisitors();
  } catch (error) {
    syncError = error instanceof Error ? error.message : "Could not load the mail list";
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold">Mail list</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Visitors who typed an email in the booking form and have no matching
        booking. The list updates automatically from heatmap form input.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">
            Dropped visitors{leads.length > 0 ? ` (${leads.length})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {syncError ? (
            <p className="text-sm text-destructive">{syncError}</p>
          ) : (
            <DroppedVisitorTable leads={leads} />
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
