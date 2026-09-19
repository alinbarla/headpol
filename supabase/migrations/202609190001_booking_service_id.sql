-- Bookable SKU on each booking. Existing rows are polering (the previous
-- single product). Web checkout sets this from the catalog; never trust a
-- client-sent price.

alter table public.bookings
  add column if not exists service_id text not null default 'polering';

alter table public.bookings
  drop constraint if exists bookings_service_id_check;

alter table public.bookings
  add constraint bookings_service_id_check
  check (service_id in ('polering', 'ppf', 'polering-ppf'));

comment on column public.bookings.service_id is
  'Catalog SKU: polering | ppf | polering-ppf';
