import { NextResponse } from "next/server";
import { clientIpFromRequest, ingestAllowed } from "@/lib/analytics/rateLimit";
import { getAnalyticsSettings } from "@/lib/analytics/settings";
import { insertEventBatch } from "@/lib/analytics/store";
import { parseIngestBody, readJsonBody } from "@/lib/analytics/validate";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function POST(request: Request) {
  const settings = await getAnalyticsSettings();
  if (!settings.enabled) {
    return new NextResponse(null, { status: 204 });
  }

  const ip = clientIpFromRequest(request);
  if (!ingestAllowed(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { value, bytes } = await readJsonBody(request);
  const parsed = parseIngestBody(value, bytes);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid batch" }, { status: 400 });
  }

  try {
    await insertEventBatch(
      {
        sessionId: parsed.sessionId,
        visitorId: parsed.visitorId,
        page: parsed.page,
        referrer: parsed.referrer,
        viewportW: parsed.viewportW,
        viewportH: parsed.viewportH,
        documentH: parsed.documentH,
        device: parsed.device,
      },
      parsed.events
    );
  } catch (error) {
    console.error("[analytics] insert failed", error);
    return NextResponse.json({ error: "Store failed" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
