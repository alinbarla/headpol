-- Run this in the Supabase SQL editor AFTER 202608300002_seo_pg_cron.sql.
-- Replace the placeholders. Do not commit filled-in secrets.

-- Optional: store the bearer in Vault instead of inlining it.
-- select vault.create_secret('Bearer REPLACE_CRON_SECRET', 'seo_cron_authorization');

select cron.schedule(
  'seo-daily-audit',
  '0 6 * * *',
  $$
  select net.http_get(
    url := 'https://stralkastarpolering.se/api/cron/seo',
    headers := jsonb_build_object(
      'Authorization', 'Bearer REPLACE_CRON_SECRET'
    )
  );
  $$
);

-- Inspect: select * from cron.job;
-- Unschedule: select cron.unschedule('seo-daily-audit');
