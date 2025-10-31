-- Create token distribution events table for observability
CREATE TABLE IF NOT EXISTS public.token_distribution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tokenization_id UUID NOT NULL REFERENCES public.tokenizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  investment_id UUID REFERENCES public.investments(id) ON DELETE SET NULL,
  
  -- Distribution attempt details
  attempt_number INTEGER NOT NULL DEFAULT 1,
  tokens_requested BIGINT NOT NULL,
  tokens_transferred BIGINT NOT NULL DEFAULT 0,
  
  -- Status tracking
  status TEXT NOT NULL CHECK (status IN ('success', 'skipped', 'failed', 'pending')),
  skip_reason TEXT,
  error_message TEXT,
  
  -- Hedera transaction details
  hedera_account_id TEXT,
  association_tx_id TEXT,
  kyc_grant_tx_id TEXT,
  transfer_tx_id TEXT,
  
  -- Timestamps
  attempted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITHOUT TIME ZONE,
  
  -- Additional context
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_token_distribution_events_tokenization ON public.token_distribution_events(tokenization_id);
CREATE INDEX idx_token_distribution_events_user ON public.token_distribution_events(user_id);
CREATE INDEX idx_token_distribution_events_status ON public.token_distribution_events(status);
CREATE INDEX idx_token_distribution_events_attempted_at ON public.token_distribution_events(attempted_at DESC);

-- RLS policies
ALTER TABLE public.token_distribution_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage distribution events"
  ON public.token_distribution_events
  FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Users can view their own distribution events"
  ON public.token_distribution_events
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Property owners can view distribution events"
  ON public.token_distribution_events
  FOR SELECT
  USING (
    tokenization_id IN (
      SELECT t.id 
      FROM tokenizations t
      JOIN properties p ON t.property_id = p.id
      WHERE p.owner_id = auth.uid()
    )
  );

-- Create distribution lock table to prevent concurrent runs
CREATE TABLE IF NOT EXISTS public.token_distribution_locks (
  tokenization_id UUID PRIMARY KEY REFERENCES public.tokenizations(id) ON DELETE CASCADE,
  locked_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  locked_by TEXT NOT NULL,
  expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes')
);

-- RLS for locks
ALTER TABLE public.token_distribution_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage distribution locks"
  ON public.token_distribution_locks
  FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);