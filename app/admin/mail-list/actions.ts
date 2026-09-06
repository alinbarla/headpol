"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/app/admin/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { dismissDroppedVisitors } from "@/lib/analytics/droppedVisitors";

function fail(message: string): ActionState {
  return { ok: false, message };
}

export async function dismissDroppedVisitorsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const ids = formData
    .getAll("ids")
    .filter((value): value is string => typeof value === "string");
  const parsed = z.array(z.uuid()).min(1, "Select at least one lead").safeParse(ids);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid leads");
  }

  try {
    const removed = await dismissDroppedVisitors(parsed.data);
    await logAdminAction("analytics.dropped.dismiss", {
      entityType: "dropped_visitors",
      details: { ids: parsed.data, removed },
    });
    revalidatePath("/admin/mail-list");
    return {
      ok: true,
      message:
        removed === 1 ? "Lead removed from the list" : `${removed} leads removed from the list`,
    };
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not update the list");
  }
}
