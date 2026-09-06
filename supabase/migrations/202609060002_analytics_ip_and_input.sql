-- Store the visitor IP on each session and persist form typing for replay.

alter table public.analytics_sessions
  add column if not exists ip text;

comment on column public.analytics_sessions.ip is
  'Client IP from the ingest request (x-forwarded-for / x-real-ip)';

alter table public.analytics_events
  add column if not exists field text;

alter table public.analytics_events
  add column if not exists value text;

alter table public.analytics_events
  drop constraint if exists analytics_events_type_check;

alter table public.analytics_events
  add constraint analytics_events_type_check
  check (type in ('click', 'move', 'scroll', 'attention', 'input'));

comment on table public.analytics_events is
  'Click, cursor, scroll, dwell and form-input events. Password and payment fields are not stored.';
