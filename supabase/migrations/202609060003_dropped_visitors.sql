-- Visitors who typed booking-form details in a heatmap session but never
-- created a booking. The admin mail list syncs this table automatically.

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

alter table public.dropped_visitors enable row level security;
