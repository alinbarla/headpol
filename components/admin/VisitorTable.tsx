"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { deleteSessionsAction } from "@/app/admin/heatmap/actions";
import { ActionToast, SubmitButton } from "@/components/admin/SubmitButton";
import { Button } from "@/components/shadcn/button";
import RecordsTable, { type RecordsTableRow } from "@/components/ui/records-table";
import type { SessionListOrder } from "@/lib/analytics/types";
import { SESSION_STRENGTH_LABELS } from "@/lib/admin/recordsRows";

const initial: ActionState = { ok: true };

export function VisitorTable({
  rows,
  listOrder = "newest",
}: {
  rows: RecordsTableRow[];
  listOrder?: SessionListOrder;
}) {
  const [state, formAction] = useActionState(deleteSessionsAction, initial);
  const [selected, setSelected] = useState<string[]>([]);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No visitors in this range yet.</p>
    );
  }

  const visibleIds = rows.map((row) => row.id);
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
            ? "Delete this visit permanently?"
            : `Delete ${selected.length} visits permanently?`;
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
      </div>

      <RecordsTable
        key={listOrder}
        rows={rows}
        listOrder={listOrder}
        nameLabel="Visitor"
        categoriesLabel="Device & source"
        lastLabel="When"
        strengthLabel="Session depth"
        linksLabel="Details"
        strengthLabels={SESSION_STRENGTH_LABELS}
        selectedIds={selected}
        onSelectedChange={setSelected}
        emptyLabel="No visitors in this range yet."
      />
    </form>
  );
}
