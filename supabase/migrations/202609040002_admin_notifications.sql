-- In-app admin notifications for Stripe payment activity.
-- Prefer this over extra owner emails: the admin host already surfaces work
-- that needs attention, and refund/payment noise belongs next to bookings.

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null
    check (kind in (
      'payment_received',
      'payment_failed',
      'checkout_expired',
      'refund_succeeded',
      'refund_failed',
      'webhook_error'
    )),
  title text not null,
  body text,
  booking_id uuid references public.bookings (id) on delete set null,
  stripe_event_id text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.admin_notifications is
  'Operational alerts for the admin UI (Stripe payments, refunds, webhook failures)';

create index if not exists admin_notifications_created_idx
  on public.admin_notifications (created_at desc);

create index if not exists admin_notifications_unread_idx
  on public.admin_notifications (created_at desc)
  where read_at is null;

alter table public.admin_notifications enable row level security;
