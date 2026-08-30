-- Admin assistant threads and messages.
-- RLS on, no policies — only the service role (admin actions) can read or write.

create table if not exists public.assistant_threads (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.assistant_threads is 'Admin assistant conversations; one row per chat';
comment on column public.assistant_threads.title is 'First user line, trimmed to 80 chars, or New chat until then';

create index if not exists assistant_threads_updated_idx
  on public.assistant_threads (updated_at desc);

create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.assistant_threads (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  reasoning_content text,
  created_at timestamptz not null default now()
);

comment on table public.assistant_messages is 'Persisted admin assistant turns; reasoning_content is replayed to K3 and never shown';
comment on column public.assistant_messages.attachments is 'name/size/type/text excerpt only — no binary';
comment on column public.assistant_messages.reasoning_content is 'K3 preserved thinking; send back on later turns';

create index if not exists assistant_messages_thread_created_idx
  on public.assistant_messages (thread_id, created_at);

create index if not exists assistant_messages_user_created_idx
  on public.assistant_messages (created_at desc)
  where role = 'user';

alter table public.assistant_threads enable row level security;
alter table public.assistant_messages enable row level security;
