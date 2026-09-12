-- Vercel request geo headers captured at visit / booking ingest.
-- Null on localhost and for rows created before this migration (no backfill).

alter table public.analytics_sessions
  add column if not exists city text,
  add column if not exists region text,
  add column if not exists country text,
  add column if not exists postal_code text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

alter table public.bookings
  add column if not exists city text,
  add column if not exists region text,
  add column if not exists country text,
  add column if not exists postal_code text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

comment on column public.analytics_sessions.city is
  'Vercel x-vercel-ip-city at session start (decoded)';
comment on column public.analytics_sessions.region is
  'Vercel x-vercel-ip-country-region (e.g. AB for Stockholm län)';
comment on column public.analytics_sessions.country is
  'Vercel x-vercel-ip-country ISO code';
comment on column public.analytics_sessions.postal_code is
  'Vercel x-vercel-ip-postal-code';
comment on column public.analytics_sessions.latitude is
  'Vercel x-vercel-ip-latitude';
comment on column public.analytics_sessions.longitude is
  'Vercel x-vercel-ip-longitude';

comment on column public.bookings.city is
  'Vercel x-vercel-ip-city at booking submit (decoded)';
comment on column public.bookings.region is
  'Vercel x-vercel-ip-country-region at booking submit';
comment on column public.bookings.country is
  'Vercel x-vercel-ip-country at booking submit';
comment on column public.bookings.postal_code is
  'Vercel x-vercel-ip-postal-code at booking submit';
comment on column public.bookings.latitude is
  'Vercel x-vercel-ip-latitude at booking submit';
comment on column public.bookings.longitude is
  'Vercel x-vercel-ip-longitude at booking submit';
