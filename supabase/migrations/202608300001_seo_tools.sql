-- SEO tools: discovered backlinks and per-run audit summaries.
-- RLS on, no policies — only the service role (admin, cron) can read or write.

create table if not exists public.backlinks (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  target_url text not null,
  anchor_text text,
  domain_authority integer,
  discovered_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  status text not null default 'active'
    check (status in ('active', 'lost')),
  is_new boolean not null default true,
  unique (source_url, target_url)
);

comment on table public.backlinks is 'Referring pages from DataForSEO; new/lost tracked across daily checks';

create index if not exists backlinks_status_idx on public.backlinks (status);
create index if not exists backlinks_last_seen_idx on public.backlinks (last_seen_at desc);

create table if not exists public.seo_audit_logs (
  id uuid primary key default gen_random_uuid(),
  type text not null
    check (type in (
      'backlink-check',
      'sitemap-check',
      'meta-audit',
      'broken-links',
      'structured-data',
      'pagespeed'
    )),
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.seo_audit_logs is 'One row per SEO tool run; summary is the cached result for the admin UI';

create index if not exists seo_audit_logs_type_created_idx
  on public.seo_audit_logs (type, created_at desc);

alter table public.backlinks enable row level security;
alter table public.seo_audit_logs enable row level security;
