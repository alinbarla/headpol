import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { loadReplay } from "@/lib/analytics/replay";
import { SITE_URL } from "@/lib/seo";
import { formatTimestamp } from "@/lib/time";
import { AdminShell } from "@/components/admin/AdminShell";
import { HeatmapDesktopOnly } from "@/components/admin/heatmap/HeatmapDesktopOnly";
import { ReplayPlayer } from "@/components/admin/heatmap/ReplayPlayer";
import { Button } from "@/components/shadcn/button";

export const dynamic = "force-dynamic";

export default async function HeatmapSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const replay = await loadReplay(id).catch(() => null);
  if (!replay) notFound();

  const { session, events } = replay;

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Session replay</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.page} · {session.ip ?? "no IP"} · {session.device} ·{" "}
            {formatTimestamp(session.started_at)}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
          <Link href="/admin/heatmap">Back to heatmap</Link>
        </Button>
      </div>

      <HeatmapDesktopOnly body="Open session replay on a computer. It is hidden on phones to keep the browser stable.">
        <div className="mt-6">
          <ReplayPlayer siteUrl={SITE_URL} session={session} events={events} />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Event-stream replay. Form text typed on the public site is shown below
          and filled into the preview. Password and payment fields are not stored.
          {events.length === 0 ? " This session has no events yet." : ""}
        </p>
      </HeatmapDesktopOnly>
    </AdminShell>
  );
}
