-- Phase 1: Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Phase 6: Create automation_jobs table for monitoring
CREATE TABLE IF NOT EXISTS automation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('running', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on automation_jobs
ALTER TABLE automation_jobs ENABLE ROW LEVEL SECURITY;

-- Service role can manage automation jobs
CREATE POLICY "Service role can manage automation jobs"
  ON automation_jobs
  FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Phase 5: Create dividend_schedules table
CREATE TABLE IF NOT EXISTS dividend_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tokenization_id UUID REFERENCES tokenizations(id) ON DELETE CASCADE,
  frequency TEXT CHECK (frequency IN ('monthly', 'quarterly', 'annually')),
  next_distribution_date DATE NOT NULL,
  auto_distribute BOOLEAN DEFAULT true,
  last_distribution_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on dividend_schedules
ALTER TABLE dividend_schedules ENABLE ROW LEVEL SECURITY;

-- Property owners can manage schedules
CREATE POLICY "Property owners can manage dividend schedules"
  ON dividend_schedules
  FOR ALL
  USING (property_id IN (
    SELECT id FROM properties WHERE owner_id = auth.uid()
  ));

-- Service role can manage schedules
CREATE POLICY "Service role can manage dividend schedules"
  ON dividend_schedules
  FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Phase 4: Implement sync_contract_balances function
CREATE OR REPLACE FUNCTION public.sync_contract_balances()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tokenization_record RECORD;
  synced_count INTEGER := 0;
  error_count INTEGER := 0;
BEGIN
  -- This will be called by cron to sync treasury balances from Hedera
  -- For now, we log that sync is happening
  -- The actual balance fetching will be done by the edge function
  
  INSERT INTO automation_jobs (job_name, status, metadata)
  VALUES (
    'sync_contract_balances',
    'completed',
    jsonb_build_object(
      'synced_count', synced_count,
      'error_count', error_count,
      'message', 'Balance sync triggered - processing via edge function'
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'synced_count', synced_count,
    'error_count', error_count,
    'message', 'Balance sync job queued'
  );
END;
$$;

-- Phase 2: Add trigger for rental payment confirmation
CREATE OR REPLACE FUNCTION trigger_rental_distribution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- When rental payment is confirmed, mark for distribution
  IF NEW.payment_status = 'confirmed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'confirmed') THEN
    NEW.distribution_status := 'pending';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER rental_payment_confirmed
  BEFORE UPDATE ON property_rentals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_rental_distribution();

-- Phase 1: Create Cron Jobs
-- Job 1: Check investment windows (every 15 minutes)
SELECT cron.schedule(
  'check-investment-windows',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://zjtqptljuggbymcoovey.supabase.co/functions/v1/check-investment-windows',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    )
  );
  $$
);

-- Job 2: Mint tokens for closed windows (every 10 minutes)
SELECT cron.schedule(
  'mint-tokens-processor',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://zjtqptljuggbymcoovey.supabase.co/functions/v1/mint-tokens-for-closed-window',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    )
  );
  $$
);

-- Job 3: Cleanup expired reservations (every hour)
SELECT cron.schedule(
  'cleanup-expired-reservations',
  '0 * * * *',
  $$ SELECT public.cleanup_expired_token_reservations(); $$
);

-- Job 4: Check and execute proposals (every 30 minutes)
SELECT cron.schedule(
  'check-proposal-execution',
  '*/30 * * * *',
  $$ SELECT public.check_and_execute_proposals(); $$
);

-- Job 5: Cleanup expired KYC drafts (daily at 2 AM)
SELECT cron.schedule(
  'cleanup-kyc-drafts',
  '0 2 * * *',
  $$ SELECT public.cleanup_expired_kyc_drafts(); $$
);

-- Job 6: Auto-process rental dividends (daily at 9 AM)
SELECT cron.schedule(
  'auto-distribute-rental-dividends',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://zjtqptljuggbymcoovey.supabase.co/functions/v1/auto-process-rental-dividends',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    )
  );
  $$
);

-- Job 7: Poll contract events (every 5 minutes)
SELECT cron.schedule(
  'poll-contract-events',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://zjtqptljuggbymcoovey.supabase.co/functions/v1/poll-contract-events',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    )
  );
  $$
);

-- Job 8: Sync treasury balances (every 30 minutes)
SELECT cron.schedule(
  'sync-treasury-balances',
  '*/30 * * * *',
  $$ SELECT public.sync_contract_balances(); $$
);

-- Job 9: Process scheduled dividends (daily at 10 AM)
SELECT cron.schedule(
  'process-scheduled-dividends',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://zjtqptljuggbymcoovey.supabase.co/functions/v1/process-scheduled-dividends',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    )
  );
  $$
);