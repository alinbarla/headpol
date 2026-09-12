-- Disambiguate IP-derived geo from the customer's typed postcode on bookings.
-- analytics_sessions columns are left as-is (unambiguous in that table).

alter table public.bookings rename column city to geo_city;
alter table public.bookings rename column region to geo_region;
alter table public.bookings rename column country to geo_country;
alter table public.bookings rename column postal_code to geo_postal_code;
alter table public.bookings rename column latitude to geo_latitude;
alter table public.bookings rename column longitude to geo_longitude;

alter table public.bookings
  add column if not exists customer_postal_code text;

comment on column public.bookings.geo_city is
  'Vercel x-vercel-ip-city at booking submit (decoded)';
comment on column public.bookings.geo_region is
  'Vercel x-vercel-ip-country-region at booking submit';
comment on column public.bookings.geo_country is
  'Vercel x-vercel-ip-country at booking submit';
comment on column public.bookings.geo_postal_code is
  'Vercel x-vercel-ip-postal-code at booking submit (IP-derived, not customer)';
comment on column public.bookings.geo_latitude is
  'Vercel x-vercel-ip-latitude at booking submit';
comment on column public.bookings.geo_longitude is
  'Vercel x-vercel-ip-longitude at booking submit';
comment on column public.bookings.customer_postal_code is
  'Customer-typed postal code from the booking form';
