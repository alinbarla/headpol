import { after } from "next/server";
import { NextResponse } from "next/server";
import { syncDroppedVisitors } from "@/lib/analytics/droppedVisitors";
import { clientIpFromRequest, ingestAllowed } from "@/lib/analytics/rateLimit";
import { getAnalyticsSettings } from "@/lib/analytics/settings";
import { insertEventBatch, resolveHeatmapDevice } from "@/lib/analytics/store";
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

  const device = resolveHeatmapDevice(
    parsed.device,
    request.headers.get("user-agent")
  );

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
        device,
        ip,
      },
      parsed.events
    );
  } catch (error) {
    console.error("[analytics] insert failed", error);
    return NextResponse.json({ error: "Store failed" }, { status: 500 });
  }

  if (parsed.events.some((event) => event.type === "input")) {
    after(() => {
      void syncDroppedVisitors(parsed.sessionId).catch((error) => {
        console.error("[analytics] dropped visitor sync failed", error);
      });
    });
  }

  return new NextResponse(null, { status: 204 });
}
