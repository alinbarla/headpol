-- Daily acquisition funnel: sessions → web bookings → paid, by channel and
-- referrer_host. Counts are channel cohorts (same acquisition stamps), not
-- person-matched journeys — bookings do not share session_id with analytics.

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
