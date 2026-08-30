-- pg_cron and pg_net are already enabled on this project.
-- Do NOT run CREATE EXTENSION here — it fails with "dependent privileges exist".
--
-- Replace REPLACE_CRON_SECRET, then run only the schedule below.
-- Do not commit the filled-in secret.

select cron.schedule(
  'seo-daily-audit',
  '0 6 * * *',
  $$
  select net.http_get(
    url := 'https://stralkastarpolering.se/api/cron/seo',
    headers := jsonb_build_object(
      'Authorization', 'Bearer REPLACE_CRON_SECRET'
    ),
    timeout_milliseconds := 60000
  );
  $$
);

-- Inspect: select jobid, jobname, schedule from cron.job;
-- Unschedule: select cron.unschedule('seo-daily-audit');
