-- Bookings for headlight restoration appointments
-- Available: Sunday–Friday, 16:00–20:00 (enforced in app)

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_date date not null,
  booking_time time not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint bookings_date_time_unique unique (booking_date, booking_time)
);

create index if not exists bookings_date_idx on public.bookings (booking_date);

create index if not exists bookings_status_idx on public.bookings (status);

comment on table public.bookings is 'Customer appointment slots for Strålkraft headlight restoration';

alter table public.bookings enable row level security;

drop policy if exists "Public read active booking slots" on public.bookings;
create policy "Public read active booking slots"
  on public.bookings
  for select
  using (status in ('pending', 'confirmed'));

drop policy if exists "Public insert pending bookings" on public.bookings;
create policy "Public insert pending bookings"
  on public.bookings
  for insert
  with check (status = 'pending');
