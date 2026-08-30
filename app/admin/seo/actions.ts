"use server";

import { revalidatePath } from "next/cache";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { seoToolCooldown } from "@/lib/seo/rateLimit";
import { runSeoTool } from "@/lib/seo/runAll";
import {
  SEO_AUDIT_TYPES,
  SEO_TOOL_PATH,
  type SeoAuditType,
} from "@/lib/seo/types";
import type { ActionState } from "@/app/admin/actions";

function fail(message: string): ActionState {
  return { ok: false, message };
}

async function runToolAction(
  type: SeoAuditType,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const cooldown = await seoToolCooldown(type);
  if (!cooldown.allowed) {
    return fail(`Wait ${cooldown.retryAfterMinutes} min before running again.`);
  }

  try {
    const result = await runSeoTool(type);
    await logAdminAction(`seo.${type}`, { details: result.summary });
    revalidatePath("/admin/seo");
    revalidatePath(`/admin/seo/${SEO_TOOL_PATH[type]}`);
    if (result.skipped) {
      return { ok: true, message: result.reason ?? "Skipped — not configured." };
    }
    return {
      ok: result.ok,
      message: result.ok ? "Check finished." : "Check finished with issues.",
    };
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Check failed.");
  }
}

export async function runBacklinkCheckAction(
  prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runToolAction("backlink-check", prev, formData);
}

export async function runSitemapCheckAction(
  prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runToolAction("sitemap-check", prev, formData);
}

export async function runMetaAuditAction(
  prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runToolAction("meta-audit", prev, formData);
}

export async function runBrokenLinksAction(
  prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runToolAction("broken-links", prev, formData);
}

export async function runStructuredDataAction(
  prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runToolAction("structured-data", prev, formData);
}

export async function runPageSpeedAction(
  prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runToolAction("pagespeed", prev, formData);
}

export async function runSerpRanksAction(
  prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runToolAction("dfs-serp", prev, formData);
}

export async function runKeywordVolumeAction(
  prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runToolAction("dfs-keywords", prev, formData);
}

export async function runDomainAnalyticsAction(
  prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runToolAction("dfs-domain", prev, formData);
}

export async function runLabsAction(
  prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runToolAction("dfs-labs", prev, formData);
}

export async function runOnPageAction(
  prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runToolAction("dfs-onpage", prev, formData);
}

export async function runContentMentionsAction(
  prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runToolAction("dfs-content", prev, formData);
}

export async function runAiOptimizationAction(
  prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runToolAction("dfs-ai", prev, formData);
}

export async function runBusinessDataAction(
  prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runToolAction("dfs-business", prev, formData);
}

export async function runBillingAction(
  prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runToolAction("dfs-billing", prev, formData);
}

export async function runAllSeoToolsAction(
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const ran: SeoAuditType[] = [];
  const cooling: SeoAuditType[] = [];
  const failed: string[] = [];
  let waitMin = 0;

  for (const type of SEO_AUDIT_TYPES) {
    const cooldown = await seoToolCooldown(type);
    if (!cooldown.allowed) {
      cooling.push(type);
      waitMin = Math.max(waitMin, cooldown.retryAfterMinutes);
      continue;
    }

    try {
      const result = await runSeoTool(type);
      ran.push(type);
      await logAdminAction(`seo.${type}`, { details: result.summary });
    } catch (error) {
      failed.push(error instanceof Error ? error.message : type);
    }
  }

  revalidatePath("/admin/seo");
  for (const path of Object.values(SEO_TOOL_PATH)) {
    revalidatePath(`/admin/seo/${path}`);
  }

  if (ran.length === 0 && failed.length === 0) {
    return fail(`Wait ${waitMin} min before updating again.`);
  }

  const parts = [`Updated ${ran.length} tool${ran.length === 1 ? "" : "s"}`];
  if (cooling.length > 0) parts.push(`${cooling.length} still cooling`);
  if (failed.length > 0) parts.push(`${failed.length} failed`);

  return {
    ok: failed.length === 0,
    message: `${parts.join(" · ")}.`,
  };
}
