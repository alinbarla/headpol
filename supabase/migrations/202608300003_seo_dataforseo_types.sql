-- Allow DataForSEO product runs in seo_audit_logs.

alter table public.seo_audit_logs
  drop constraint if exists seo_audit_logs_type_check;

alter table public.seo_audit_logs
  add constraint seo_audit_logs_type_check
  check (type in (
    'backlink-check',
    'sitemap-check',
    'meta-audit',
    'broken-links',
    'structured-data',
    'pagespeed',
    'dfs-serp',
    'dfs-keywords',
    'dfs-domain',
    'dfs-labs',
    'dfs-onpage',
    'dfs-content',
    'dfs-ai',
    'dfs-business',
    'dfs-billing'
  ));
