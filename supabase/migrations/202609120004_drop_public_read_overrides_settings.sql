-- Public booking UI reads availability and rules via Next.js server routes
-- (service role). Nothing in the browser talks to Supabase directly anymore,
-- so world-readable SELECT policies are leftovers — and overrides.note is
-- free text the owner types (e.g. customer names).

drop policy if exists "Public read availability overrides" on public.availability_overrides;
drop policy if exists "Public read booking rules" on public.settings;
