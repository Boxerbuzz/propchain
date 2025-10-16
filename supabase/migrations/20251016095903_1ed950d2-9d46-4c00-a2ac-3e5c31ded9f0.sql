-- ============================================
-- PROPERTY TREASURY SYSTEM
-- ============================================

-- Add treasury columns to tokenizations table
ALTER TABLE tokenizations 
ADD COLUMN IF NOT EXISTS treasury_account_id TEXT,
ADD COLUMN IF NOT EXISTS treasury_account_private_key_vault_id UUID,
ADD COLUMN IF NOT EXISTS treasury_balance_hbar NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS treasury_balance_usdc NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS treasury_balance_ngn NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS treasury_created_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS total_revenue_received_ngn NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_revenue_received_usdc NUMERIC DEFAULT 0;

-- Create property treasury transactions table
CREATE TABLE IF NOT EXISTS property_treasury_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tokenization_id UUID REFERENCES tokenizations(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'dividend_payout', 'maintenance_payment', 'platform_fee')),
  source_type TEXT NOT NULL CHECK (source_type IN ('rental', 'purchase', 'platform_transfer', 'external', 'mock_event')),
  source_event_id UUID,
  amount_ngn NUMERIC NOT NULL,
  amount_usdc NUMERIC,
  exchange_rate NUMERIC,
  hedera_transaction_id TEXT,
  paystack_reference TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_by UUID
);

-- Enable RLS on property_treasury_transactions
ALTER TABLE property_treasury_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_treasury_transactions
CREATE POLICY "Property owners can view treasury transactions"
ON property_treasury_transactions
FOR SELECT
USING (
  property_id IN (
    SELECT id FROM properties WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage treasury transactions"
ON property_treasury_transactions
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_treasury_transactions_property_id ON property_treasury_transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_treasury_transactions_tokenization_id ON property_treasury_transactions(tokenization_id);
CREATE INDEX IF NOT EXISTS idx_treasury_transactions_status ON property_treasury_transactions(status);
CREATE INDEX IF NOT EXISTS idx_treasury_transactions_created_at ON property_treasury_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tokenizations_treasury_account_id ON tokenizations(treasury_account_id) WHERE treasury_account_id IS NOT NULL;