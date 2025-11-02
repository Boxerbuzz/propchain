-- ============================================
-- FIX DATA INTEGRITY ISSUES
-- Date: 2025-01-11
-- ============================================

-- 1. Add unique constraint for dividend_schedules to fix upsert 400 errors
CREATE UNIQUE INDEX IF NOT EXISTS ux_dividend_schedules_tokenization_id 
ON dividend_schedules(tokenization_id);

-- 2. Revert incorrectly marked 'tokens_distributed' investments
-- Only revert those without successful distribution events
UPDATE investments
SET 
  payment_status = 'confirmed',
  updated_at = NOW()
WHERE 
  payment_status = 'tokens_distributed'
  AND NOT EXISTS (
    SELECT 1 FROM token_distribution_events tde
    WHERE tde.user_id = investments.investor_id
      AND tde.tokenization_id = investments.tokenization_id
      AND tde.status = 'success'
  );

-- 3. Log the repair activity
INSERT INTO activity_logs (
  user_id,
  activity_type,
  description,
  metadata,
  created_at
)
SELECT DISTINCT
  investor_id,
  'data_repair',
  'Investment status reverted from tokens_distributed to confirmed for proper distribution',
  jsonb_build_object(
    'investment_id', id,
    'tokenization_id', tokenization_id,
    'reason', 'No distribution event found',
    'repair_date', NOW()
  ),
  NOW()
FROM investments
WHERE payment_status = 'confirmed'
  AND updated_at >= NOW() - INTERVAL '1 minute';

-- 4. Add payment_status enum to ensure data integrity going forward
-- (Optional - only if not already constrained)
-- ALTER TABLE investments
-- ADD CONSTRAINT check_payment_status
-- CHECK (payment_status IN ('pending', 'confirmed', 'failed', 'refunded', 'tokens_distributed', 'pending_reconciliation'));
