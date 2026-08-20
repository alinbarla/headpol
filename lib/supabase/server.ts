import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type BookingRecord = {
  id: string;
  booking_date: string;
  booking_time: string;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
};

let supabase: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  if (!supabase) {
    supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, signal: AbortSignal.timeout(4000) }),
      },
    });
  }

  return supabase;
}

export async function withSupabaseTimeout<T>(
  work: PromiseLike<T>,
  ms = 2500
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      Promise.resolve(work),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Supabase timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
