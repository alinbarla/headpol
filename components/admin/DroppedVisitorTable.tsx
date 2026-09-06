"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { dismissDroppedVisitorsAction } from "@/app/admin/mail-list/actions";
import { ActionToast, SubmitButton } from "@/components/admin/SubmitButton";
import { Button } from "@/components/shadcn/button";
import type { DroppedVisitor } from "@/lib/analytics/types";
import { formatTimestamp } from "@/lib/time";

const initial: ActionState = { ok: true };

export function DroppedVisitorTable({ leads }: { leads: DroppedVisitor[] }) {
  const [state, formAction] = useActionState(dismissDroppedVisitorsAction, initial);
  const [selected, setSelected] = useState<string[]>([]);

  if (leads.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No dropped visitors right now. People who type an email in the booking
        form without creating a booking will show up here automatically.
      </p>
    );
  }

  const visibleIds = leads.map((lead) => lead.id);
  const allSelected = visibleIds.every((id) => selected.includes(id));
  const emails = leads.map((lead) => lead.email).join("\n");

  function toggle(id: string, on: boolean) {
    setSelected((current) =>
      on ? [...new Set([...current, id])] : current.filter((item) => item !== id)
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (selected.length === 0) {
          event.preventDefault();
          return;
        }
        if (!window.confirm("Remove the selected leads from the mail list?")) {
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
          pendingLabel="Removing…"
        >
          Remove from list
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void navigator.clipboard.writeText(emails);
          }}
        >
          Copy emails
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
                  onChange={(event) =>
                    setSelected(event.target.checked ? visibleIds : [])
                  }
                  aria-label="Select all leads"
                />
              </th>
              <th className="py-2 pr-3 font-medium">Email</th>
              <th className="py-2 pr-3 font-medium">Name</th>
              <th className="py-2 pr-3 font-medium">Phone</th>
              <th className="py-2 pr-3 font-medium">Address</th>
              <th className="py-2 pr-3 font-medium">Last seen</th>
              <th className="py-2 font-medium">Session</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-border last:border-0">
                <td className="py-2 pr-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(lead.id)}
                    onChange={(event) => toggle(lead.id, event.target.checked)}
                    aria-label={`Select ${lead.email}`}
                  />
                </td>
                <td className="py-2 pr-3">
                  <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                    {lead.email}
                  </a>
                </td>
                <td className="py-2 pr-3">{lead.name ?? "—"}</td>
                <td className="py-2 pr-3 font-mono text-xs">{lead.phone ?? "—"}</td>
                <td className="py-2 pr-3">
                  {[lead.address, lead.postal_code].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="py-2 pr-3 text-muted-foreground">
                  {formatTimestamp(lead.last_seen_at)}
                </td>
                <td className="py-2">
                  {lead.session_id ? (
                    <Link
                      href={`/admin/heatmap/sessions/${lead.session_id}`}
                      className="text-primary hover:underline"
                    >
                      Replay
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}
