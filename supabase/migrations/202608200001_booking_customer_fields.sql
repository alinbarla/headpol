-- Customer contact fields so we can send confirmations and owner alerts.
alter table public.bookings
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists customer_phone text,
  add column if not exists locale text;

comment on column public.bookings.customer_name is 'Name entered on the booking form';
comment on column public.bookings.customer_email is 'Email for booking confirmation';
comment on column public.bookings.customer_phone is 'Phone for the owner to confirm the visit';
comment on column public.bookings.locale is 'sv or en — language used when booking';
