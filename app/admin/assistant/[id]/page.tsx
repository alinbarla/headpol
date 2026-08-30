import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AssistantThreadRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  redirect(`/admin/assistant?thread=${id}`);
}
