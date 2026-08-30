-- Enable Postgres schedulers used to call /api/cron/seo from outside Vercel.
-- The actual cron.schedule() call needs the site URL and CRON_SECRET; those
-- live in Vault and are applied from supabase/seo-cron-schedule.example.sql
-- in the dashboard, never committed with real values.

create extension if not exists pg_cron;
create extension if not exists pg_net;
