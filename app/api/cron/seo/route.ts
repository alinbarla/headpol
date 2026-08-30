import { isAuthorizedCron, unauthorized } from "@/lib/cron";
import { runAllSeoTools } from "@/lib/seo/runAll";

export const runtime = "nodejs";
export const maxDuration = 60;

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
