-- First-party interaction analytics for the admin heatmap and event-stream
-- replay. RLS is on with no policies: only the service role (API + admin)
-- can read or write. The public tracker never talks to Supabase directly.

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
    check (max_scroll_pct >= 0 and max_scroll_pct <= 100)
);

comment on table public.analytics_sessions is
  'Anonymous public-site visits used to group heatmap events and replay a cursor path';

create index if not exists analytics_sessions_page_started_idx
  on public.analytics_sessions (page, started_at desc);

create index if not exists analytics_sessions_started_idx
  on public.analytics_sessions (started_at desc);

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.analytics_sessions (id) on delete cascade,
  type text not null check (type in ('click', 'move', 'scroll', 'attention')),
  x integer,
  y integer,
  scroll_y integer not null default 0,
  viewport_w integer not null,
  viewport_h integer not null,
  document_h integer not null,
  page text not null,
  ts timestamptz not null,
  dwell_ms integer
);

comment on table public.analytics_events is
  'Click, cursor, scroll and dwell events in document coordinates. No form values.';

create index if not exists analytics_events_page_ts_idx
  on public.analytics_events (page, ts desc);

create index if not exists analytics_events_session_ts_idx
  on public.analytics_events (session_id, ts);

create index if not exists analytics_events_type_page_ts_idx
  on public.analytics_events (type, page, ts desc);

alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;

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
