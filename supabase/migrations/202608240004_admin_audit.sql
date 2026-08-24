-- Admin audit trail and login throttling.
-- The admin PIN is shared, so the audit log is the only record of who did
-- what. Login attempts live in the database because serverless instances
-- cannot share an in-memory rate limiter.

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb,
  ip inet,
  created_at timestamptz not null default now()
);

comment on table public.admin_audit_log is 'Every admin mutation: login, booking changes, refunds';
comment on column public.admin_audit_log.action is 'Dotted verb such as booking.cancel or refund.create';

create index if not exists admin_audit_log_created_idx
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_log_entity_idx
  on public.admin_audit_log (entity_type, entity_id);

create table if not exists public.admin_login_attempts (
  id bigint generated always as identity primary key,
  ip inet not null,
  succeeded boolean not null,
  created_at timestamptz not null default now()
);

comment on table public.admin_login_attempts is 'Failed and successful PIN entries, used to lock out brute force';

create index if not exists admin_login_attempts_ip_idx
  on public.admin_login_attempts (ip, created_at desc);

alter table public.admin_audit_log enable row level security;
alter table public.admin_login_attempts enable row level security;
