import Link from "next/link";
import { formatTimestamp } from "@/lib/time";
import type { AnalyticsSession } from "@/lib/analytics/types";

export function SessionTable({ sessions }: { sessions: AnalyticsSession[] }) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No sessions in this range.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr className="border-b border-border">
            <th className="py-2 pr-3 font-medium">Started</th>
            <th className="py-2 pr-3 font-medium">Page</th>
            <th className="py-2 pr-3 font-medium">IP</th>
            <th className="py-2 pr-3 font-medium">Device</th>
            <th className="py-2 pr-3 font-medium">Events</th>
            <th className="py-2 pr-3 font-medium">Max scroll</th>
            <th className="py-2 font-medium">Replay</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className="border-b border-border last:border-0">
              <td className="py-2 pr-3 text-muted-foreground">
                {formatTimestamp(session.started_at)}
              </td>
              <td className="py-2 pr-3 font-mono text-xs">{session.page}</td>
              <td className="py-2 pr-3 font-mono text-xs">{session.ip ?? "—"}</td>
              <td className="py-2 pr-3 capitalize">{session.device}</td>
              <td className="py-2 pr-3">{session.event_count}</td>
              <td className="py-2 pr-3">{Math.round(Number(session.max_scroll_pct))}%</td>
              <td className="py-2">
                <Link
                  href={`/admin/heatmap/sessions/${session.id}`}
                  className="text-primary hover:underline"
                >
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
