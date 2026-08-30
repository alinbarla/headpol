-- RLS is row-level only. The public anon key can otherwise SELECT every
-- column on pending/confirmed rows (name, email, phone, address, notes).
-- Keep the slot calendar, hide customer PII.

revoke select on public.bookings from anon, authenticated, public;

grant select (booking_date, booking_time, status)
  on public.bookings
  to anon, authenticated;

comment on table public.bookings is
  'Customer appointment slots. Anon/authenticated may only select booking_date, booking_time, status.';

notify pgrst, 'reload schema';
