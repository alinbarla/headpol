import { NextResponse } from "next/server";
import { CONFIG_CACHE_MS } from "@/lib/analytics/constants";
import { getAnalyticsSettings } from "@/lib/analytics/settings";

export const runtime = "nodejs";

export async function GET() {
  const settings = await getAnalyticsSettings();

  return NextResponse.json(
    {
      enabled: settings.enabled,
      sampleRate: settings.sampleRate,
    },
    {
      headers: {
        "Cache-Control": `public, max-age=0, s-maxage=${Math.floor(CONFIG_CACHE_MS / 1000)}`,
      },
    }
  );
}
