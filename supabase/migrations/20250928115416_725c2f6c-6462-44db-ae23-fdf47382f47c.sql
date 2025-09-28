-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup of expired reservations to run every 5 minutes
SELECT cron.schedule(
  'cleanup-expired-reservations',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://zjtqptljuggbymcoovey.supabase.co/functions/v1/cleanup-expired-reservations',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdHFwdGxqdWdnYnltY29vdmV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQzNzc1MywiZXhwIjoyMDc0MDEzNzUzfQ.YfQZg8nEIZSSeZyNsJ-6VyxxubXNqqVoe7Si0Uh96BE"}'::jsonb,
    body := '{"source": "cron_job"}'::jsonb
  ) AS request_id;
  $$
);

-- Add comment for documentation
COMMENT ON EXTENSION pg_cron IS 'Scheduled cleanup of expired investment reservations';

-- Create a view to monitor cron jobs
CREATE OR REPLACE VIEW cron_job_status AS
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
FROM cron.job;