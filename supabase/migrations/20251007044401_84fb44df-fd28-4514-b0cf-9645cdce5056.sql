-- Phase 1: Wallet Withdrawal System
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE NOT NULL,
  amount_ngn NUMERIC NOT NULL CHECK (amount_ngn > 0),
  amount_usd NUMERIC,
  withdrawal_method TEXT NOT NULL CHECK (withdrawal_method IN ('bank_transfer', 'hedera', 'usdc')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Bank details (if bank_transfer)
  bank_account_number TEXT,
  bank_account_name TEXT,
  bank_name TEXT,
  bank_code TEXT,
  
  -- Hedera details (if hedera/usdc)
  recipient_hedera_account TEXT,
  hedera_transaction_id TEXT,
  
  -- Processing info
  processing_fee_ngn NUMERIC DEFAULT 0,
  net_amount_ngn NUMERIC,
  processed_at TIMESTAMP,
  processed_by UUID REFERENCES users(id),
  failure_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on withdrawal_requests
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for withdrawal_requests
CREATE POLICY "Users can view own withdrawals" 
ON withdrawal_requests FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create withdrawals" 
ON withdrawal_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own pending withdrawals" 
ON withdrawal_requests FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Service role can manage all withdrawals" 
ON withdrawal_requests FOR ALL 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Add withdrawal limits to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_withdrawal_limit_ngn NUMERIC DEFAULT 1000000;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_withdrawal_limit_ngn NUMERIC DEFAULT 5000000;

-- Phase 2: Rental Income Distribution System
-- Add distribution tracking to property_rentals
ALTER TABLE property_rentals ADD COLUMN IF NOT EXISTS distribution_status TEXT DEFAULT 'pending' CHECK (distribution_status IN ('pending', 'processing', 'completed', 'failed'));
ALTER TABLE property_rentals ADD COLUMN IF NOT EXISTS distributed_at TIMESTAMP;
ALTER TABLE property_rentals ADD COLUMN IF NOT EXISTS distribution_id UUID REFERENCES dividend_distributions(id);

-- Create index for faster dividend queries
CREATE INDEX IF NOT EXISTS idx_dividend_payments_recipient ON dividend_payments(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_holdings_user ON token_holdings(user_id, property_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_status ON withdrawal_requests(user_id, status, created_at DESC);

-- Phase 3: USDC Integration
-- Add USDC preference to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS usdc_associated BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_convert_to_usdc BOOLEAN DEFAULT false;

-- Add USDC balance tracking to wallets
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS balance_usdc NUMERIC DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS usdc_token_association_tx TEXT;