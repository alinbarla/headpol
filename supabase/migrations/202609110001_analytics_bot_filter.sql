-- Mark bot / crawler sessions so admin heatmap, visitors and sessions can
-- exclude them. New ingest rejects bots before write; this column covers
-- defense-in-depth and any rows inserted before the filter.

alter table public.analytics_sessions
  add column if not exists is_bot boolean not null default false;

alter table public.analytics_sessions
  add column if not exists user_agent text;

create index if not exists analytics_sessions_human_started_idx
  on public.analytics_sessions (started_at desc)
  where is_bot = false;

create index if not exists analytics_sessions_human_page_started_idx
  on public.analytics_sessions (page, started_at desc)
  where is_bot = false;

comment on column public.analytics_sessions.is_bot is
  'True when the request User-Agent looked like a bot/crawler';
comment on column public.analytics_sessions.user_agent is
  'Truncated User-Agent at first write (max ~300 chars in app)';
