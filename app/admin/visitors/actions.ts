"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/app/admin/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { setVisitorBookedOverride } from "@/lib/admin/data";

function fail(message: string): ActionState {
  return { ok: false, message };
}

const overrideSchema = z.object({
  id: z.uuid("Invalid visitor id"),
  booked: z.enum(["true", "false", "auto"]),
});

export async function setVisitorBookedAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = overrideSchema.safeParse({
    id: formData.get("id"),
    booked: formData.get("booked"),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const bookedOverride =
    parsed.data.booked === "auto"
      ? null
      : parsed.data.booked === "true";

  try {
    await setVisitorBookedOverride(parsed.data.id, bookedOverride);
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Could not update booked status"
    );
  }

  await logAdminAction("analytics.visitor.booked_override", {
    entityType: "analytics_sessions",
    entityId: parsed.data.id,
    details: { booked_override: bookedOverride },
  });

  revalidatePath("/admin/visitors");
  revalidatePath(`/admin/visitors/${parsed.data.id}`);
  revalidatePath("/admin/heatmap");

  const message =
    bookedOverride === true
      ? "Marked as Booked"
      : bookedOverride === false
        ? "Marked as Not booked"
        : "Using automatic Booked detection";

  return { ok: true, message };
}
