-- pg_cron and pg_net are already enabled on this project (see seo cron).
-- Do NOT run CREATE EXTENSION here — it fails with "dependent privileges exist".
--
-- Replace REPLACE_CRON_SECRET, then run only the schedule below.
-- Do not commit the filled-in secret.
--
-- Vercel Hobby already schedules /api/cron/reviews daily via vercel.json.
-- Use this Supabase job only if you want a second refresh window.

select cron.schedule(
  'google-reviews-daily',
  '30 5 * * *',
  $$
  select net.http_get(
    url := 'https://stralkastarpolering.se/api/cron/reviews',
    headers := jsonb_build_object(
      'Authorization', 'Bearer REPLACE_CRON_SECRET'
    ),
    timeout_milliseconds := 30000
  );
  $$
);

-- Inspect: select jobid, jobname, schedule from cron.job;
-- Unschedule: select cron.unschedule('google-reviews-daily');
