alter table public.bookings
  add column if not exists customer_address text;

comment on column public.bookings.customer_address is 'Street address where we travel to polish the headlights';
