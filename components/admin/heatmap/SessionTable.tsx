"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { deleteSessionsAction } from "@/app/admin/heatmap/actions";
import { CsvDownloadButton } from "@/components/admin/CsvDownloadButton";
import { ActionToast, SubmitButton } from "@/components/admin/SubmitButton";
import { Button } from "@/components/shadcn/button";
import RecordsTable from "@/components/ui/records-table";
import type { AnalyticsSession } from "@/lib/analytics/types";
import {
  SESSION_STRENGTH_LABELS,
  sessionCsvRows,
  sessionToRecord,
} from "@/lib/admin/recordsRows";

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
          onClick={() => setSelected(allSelected ? [] : visibleIds)}
        >
          {allSelected ? "Clear selection" : "Select all"}
        </Button>
        <CsvDownloadButton filename="heatmap-sessions.csv" rows={sessionCsvRows(sessions)} />
      </div>

      <RecordsTable
        rows={sessions.map(sessionToRecord)}
        nameLabel="Page"
        categoriesLabel="Device & place"
        lastLabel="Started"
        strengthLabel="Session depth"
        linksLabel="Replay"
        strengthLabels={SESSION_STRENGTH_LABELS}
        selectedIds={selected}
        onSelectedChange={setSelected}
        emptyLabel="No sessions in this range."
      />
    </form>
  );
}
