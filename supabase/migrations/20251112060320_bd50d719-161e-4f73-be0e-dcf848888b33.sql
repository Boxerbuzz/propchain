-- Phase 2: Race Condition Mitigations
-- Add last_distribution_at timestamp for cooldown tracking
ALTER TABLE tokenizations
ADD COLUMN IF NOT EXISTS last_distribution_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster cooldown checks
CREATE INDEX IF NOT EXISTS idx_tokenizations_last_distribution 
ON tokenizations(last_distribution_at);

-- Create function to get investments with row-level locking (SELECT FOR UPDATE SKIP LOCKED)
CREATE OR REPLACE FUNCTION get_investments_for_distribution(
  p_tokenization_id UUID,
  p_target_user_ids UUID[] DEFAULT NULL
)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_investment_ids UUID[];
BEGIN
  -- Select investments with row-level locks, skip already locked rows
  -- This prevents race conditions when multiple processes try to distribute tokens
  IF p_target_user_ids IS NOT NULL AND array_length(p_target_user_ids, 1) > 0 THEN
    -- Filter by specific users (for remediation/reconciliation)
    SELECT array_agg(id)
    INTO v_investment_ids
    FROM investments
    WHERE tokenization_id = p_tokenization_id
      AND payment_status = 'confirmed'
      AND investor_id = ANY(p_target_user_ids)
    FOR UPDATE SKIP LOCKED;
  ELSE
    -- Get all confirmed investments
    SELECT array_agg(id)
    INTO v_investment_ids
    FROM investments
    WHERE tokenization_id = p_tokenization_id
      AND payment_status = 'confirmed'
    FOR UPDATE SKIP LOCKED;
  END IF;

  RETURN COALESCE(v_investment_ids, ARRAY[]::UUID[]);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_investments_for_distribution TO service_role;
GRANT EXECUTE ON FUNCTION get_investments_for_distribution TO authenticated;