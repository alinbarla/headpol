-- Availability overrides and runtime-editable booking rules.
-- Overrides let the owner block a holiday or open an extra evening without a
-- deploy; the settings table moves the hard-coded rules out of lib/booking.ts.

create table if not exists public.availability_overrides (
  id uuid primary key default gen_random_uuid(),
  override_date date not null,
  start_time time,
  end_time time,
  kind text not null check (kind in ('block', 'open')),
  note text,
  created_at timestamptz not null default now(),
  -- A whole-day entry leaves both times null; a ranged entry needs both.
  constraint availability_overrides_range_check
    check (
      (start_time is null and end_time is null)
      or (start_time is not null and end_time is not null and end_time > start_time)
    )
);

comment on table public.availability_overrides is 'Blackout days and ad-hoc extra openings layered on top of the weekly rules';
comment on column public.availability_overrides.kind is 'block closes time that would normally be open; open adds time outside the weekly rules';
comment on column public.availability_overrides.start_time is 'Null means the whole day';

create index if not exists availability_overrides_date_idx
  on public.availability_overrides (override_date);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.settings is 'Runtime configuration editable from the admin';

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
  before update on public.settings
  for each row
  execute function public.bookings_touch_updated_at();

-- Seeded from the previous hard-coded constants so behaviour is unchanged.
insert into public.settings (key, value)
values (
  'booking_rules',
  jsonb_build_object(
    'weekdays', jsonb_build_array(0, 1, 2, 3, 4, 5),
    'startHour', 16,
    'endHour', 20,
    'horizonDays', 60,
    'priceOre', 79900
  )
)
on conflict (key) do nothing;

alter table public.availability_overrides enable row level security;
alter table public.settings enable row level security;

-- The public booking picker needs to see blackouts, extra openings and the
-- rules, but must not be able to change them.
drop policy if exists "Public read availability overrides" on public.availability_overrides;
create policy "Public read availability overrides"
  on public.availability_overrides
  for select
  using (true);

drop policy if exists "Public read booking rules" on public.settings;
create policy "Public read booking rules"
  on public.settings
  for select
  using (key = 'booking_rules');
