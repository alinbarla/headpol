"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { deleteSessionsAction } from "@/app/admin/heatmap/actions";
import { ActionToast, SubmitButton } from "@/components/admin/SubmitButton";
import { Button } from "@/components/shadcn/button";
import type { AnalyticsSession } from "@/lib/analytics/types";
import { describeLocation } from "@/lib/geo";
import { formatTimestamp } from "@/lib/time";

const initial: ActionState = { ok: true };

export function SessionTable({ sessions }: { sessions: AnalyticsSession[] }) {
  const [state, formAction] = useActionState(deleteSessionsAction, initial);
  const [selected, setSelected] = useState<string[]>([]);

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No sessions in this range.</p>
    );
  }

  const visibleIds = sessions.map((session) => session.id);
  const allSelected = visibleIds.every((id) => selected.includes(id));

  function toggle(id: string, on: boolean) {
    setSelected((current) =>
      on ? [...new Set([...current, id])] : current.filter((item) => item !== id)
    );
  }

  function toggleAll(on: boolean) {
    setSelected(on ? visibleIds : []);
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (selected.length === 0) {
          event.preventDefault();
          return;
        }
        const label =
          selected.length === 1
            ? "Delete this recording permanently?"
            : `Delete ${selected.length} recordings permanently?`;
        if (!window.confirm(`${label} This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <ActionToast state={state} />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {selected.map((id) => (
          <input key={id} type="hidden" name="ids" value={id} />
        ))}
        <SubmitButton
          variant="destructive"
          size="sm"
          disabled={selected.length === 0}
          pendingLabel="Deleting…"
        >
          Delete permanently
          {selected.length > 0 ? ` (${selected.length})` : ""}
        </SubmitButton>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => toggleAll(!allSelected)}
        >
          {allSelected ? "Clear selection" : "Select all"}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-2 pr-3 font-medium">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => toggleAll(event.target.checked)}
                  aria-label="Select all recordings"
                />
              </th>
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
                <td className="py-2 pr-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(session.id)}
                    onChange={(event) => toggle(session.id, event.target.checked)}
                    aria-label={`Select recording from ${formatTimestamp(session.started_at)}`}
                  />
                </td>
                <td className="py-2 pr-3 text-muted-foreground">
                  {formatTimestamp(session.started_at)}
                </td>
                <td className="py-2 pr-3 font-mono text-xs">{session.page}</td>
                <td className="py-2 pr-3 font-mono text-xs">
                  <div>{session.ip ?? "—"}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {describeLocation(session) ?? "—"}
                    {Number.isFinite(session.latitude) &&
                    Number.isFinite(session.longitude) ? (
                      <>
                        {" "}
                        <a
                          href={`https://www.google.com/maps?q=${session.latitude},${session.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline decoration-dotted underline-offset-2 hover:text-foreground"
                        >
                          karta
                        </a>
                      </>
                    ) : null}
                  </div>
                </td>
                <td className="py-2 pr-3 capitalize">{session.device}</td>
                <td className="py-2 pr-3">{session.event_count}</td>
                <td className="py-2 pr-3">
                  {Math.round(Number(session.max_scroll_pct))}%
                </td>
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
    </form>
  );
}
