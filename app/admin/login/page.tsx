import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Strålkastarpolering
          </p>
          <h1 className="mt-2 text-2xl font-bold">Admin</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
