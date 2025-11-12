-- Create token_distribution_events table for audit trail
CREATE TABLE IF NOT EXISTS public.token_distribution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tokenization_id UUID NOT NULL REFERENCES tokenizations(id) ON DELETE CASCADE,
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tokens_distributed BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, success, failed
  error_message TEXT,
  hedera_transaction_id TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create distribution_locks table for concurrency control
CREATE TABLE IF NOT EXISTS public.distribution_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tokenization_id UUID NOT NULL REFERENCES tokenizations(id) ON DELETE CASCADE,
  locked_by TEXT NOT NULL, -- Process/function identifier
  is_locked BOOLEAN NOT NULL DEFAULT TRUE,
  locked_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  released_at TIMESTAMP WITHOUT TIME ZONE,
  UNIQUE(tokenization_id, is_locked)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_distribution_events_tokenization 
  ON token_distribution_events(tokenization_id);
CREATE INDEX IF NOT EXISTS idx_distribution_events_investment 
  ON token_distribution_events(investment_id);
CREATE INDEX IF NOT EXISTS idx_distribution_events_status 
  ON token_distribution_events(status);
CREATE INDEX IF NOT EXISTS idx_distribution_events_created 
  ON token_distribution_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_distribution_locks_tokenization 
  ON distribution_locks(tokenization_id);
CREATE INDEX IF NOT EXISTS idx_distribution_locks_status 
  ON distribution_locks(is_locked) WHERE is_locked = TRUE;

-- Enable RLS
ALTER TABLE public.token_distribution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_locks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for token_distribution_events
CREATE POLICY "Service role can manage distribution events"
  ON public.token_distribution_events
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Users can view their own distribution events"
  ON public.token_distribution_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for distribution_locks
CREATE POLICY "Service role can manage distribution locks"
  ON public.distribution_locks
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Authenticated users can view distribution locks"
  ON public.distribution_locks
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create view for easy monitoring
CREATE OR REPLACE VIEW distribution_monitoring_summary AS
SELECT 
  t.id AS tokenization_id,
  t.token_symbol,
  t.token_name,
  t.status,
  t.last_distribution_at,
  COUNT(DISTINCT de.id) FILTER (WHERE de.created_at > NOW() - INTERVAL '24 hours') AS distributions_24h,
  COUNT(DISTINCT de.id) FILTER (WHERE de.status = 'failed' AND de.created_at > NOW() - INTERVAL '24 hours') AS failures_24h,
  EXISTS(SELECT 1 FROM distribution_locks dl WHERE dl.tokenization_id = t.id AND dl.is_locked = TRUE) AS is_locked
FROM tokenizations t
LEFT JOIN token_distribution_events de ON de.tokenization_id = t.id
WHERE t.status IN ('active', 'minted', 'distributed')
GROUP BY t.id, t.token_symbol, t.token_name, t.status, t.last_distribution_at;
