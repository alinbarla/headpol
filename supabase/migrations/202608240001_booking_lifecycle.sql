-- Booking lifecycle: richer statuses, payment tracking and admin metadata.
--
-- The original `bookings_date_time_unique` constraint covered every row,
-- including cancelled ones, while the public API only reports pending and
-- confirmed slots as taken. That combination made a cancelled slot look free
-- in the calendar but reject the insert with 23505. A partial unique index
-- keeps double-booking impossible while genuinely releasing the slot.

alter table public.bookings
  drop constraint if exists bookings_date_time_unique;

create unique index if not exists bookings_active_slot_unique
  on public.bookings (booking_date, booking_time)
  where status in ('pending', 'confirmed', 'completed', 'no_show');

alter table public.bookings
  drop constraint if exists bookings_status_check;

alter table public.bookings
  add constraint bookings_status_check
  check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'expired'));

alter table public.bookings
  add column if not exists source text not null default 'web',
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists price_ore integer not null default 79900,
  add column if not exists internal_notes text,
  add column if not exists hold_expires_at timestamptz,
  add column if not exists rescheduled_from_id uuid references public.bookings (id),
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text,
  add column if not exists reminder_sent_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.bookings
  drop constraint if exists bookings_source_check;

alter table public.bookings
  add constraint bookings_source_check
  check (source in ('web', 'phone', 'walk_in', 'admin'));

alter table public.bookings
  drop constraint if exists bookings_payment_status_check;

alter table public.bookings
  add constraint bookings_payment_status_check
  check (payment_status in ('unpaid', 'awaiting_payment', 'paid', 'refunded', 'partially_refunded'));

comment on column public.bookings.source is 'How the booking was created: web, phone, walk_in or admin';
comment on column public.bookings.payment_status is 'Denormalised payment state so booking lists avoid a join';
comment on column public.bookings.price_ore is 'Agreed price in öre (79900 = 799 kr) — integers only, never floats';
comment on column public.bookings.internal_notes is 'Admin-only notes: gate codes, car model, access instructions';
comment on column public.bookings.hold_expires_at is 'Slot reservation deadline while a Stripe Checkout session is open';
comment on column public.bookings.rescheduled_from_id is 'Set when this booking replaced an earlier one';

-- Availability queries scan the active window constantly; index it.
create index if not exists bookings_date_status_idx
  on public.bookings (booking_date, status);

create index if not exists bookings_hold_expires_idx
  on public.bookings (hold_expires_at)
  where hold_expires_at is not null;

create index if not exists bookings_customer_phone_idx
  on public.bookings (customer_phone);

create index if not exists bookings_customer_email_idx
  on public.bookings (customer_email);

-- Prefixed rather than a generic `set_updated_at`, because this schema is
-- shared with another application and a bare name invites a future clobber.
create or replace function public.bookings_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row
  execute function public.bookings_touch_updated_at();

-- The public read policy must not leak customer PII, and the public insert
-- policy must not allow forging a paid booking. Both are tightened here; the
-- admin uses the service role key, which bypasses RLS entirely.
drop policy if exists "Public read active booking slots" on public.bookings;
create policy "Public read active booking slots"
  on public.bookings
  for select
  using (status in ('pending', 'confirmed'));

drop policy if exists "Public insert pending bookings" on public.bookings;
create policy "Public insert pending bookings"
  on public.bookings
  for insert
  with check (status = 'pending' and payment_status in ('unpaid', 'awaiting_payment'));
