-- Marketing acquisition fields on bookings: where the visitor came from
-- (Google Ads, organic search, direct, referral) distinct from bookings.source
-- which only records how the booking was created (web / phone / walk_in / admin).

alter table public.bookings
  add column if not exists acquisition_channel text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists gclid text,
  add column if not exists landing_path text,
  add column if not exists referrer_host text;

alter table public.bookings
  drop constraint if exists bookings_acquisition_channel_check;

alter table public.bookings
  add constraint bookings_acquisition_channel_check
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

comment on column public.bookings.acquisition_channel is
  'Marketing origin: google_ads, organic_search, direct, referral or unknown';
comment on column public.bookings.utm_source is 'utm_source at last non-direct touch';
comment on column public.bookings.utm_medium is 'utm_medium at last non-direct touch';
comment on column public.bookings.utm_campaign is 'utm_campaign at last non-direct touch';
comment on column public.bookings.utm_content is 'utm_content at last non-direct touch';
comment on column public.bookings.utm_term is 'utm_term at last non-direct touch';
comment on column public.bookings.gclid is 'Google Ads click id when present';
comment on column public.bookings.landing_path is 'Path (+ safe query) of the attributed landing';
comment on column public.bookings.referrer_host is 'External referrer hostname at attributed touch';
