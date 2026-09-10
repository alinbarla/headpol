-- Marketing acquisition on analytics sessions (same channels as bookings).
-- Visit beacon + heatmap sessions share these columns so admin Visitors can
-- show device, IP and traffic source for every recorded visitor.

alter table public.analytics_sessions
  add column if not exists acquisition_channel text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists gclid text,
  add column if not exists landing_path text,
  add column if not exists referrer_host text;

alter table public.analytics_sessions
  drop constraint if exists analytics_sessions_acquisition_channel_check;

alter table public.analytics_sessions
  add constraint analytics_sessions_acquisition_channel_check
  check (
    acquisition_channel is null
    or acquisition_channel in (
      'google_ads',
      'organic_search',
      'direct',
      'referral',
      'unknown'
    )
  );

create index if not exists analytics_sessions_started_at_idx
  on public.analytics_sessions (started_at desc);

create index if not exists analytics_sessions_visitor_started_idx
  on public.analytics_sessions (visitor_id, started_at desc);

comment on column public.analytics_sessions.acquisition_channel is
  'Marketing origin: google_ads, organic_search, direct, referral or unknown';
comment on column public.analytics_sessions.referrer_host is
  'External referrer hostname at first touch';
