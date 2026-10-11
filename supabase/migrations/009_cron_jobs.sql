-- 009_cron_jobs.sql
select cron.schedule(
  'expire-stale-offers-and-rides',
  '* * * * *',
  $$
    update ride_offers set status = 'expired' where status = 'pending' and expires_at < now();
    update rides set status = 'expired' where status = 'requested' and requested_at < now() - interval '2 minutes';
  $$
);

