-- pg_cron and pg_net are already enabled on this project (see seo cron).
-- Do NOT run CREATE EXTENSION here — it fails with "dependent privileges exist".
--
-- Replace REPLACE_CRON_SECRET, then run only the schedule below.
-- Do not commit the filled-in secret.
--
-- Vercel Hobby only allows two vercel.json crons, so this job lives in
-- Supabase like the SEO daily audit. The analytics-retention cron also
-- refreshes reviews as a backup.

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
