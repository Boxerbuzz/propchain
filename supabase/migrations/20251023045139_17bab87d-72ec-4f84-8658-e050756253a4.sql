-- Unschedule the immediate per-rental dividend distribution cron job
SELECT cron.unschedule('auto-distribute-rental-dividends');

-- Add traceability columns to dividend_distributions for better audit trail
ALTER TABLE dividend_distributions
  ADD COLUMN IF NOT EXISTS included_rental_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS gross_amount_ngn NUMERIC,
  ADD COLUMN IF NOT EXISTS platform_fee_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS management_fee_amount NUMERIC;

COMMENT ON COLUMN dividend_distributions.included_rental_ids IS 'Array of rental IDs included in this aggregated distribution';
COMMENT ON COLUMN dividend_distributions.gross_amount_ngn IS 'Total rental income before fees';
COMMENT ON COLUMN dividend_distributions.platform_fee_amount IS 'Platform fee deducted';
COMMENT ON COLUMN dividend_distributions.management_fee_amount IS 'Management fee deducted';