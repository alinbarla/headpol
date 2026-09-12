-- Recreate first-party analytics tables dropped in 202609120003.
-- Collection is gated in the app by the cookie banner "Analys" checkbox.

create table if not exists public.analytics_sessions (
  id uuid primary key,
  visitor_id text not null,
  page text not null,
  referrer text,
  viewport_w integer not null check (viewport_w > 0 and viewport_w <= 10000),
  viewport_h integer not null check (viewport_h > 0 and viewport_h <= 10000),
  document_h integer not null check (document_h > 0 and document_h <= 100000),
  device text not null check (device in ('mobile', 'tablet', 'desktop')),
  started_at timestamptz not null default now(),
  ended_at timestamptz not null default now(),
  event_count integer not null default 0 check (event_count >= 0),
  max_scroll_pct numeric(5, 2) not null default 0
    check (max_scroll_pct >= 0 and max_scroll_pct <= 100),
  ip text,
  acquisition_channel text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  landing_path text,
  referrer_host text,
  is_bot boolean not null default false,
  user_agent text,
  constraint analytics_sessions_acquisition_channel_check check (
    acquisition_channel is null
    or acquisition_channel in (
      'google_ads',
      'organic_search',
      'direct',
      'referral',
      'unknown'
    )
  )
);

comment on table public.analytics_sessions is
  'Anonymous public-site visits for heatmap, Visitors acquisition and replay';

create index if not exists analytics_sessions_page_started_idx
  on public.analytics_sessions (page, started_at desc);

create index if not exists analytics_sessions_started_idx
  on public.analytics_sessions (started_at desc);

create index if not exists analytics_sessions_started_at_idx
  on public.analytics_sessions (started_at desc);

create index if not exists analytics_sessions_visitor_started_idx
  on public.analytics_sessions (visitor_id, started_at desc);

create index if not exists analytics_sessions_human_started_idx
  on public.analytics_sessions (started_at desc)
  where is_bot = false;

create index if not exists analytics_sessions_human_page_started_idx
  on public.analytics_sessions (page, started_at desc)
  where is_bot = false;

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.analytics_sessions (id) on delete cascade,
  type text not null check (type in ('click', 'move', 'scroll', 'attention', 'input')),
  x integer,
  y integer,
  scroll_y integer not null default 0,
  viewport_w integer not null,
  viewport_h integer not null,
  document_h integer not null,
  page text not null,
  ts timestamptz not null,
  dwell_ms integer,
  field text,
  value text
);

comment on table public.analytics_events is
  'Click, cursor, scroll, dwell and form-input events. Password and payment fields are not stored.';

create index if not exists analytics_events_page_ts_idx
  on public.analytics_events (page, ts desc);

create index if not exists analytics_events_session_ts_idx
  on public.analytics_events (session_id, ts);

create index if not exists analytics_events_type_page_ts_idx
  on public.analytics_events (type, page, ts desc);

create table if not exists public.dropped_visitors (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_key text not null unique,
  name text,
  phone text,
  address text,
  postal_code text,
  session_id uuid references public.analytics_sessions (id) on delete set null,
  visitor_id text,
  page text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  dismissed_at timestamptz
);

comment on table public.dropped_visitors is
  'Mail-list leads from form typing in heatmap sessions with no matching booking';

create index if not exists dropped_visitors_last_seen_idx
  on public.dropped_visitors (last_seen_at desc);

alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.dropped_visitors enable row level security;

insert into public.settings (key, value)
values (
  'analytics_settings',
  jsonb_build_object(
    'enabled', false,
    'sampleRate', 1,
    'retentionDays', 30
  )
)
on conflict (key) do nothing;

create or replace view public.acquisition_funnel_daily as
with sessions as (
  select
    (started_at at time zone 'Europe/Stockholm')::date as day,
    coalesce(acquisition_channel, 'unknown') as acquisition_channel,
    nullif(btrim(referrer_host), '') as referrer_host,
    count(*)::bigint as sessions
  from public.analytics_sessions
  where coalesce(is_bot, false) = false
  group by 1, 2, 3
),
bookings_started as (
  select
    (created_at at time zone 'Europe/Stockholm')::date as day,
    coalesce(acquisition_channel, 'unknown') as acquisition_channel,
    nullif(btrim(referrer_host), '') as referrer_host,
    count(*)::bigint as bookings_started
  from public.bookings
  where source = 'web'
  group by 1, 2, 3
),
paid as (
  select
    (p.paid_at at time zone 'Europe/Stockholm')::date as day,
    coalesce(b.acquisition_channel, 'unknown') as acquisition_channel,
    nullif(btrim(b.referrer_host), '') as referrer_host,
    count(*)::bigint as paid_count,
    coalesce(sum(p.amount_ore), 0)::bigint as revenue_ore
  from public.payments p
  join public.bookings b on b.id = p.booking_id
  where p.status = 'paid'
    and p.paid_at is not null
  group by 1, 2, 3
),
keys as (
  select day, acquisition_channel, referrer_host from sessions
  union
  select day, acquisition_channel, referrer_host from bookings_started
  union
  select day, acquisition_channel, referrer_host from paid
)
select
  k.day,
  k.acquisition_channel,
  k.referrer_host,
  coalesce(s.sessions, 0)::bigint as sessions,
  coalesce(bs.bookings_started, 0)::bigint as bookings_started,
  coalesce(p.paid_count, 0)::bigint as paid_count,
  coalesce(p.revenue_ore, 0)::bigint as revenue_ore
from keys k
left join sessions s
  on s.day = k.day
  and s.acquisition_channel = k.acquisition_channel
  and s.referrer_host is not distinct from k.referrer_host
left join bookings_started bs
  on bs.day = k.day
  and bs.acquisition_channel = k.acquisition_channel
  and bs.referrer_host is not distinct from k.referrer_host
left join paid p
  on p.day = k.day
  and p.acquisition_channel = k.acquisition_channel
  and p.referrer_host is not distinct from k.referrer_host;

comment on view public.acquisition_funnel_daily is
  'Channel-cohort funnel by Stockholm day: non-bot sessions, web bookings, and paid payments. Not person-matched.';

notify pgrst, 'reload schema';
