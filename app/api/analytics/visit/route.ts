import { NextResponse } from "next/server";
import { z } from "zod";
import { isBotUserAgent, truncateUserAgent } from "@/lib/analytics/bots";
import { MAX_BATCH_BYTES } from "@/lib/analytics/constants";
import { sanitizePagePath, sanitizeReferrerPath } from "@/lib/analytics/page";
import { clientIpFromRequest, ingestAllowed } from "@/lib/analytics/rateLimit";
import { getAnalyticsSettings } from "@/lib/analytics/settings";
import { deviceFromUserAgent, upsertVisitSession } from "@/lib/analytics/store";
import { readJsonBody } from "@/lib/analytics/validate";
import {
  classifyAcquisition,
  type AttributionInput,
} from "@/lib/attribution/classify";
import {
  MAX_GCLID_LENGTH,
  MAX_LANDING_PATH_LENGTH,
  MAX_REFERRER_HOST_LENGTH,
  MAX_UTM_LENGTH,
} from "@/lib/attribution/constants";

export const runtime = "nodejs";
export const maxDuration = 15;

const visitSchema = z.object({
  sessionId: z.uuid(),
  visitorId: z.string().min(8).max(80),
  page: z.string(),
  referrer: z.string().max(400).optional().nullable(),
  viewportW: z.number().finite().min(1).max(10000).optional(),
  viewportH: z.number().finite().min(1).max(10000).optional(),
  documentH: z.number().finite().min(1).max(100000).optional(),
  device: z.enum(["mobile", "tablet", "desktop"]).optional(),
  attribution: z
    .object({
      utmSource: z.string().max(MAX_UTM_LENGTH).optional().nullable(),
      utmMedium: z.string().max(MAX_UTM_LENGTH).optional().nullable(),
      utmCampaign: z.string().max(MAX_UTM_LENGTH).optional().nullable(),
      utmContent: z.string().max(MAX_UTM_LENGTH).optional().nullable(),
      utmTerm: z.string().max(MAX_UTM_LENGTH).optional().nullable(),
      gclid: z.string().max(MAX_GCLID_LENGTH).optional().nullable(),
      landingPath: z.string().max(MAX_LANDING_PATH_LENGTH).optional().nullable(),
      referrerHost: z.string().max(MAX_REFERRER_HOST_LENGTH).optional().nullable(),
    })
    .optional()
    .nullable(),
});

/**
 * Lightweight visit beacon for the admin Visitors page. Uses the same Heatmap
 * enabled switch, but records every device (including mobile) without sample
 * rate so IP / device / traffic source show for each visitor.
 */
export async function POST(request: Request) {
  const settings = await getAnalyticsSettings();
  if (!settings.enabled) {
    return new NextResponse(null, { status: 204 });
  }

  const ip = clientIpFromRequest(request);
  if (!ingestAllowed(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const ua = request.headers.get("user-agent");
  if (isBotUserAgent(ua)) {
    return new NextResponse(null, { status: 204 });
  }

  const { value, bytes } = await readJsonBody(request);
  if (bytes > MAX_BATCH_BYTES) {
    return NextResponse.json({ error: "Invalid visit" }, { status: 400 });
  }

  const parsed = visitSchema.safeParse(value);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid visit" }, { status: 400 });
  }

  const page = sanitizePagePath(parsed.data.page);
  if (!page) {
    return NextResponse.json({ error: "Invalid visit" }, { status: 400 });
  }

  const classified = classifyAcquisition(
    (parsed.data.attribution ?? null) as Partial<AttributionInput> | null
  );

  const device = parsed.data.device ?? deviceFromUserAgent(ua);

  try {
    await upsertVisitSession({
      sessionId: parsed.data.sessionId,
      visitorId: parsed.data.visitorId,
      page,
      referrer: sanitizeReferrerPath(parsed.data.referrer),
      viewportW: Math.round(parsed.data.viewportW ?? 1),
      viewportH: Math.round(parsed.data.viewportH ?? 1),
      documentH: Math.round(parsed.data.documentH ?? 1),
      device,
      ip,
      isBot: false,
      userAgent: truncateUserAgent(ua),
      acquisitionChannel: classified.channel,
      utmSource: classified.utmSource,
      utmMedium: classified.utmMedium,
      utmCampaign: classified.utmCampaign,
      utmContent: classified.utmContent,
      utmTerm: classified.utmTerm,
      gclid: classified.gclid,
      landingPath: classified.landingPath,
      referrerHost: classified.referrerHost,
    });
  } catch (error) {
    console.error("[analytics] visit upsert failed", error);
    return NextResponse.json({ error: "Store failed" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
