import { isAuthorizedCron, unauthorized } from "@/lib/cron";
import { runAllSeoTools } from "@/lib/seo/runAll";

export const runtime = "nodejs";
/** SERP (8 live keywords) runs first; cheap checks follow. Needs headroom beyond 60s. */
export const maxDuration = 120;

async function handle(request: Request) {
  if (!isAuthorizedCron(request)) return unauthorized();

  const report = await runAllSeoTools();
  return Response.json({ ok: true, report });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
