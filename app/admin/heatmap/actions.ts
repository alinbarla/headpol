"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/app/admin/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { saveAnalyticsSettings } from "@/lib/analytics/settings";
import { deleteSessions, purgeAnalytics } from "@/lib/analytics/store";

function fail(message: string): ActionState {
  return { ok: false, message };
}

export async function updateAnalyticsSettingsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = z
    .object({
      enabled: z.enum(["true", "false"]),
      sampleRate: z.coerce.number().min(0).max(1),
      retentionDays: z.coerce.number().int().min(1).max(365),
    })
    .safeParse({
      enabled: formData.get("enabled"),
      sampleRate: formData.get("sampleRate"),
      retentionDays: formData.get("retentionDays"),
    });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid settings");
  }

  try {
    await saveAnalyticsSettings({
      enabled: parsed.data.enabled === "true",
      sampleRate: parsed.data.sampleRate,
      retentionDays: parsed.data.retentionDays,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not save settings");
  }

  await logAdminAction("analytics.settings", {
    entityType: "analytics",
    details: parsed.data,
  });
  revalidatePath("/admin/settings");
  revalidatePath("/admin/heatmap");
  revalidatePath("/admin/visitors");
  return { ok: true, message: "Heatmap settings saved" };
}

export async function deleteSessionsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const ids = formData
    .getAll("ids")
    .filter((value): value is string => typeof value === "string");
  const parsed = z.array(z.uuid()).min(1, "Select at least one recording").safeParse(ids);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid recordings");
  }

  try {
    const deleted = await deleteSessions(parsed.data);
    await logAdminAction("analytics.sessions.delete", {
      entityType: "analytics",
      details: { ids: parsed.data, deleted },
    });
    revalidatePath("/admin/heatmap");
    return {
      ok: true,
      message:
        deleted === 1
          ? "Recording deleted permanently"
          : `${deleted} recordings deleted permanently`,
    };
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not delete recordings");
  }
}

export async function purgeAnalyticsAction(
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  try {
    await purgeAnalytics();
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not purge data");
  }

  await logAdminAction("analytics.purge", { entityType: "analytics" });
  revalidatePath("/admin/settings");
  revalidatePath("/admin/heatmap");
  revalidatePath("/admin/visitors");
  return { ok: true, message: "Heatmap data deleted" };
}
