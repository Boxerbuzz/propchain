
-- Fix inconsistent token distribution status
-- Update investments where tokens are already in wallet but status is still 'confirmed'

UPDATE investments i
SET 
  payment_status = 'tokens_distributed',
  updated_at = NOW()
FROM token_holdings th
WHERE 
  i.investor_id = th.user_id 
  AND i.tokenization_id = th.tokenization_id
  AND i.payment_status = 'confirmed'
  AND th.balance >= i.tokens_requested
  AND i.tokens_allocated > 0;

-- Log this fix
INSERT INTO activity_logs (
  user_id,
  activity_type,
  activity_category,
  description,
  metadata
)
SELECT 
  i.investor_id,
  'investment_status_fix',
  'system_correction',
  'Investment status corrected from confirmed to tokens_distributed',
  jsonb_build_object(
    'investment_id', i.id,
    'tokens_requested', i.tokens_requested,
    'reason', 'Tokens already distributed on-chain but status not updated'
  )
FROM investments i
INNER JOIN token_holdings th ON i.investor_id = th.user_id AND i.tokenization_id = th.tokenization_id
WHERE 
  i.payment_status = 'confirmed'
  AND th.balance >= i.tokens_requested
  AND i.tokens_allocated > 0;
