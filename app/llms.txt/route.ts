import { buildLlmsTxt } from "@/lib/llmsTxt";

export const dynamic = "force-static";

const HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "public, max-age=86400, s-maxage=86400",
};

export function GET() {
  return new Response(buildLlmsTxt(), { headers: HEADERS });
}

export function HEAD() {
  return new Response(null, { headers: HEADERS });
}
