-- Stripe payments, refunds and webhook idempotency.
-- All amounts are integers in öre. These tables have RLS enabled with no
-- policies, so only the service role key can reach them.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  provider text not null default 'stripe'
    check (provider in ('stripe', 'manual')),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  amount_ore integer not null check (amount_ore >= 0),
  currency text not null default 'sek',
  status text not null
    check (status in ('awaiting_payment', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded')),
  method text,
  paid_at timestamptz,
  receipt_url text,
  checkout_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.payments is 'One row per payment attempt against a booking';
comment on column public.payments.method is 'card, swish, klarna, cash or swish_manual';
comment on column public.payments.checkout_url is 'Hosted Stripe Checkout URL, reusable until the session expires';

create index if not exists payments_booking_idx on public.payments (booking_id);
create index if not exists payments_status_idx on public.payments (status);

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
  before update on public.payments
  for each row
  execute function public.bookings_touch_updated_at();

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id) on delete cascade,
  booking_id uuid not null references public.bookings (id) on delete cascade,
  stripe_refund_id text unique,
  amount_ore integer not null check (amount_ore > 0),
  reason text,
  status text not null
    check (status in ('pending', 'succeeded', 'failed', 'canceled')),
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.refunds is 'Refunds issued from the admin. Swish settles asynchronously, so rows start pending.';
comment on column public.refunds.created_by is 'Admin session fingerprint or "system" — the PIN is shared, so this is coarse';

create index if not exists refunds_booking_idx on public.refunds (booking_id);
create index if not exists refunds_payment_idx on public.refunds (payment_id);

drop trigger if exists refunds_set_updated_at on public.refunds;
create trigger refunds_set_updated_at
  before update on public.refunds
  for each row
  execute function public.bookings_touch_updated_at();

-- Stripe retries webhooks aggressively. Inserting the event id first turns a
-- replay into a unique violation, which the handler treats as "already done".
create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

comment on table public.stripe_events is 'Processed Stripe event ids, used to make the webhook idempotent';

alter table public.payments enable row level security;
alter table public.refunds enable row level security;
alter table public.stripe_events enable row level security;
