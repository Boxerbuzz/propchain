-- Phase 2: Database Schema Updates for Smart Contract Integration

-- Create smart_contract_config table
CREATE TABLE IF NOT EXISTS smart_contract_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_name TEXT NOT NULL UNIQUE,
  contract_address TEXT NOT NULL,
  deployment_network TEXT NOT NULL,
  contract_version TEXT NOT NULL,
  abi JSONB NOT NULL,
  deployed_at TIMESTAMP NOT NULL,
  deployed_by UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE smart_contract_config IS 'Stores deployed smart contract addresses and configurations';

-- Create smart_contract_transactions table
CREATE TABLE IF NOT EXISTS smart_contract_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_name TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  function_name TEXT NOT NULL,
  transaction_hash TEXT NOT NULL UNIQUE,
  transaction_status TEXT DEFAULT 'pending',
  block_number BIGINT,
  gas_used BIGINT,
  user_id UUID,
  property_id UUID REFERENCES properties(id),
  tokenization_id UUID REFERENCES tokenizations(id),
  related_id UUID,
  related_type TEXT,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP
);

COMMENT ON TABLE smart_contract_transactions IS 'Tracks all smart contract transactions';

-- Create indexes for smart_contract_transactions
CREATE INDEX IF NOT EXISTS idx_sc_tx_hash ON smart_contract_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_sc_tx_status ON smart_contract_transactions(transaction_status);
CREATE INDEX IF NOT EXISTS idx_sc_tx_related ON smart_contract_transactions(related_id, related_type);
CREATE INDEX IF NOT EXISTS idx_sc_tx_user ON smart_contract_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_sc_tx_property ON smart_contract_transactions(property_id);

-- Update governance_proposals table
ALTER TABLE governance_proposals 
ADD COLUMN IF NOT EXISTS contract_proposal_id TEXT,
ADD COLUMN IF NOT EXISTS contract_registered_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS contract_transaction_hash TEXT,
ADD COLUMN IF NOT EXISTS funds_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS funds_locked_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS funds_released BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS funds_released_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS execution_contract_tx TEXT;

COMMENT ON COLUMN governance_proposals.contract_proposal_id IS 'On-chain proposal ID (bytes32)';

-- Update dividend_distributions table
ALTER TABLE dividend_distributions 
ADD COLUMN IF NOT EXISTS contract_distribution_id TEXT,
ADD COLUMN IF NOT EXISTS contract_created_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS contract_transaction_hash TEXT,
ADD COLUMN IF NOT EXISTS snapshot_block_number BIGINT,
ADD COLUMN IF NOT EXISTS total_claimed_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS unclaimed_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP;

COMMENT ON COLUMN dividend_distributions.contract_distribution_id IS 'On-chain distribution ID';

-- Update tokenizations table
ALTER TABLE tokenizations 
ADD COLUMN IF NOT EXISTS escrow_contract_address TEXT,
ADD COLUMN IF NOT EXISTS escrow_created_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS escrow_finalized_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS multisig_treasury_address TEXT,
ADD COLUMN IF NOT EXISTS multisig_signers JSONB,
ADD COLUMN IF NOT EXISTS multisig_threshold INTEGER DEFAULT 2;

COMMENT ON COLUMN tokenizations.escrow_contract_address IS 'Address of escrow smart contract';
COMMENT ON COLUMN tokenizations.multisig_treasury_address IS 'Address of multi-sig treasury contract';

-- RLS policies for smart_contract_config
ALTER TABLE smart_contract_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active contracts"
  ON smart_contract_config FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Service role can manage contract config"
  ON smart_contract_config FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- RLS policies for smart_contract_transactions
ALTER TABLE smart_contract_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contract transactions"
  ON smart_contract_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Property owners can view property transactions"
  ON smart_contract_transactions FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage contract transactions"
  ON smart_contract_transactions FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);