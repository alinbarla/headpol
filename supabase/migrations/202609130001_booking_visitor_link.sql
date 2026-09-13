-- Optional link from a (usually phone) booking to a first-party visitor
-- session, plus a free-text visitor IP when the owner knows the caller IP
-- but not which session.

alter table public.bookings
  add column if not exists analytics_session_id uuid
    references public.analytics_sessions (id) on delete set null,
  add column if not exists visitor_ip text;

create index if not exists bookings_analytics_session_id_idx
  on public.bookings (analytics_session_id)
  where analytics_session_id is not null;

create index if not exists bookings_visitor_ip_idx
  on public.bookings (visitor_ip)
  where visitor_ip is not null;

create index if not exists analytics_sessions_ip_started_idx
  on public.analytics_sessions (ip, started_at desc)
  where ip is not null;

comment on column public.bookings.analytics_session_id is
  'Optional analytics session matched to a manual (phone) booking';
comment on column public.bookings.visitor_ip is
  'Optional visitor IP known to the owner when taking a phone booking';
