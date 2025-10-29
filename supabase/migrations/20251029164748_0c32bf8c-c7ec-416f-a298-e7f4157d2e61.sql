-- Phase 3: Add tracking columns for crypto payments and refunds
ALTER TABLE investments
ADD COLUMN IF NOT EXISTS crypto_amount_paid NUMERIC,
ADD COLUMN IF NOT EXISTS crypto_currency TEXT CHECK (crypto_currency IN ('HBAR', 'USDC')),
ADD COLUMN IF NOT EXISTS payment_tx_id TEXT,
ADD COLUMN IF NOT EXISTS refund_tx_reference TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITHOUT TIME ZONE;

-- Backfill payment_method for existing records
UPDATE investments
SET payment_method = CASE
  WHEN paystack_reference IS NOT NULL THEN 'paystack'
  ELSE 'wallet'
END
WHERE payment_method IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_investments_payment_method ON investments(payment_method);
CREATE INDEX IF NOT EXISTS idx_investments_payment_tx_id ON investments(payment_tx_id);

-- Add comments for documentation
COMMENT ON COLUMN investments.crypto_amount_paid IS 'Actual HBAR or USDC amount paid for wallet payments';
COMMENT ON COLUMN investments.crypto_currency IS 'Cryptocurrency used: HBAR or USDC';
COMMENT ON COLUMN investments.payment_tx_id IS 'Hedera transaction ID for wallet payments';
COMMENT ON COLUMN investments.refund_tx_reference IS 'Paystack refund ID or Hedera refund transaction ID';
COMMENT ON COLUMN investments.refunded_at IS 'Timestamp when refund was processed';