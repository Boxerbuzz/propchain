
-- Revert incorrectly marked token distributions
-- These users never received tokens on-chain but were marked as distributed

UPDATE investments
SET 
  payment_status = 'confirmed',
  updated_at = NOW()
WHERE investor_id IN (
  '0900972f-8903-4b8c-99e2-b9a5ca5e31bc', -- 0.0.6974643
  'b8956f7a-7c1d-4201-a2f3-7c4559176871'  -- 0.0.7158111
)
AND tokenization_id IN (
  SELECT id FROM tokenizations WHERE token_symbol = 'RCCT'
)
AND payment_status = 'tokens_distributed';

-- Log the reversion
INSERT INTO activity_logs (
  user_id,
  activity_type,
  activity_category,
  description,
  metadata,
  tokenization_id
)
SELECT
  investor_id,
  'investment_status_revert',
  'system_correction',
  'Reverted status from tokens_distributed to confirmed - tokens were never distributed on-chain',
  jsonb_build_object(
    'investment_id', id,
    'tokens_requested', tokens_requested,
    'reason', 'On-chain verification shows no token transfer occurred'
  ),
  tokenization_id
FROM investments
WHERE investor_id IN (
  '0900972f-8903-4b8c-99e2-b9a5ca5e31bc',
  'b8956f7a-7c1d-4201-a2f3-7c4559176871'
)
AND tokenization_id IN (
  SELECT id FROM tokenizations WHERE token_symbol = 'RCCT'
);
