-- Manual Booked / Not booked override on a visit when automatic booking
-- linking (session id / visitor IP) is wrong or missing.

alter table public.analytics_sessions
  add column if not exists booked_override boolean;

comment on column public.analytics_sessions.booked_override is
  'null = derive from linked bookings; true = force Booked; false = force Not booked';

create index if not exists analytics_sessions_booked_override_idx
  on public.analytics_sessions (booked_override)
  where booked_override is not null;
