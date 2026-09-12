-- Bookings are read and written only through the Next.js API with the service
-- role. Anon SELECT leaked PII (or at least slot occupancy) via the public
-- key in DevTools; anon INSERT let anyone fill the calendar for free.
-- Drop the public policies and revoke every privilege from anon/authenticated.

drop policy if exists "Public read active booking slots" on public.bookings;
drop policy if exists "Public insert pending bookings" on public.bookings;

revoke all on table public.bookings from anon, authenticated, public;

comment on table public.bookings is
  'Customer appointment slots. No anon/authenticated access — service role only via the app API.';

notify pgrst, 'reload schema';
