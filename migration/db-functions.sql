-- Reserve tokens with timeout (atomic operation)
CREATE OR REPLACE FUNCTION public.reserve_tokens_with_timeout(
  p_investment_id UUID,
  p_tokenization_id UUID,
  p_tokens_requested BIGINT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
AS $$
DECLARE
  v_tokenization RECORD;
  v_available_tokens BIGINT;
  v_result JSON;
BEGIN
  -- Lock the tokenization row to prevent race conditions
  SELECT * INTO v_tokenization
  FROM tokenizations
  WHERE id = p_tokenization_id
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Delete the investment record since tokenization doesn't exist
    DELETE FROM investments WHERE id = p_investment_id;
    RETURN '{"success": false, "error": "Tokenization not found"}';
  END IF;

  -- Check if tokenization is still active
  IF v_tokenization.status != 'active' THEN
    DELETE FROM investments WHERE id = p_investment_id;
    RETURN '{"success": false, "error": "Investment window closed"}';
  END IF;

  -- Calculate available tokens
  v_available_tokens := v_tokenization.total_supply - v_tokenization.tokens_sold;

  IF p_tokens_requested > v_available_tokens THEN
    -- Cancel the investment record
    DELETE FROM investments WHERE id = p_investment_id;
    RETURN '{"success": false, "error": "Not enough tokens available"}';
  END IF;

  -- Reserve the tokens
  UPDATE tokenizations
  SET 
    tokens_sold = tokens_sold + p_tokens_requested,
    updated_at = NOW()
  WHERE id = p_tokenization_id;

  RETURN json_build_object(
    'success', true,
    'tokens_reserved', p_tokens_requested,
    'available_tokens', v_available_tokens - p_tokens_requested
  );
END;
$$;

-- Release expired reservations
CREATE OR REPLACE FUNCTION public.release_expired_reservation(
  p_investment_id UUID,
  p_tokenization_id UUID,
  p_tokens_to_release BIGINT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
AS $$
DECLARE
  -- Ensure that the function operates on the public schema
BEGIN
  -- Update investment status to expired
  UPDATE investments
  SET 
    reservation_status = 'expired',
    updated_at = NOW()
  WHERE id = p_investment_id
    AND reservation_status = 'active'
    AND payment_status = 'pending';

  -- Release tokens back to available pool
  UPDATE tokenizations
  SET 
    tokens_sold = tokens_sold - p_tokens_to_release,
    updated_at = NOW()
  WHERE id = p_tokenization_id;

  -- Log the cleanup activity
  INSERT INTO activity_logs (
    user_id,
    activity_type,
    description,
    metadata,
    created_at
  )
  SELECT 
    investor_id,
    'reservation_expired',
    'Token reservation expired and released',
    json_build_object('tokens_released', p_tokens_to_release),
    NOW()
  FROM investments
  WHERE id = p_investment_id;
END;
$$;

-- Cleanup expired reservations for a property
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations_for_property(
  p_property_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
AS $$
DECLARE
  cleaned_count INTEGER := 0;
  expired_reservation RECORD;
BEGIN
  FOR expired_reservation IN 
    SELECT i.* FROM investments i
    JOIN tokenizations t ON i.tokenization_id = t.id
    WHERE t.property_id = p_property_id
      AND i.reservation_status = 'active'
      AND i.payment_status = 'pending'
      AND i.reservation_expires_at < NOW()
  LOOP
    PERFORM release_expired_reservation(
      expired_reservation.id,
      expired_reservation.tokenization_id,
      expired_reservation.tokens_requested
    );
    cleaned_count := cleaned_count + 1;
  END LOOP;
  
  RETURN cleaned_count;
END;
$$;


-- Create investment with reservation
CREATE OR REPLACE FUNCTION public.create_investment_with_reservation(
  p_tokenization_id UUID,
  p_investor_id UUID,
  p_amount_ngn DECIMAL,
  p_tokens_requested BIGINT,
  p_reservation_minutes INTEGER DEFAULT 15
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
AS $$
DECLARE
  -- Ensure that the function operates on the public schema
  
  v_investment_id UUID;
  v_reservation_result JSON;
  v_expires_at TIMESTAMP;
BEGIN
  -- Calculate reservation expiry
  v_expires_at := NOW() + (p_reservation_minutes || ' minutes')::INTERVAL;

  -- Create investment record
  INSERT INTO investments (
    tokenization_id,
    investor_id,
    amount_ngn,
    tokens_requested,
    tokens_allocated,
    payment_status,
    reservation_status,
    reservation_expires_at,
    created_at,
    updated_at
  )
  VALUES (
    p_tokenization_id,
    p_investor_id,
    p_amount_ngn,
    p_tokens_requested,
    0,
    'pending',
    'active',
    v_expires_at,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_investment_id;

  -- Reserve tokens atomically
  SELECT reserve_tokens_with_timeout(
    v_investment_id,
    p_tokenization_id,
    p_tokens_requested
  ) INTO v_reservation_result;

  -- Return result
  RETURN json_build_object(
    'success', (v_reservation_result->>'success')::boolean,
    'investment_id', v_investment_id,
    'reservation_expires_at', v_expires_at,
    'tokens_reserved', p_tokens_requested,
    'error', v_reservation_result->>'error'
  );
END;
$$;

-- Update tokenization stats after payment
CREATE OR REPLACE FUNCTION public.increment_tokenization_raise(
  p_investment_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
AS $$ 
DECLARE
  -- Ensure that the function operates on the public schema
  
  v_investment RECORD;
BEGIN
  SELECT i.amount_ngn, i.tokenization_id, i.payment_status
  INTO v_investment
  FROM investments i
  WHERE i.id = p_investment_id;
  
  IF FOUND AND v_investment.payment_status = 'confirmed' THEN
    UPDATE tokenizations
    SET 
      current_raise = current_raise + v_investment.amount_ngn,
      investor_count = investor_count + 1,
      updated_at = NOW()
    WHERE id = v_investment.tokenization_id;
  END IF;
END;
$$;

-- Upsert token holdings
CREATE OR REPLACE FUNCTION public.upsert_token_holdings(
  p_user_id UUID,
  p_tokenization_id UUID,
  p_property_id UUID,
  p_token_id TEXT,
  p_tokens_to_add BIGINT,
  p_amount_invested DECIMAL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
AS $$
DECLARE
  -- Ensure that the function operates on the public schema
BEGIN
  INSERT INTO token_holdings (
    user_id,
    tokenization_id,
    property_id,
    token_id,
    balance,
    total_invested_ngn,
    acquisition_date,
    updated_at
  )
  VALUES (
    p_user_id,
    p_tokenization_id,
    p_property_id,
    p_token_id,
    p_tokens_to_add,
    p_amount_invested,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id, tokenization_id)
  DO UPDATE SET
    balance = token_holdings.balance + p_tokens_to_add,
    total_invested_ngn = token_holdings.total_invested_ngn + p_amount_invested,
    updated_at = NOW();
END;
$$;

-- Get user's voting power for a property
CREATE OR REPLACE FUNCTION public.get_user_voting_power(
  p_user_id UUID,
  p_property_id UUID
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
AS $$
DECLARE
  -- Ensure that the function operates on the public schema
  
  v_total_tokens BIGINT := 0;
BEGIN
  SELECT COALESCE(SUM(balance), 0)
  INTO v_total_tokens
  FROM token_holdings
  WHERE user_id = p_user_id
    AND property_id = p_property_id;
    
  RETURN v_total_tokens;
END;
$$;



-- Create chat room for tokenization
CREATE OR REPLACE FUNCTION public.create_chat_room_for_tokenization(
  p_tokenization_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
AS $$
DECLARE
  -- Ensure that the function operates on the public schema
  
  v_room_id UUID;
  v_tokenization RECORD;
BEGIN
  -- Get tokenization and property details
  SELECT t.*, p.title, p.id as property_id
  INTO v_tokenization
  FROM tokenizations t
  JOIN properties p ON t.property_id = p.id
  WHERE t.id = p_tokenization_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tokenization not found';
  END IF;

  -- Check if chat room already exists
  SELECT id INTO v_room_id
  FROM chat_rooms
  WHERE tokenization_id = p_tokenization_id;

  IF FOUND THEN
    RETURN v_room_id;
  END IF;

  -- Create new chat room
  INSERT INTO chat_rooms (
    property_id,
    tokenization_id,
    name,
    description,
    room_type,
    auto_join_investors,
    ai_assistant_enabled,
    created_at,
    updated_at
  )
  VALUES (
    v_tokenization.property_id,
    p_tokenization_id,
    v_tokenization.title || ' Investors',
    'Discussion room for ' || v_tokenization.title || ' token holders',
    'investment',
    true,
    true,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_room_id;

  RETURN v_room_id;
END;
$$;

-- Add user to chat room
CREATE OR REPLACE FUNCTION public.add_user_to_chat_room(
  p_room_id UUID,
  p_user_id UUID,
  p_voting_power BIGINT DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
AS $$
DECLARE
  -- Ensure that the function operates on the public schema
  
BEGIN
  INSERT INTO chat_participants (
    room_id,
    user_id,
    role,
    voting_power,
    joined_at
  )
  VALUES (
    p_room_id,
    p_user_id,
    'member',
    p_voting_power,
    NOW()
  )
  ON CONFLICT (room_id, user_id) 
  DO UPDATE SET
    voting_power = p_voting_power,
    last_seen_at = NOW();
END;
$$;


-- Create governance proposal
CREATE OR REPLACE FUNCTION public.create_governance_proposal(
  p_property_id UUID,
  p_tokenization_id UUID,
  p_proposer_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_proposal_type TEXT,
  p_budget_ngn DECIMAL,
  p_voting_period_days INTEGER DEFAULT 7
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
AS $$
DECLARE
  -- Ensure that the function operates on the public schema
  
  v_proposal_id UUID;
  v_voting_start TIMESTAMP := NOW();
  v_voting_end TIMESTAMP;
BEGIN
  v_voting_end := v_voting_start + (p_voting_period_days || ' days')::INTERVAL;

  INSERT INTO governance_proposals (
    property_id,
    tokenization_id,
    proposer_id,
    title,
    description,
    proposal_type,
    budget_ngn,
    voting_start,
    voting_end,
    status,
    created_at,
    updated_at
  )
  VALUES (
    p_property_id,
    p_tokenization_id,
    p_proposer_id,
    p_title,
    p_description,
    p_proposal_type,
    p_budget_ngn,
    v_voting_start,
    v_voting_end,
    'active',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_proposal_id;

  RETURN v_proposal_id;
END;
$$;

-- Cast vote on proposal
CREATE OR REPLACE FUNCTION public.cast_vote(
  p_proposal_id UUID,
  p_voter_id UUID,
  p_vote_choice TEXT,
  p_voting_power BIGINT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
AS $$
DECLARE
  -- Ensure that the function operates on the public schema
  v_proposal RECORD;
BEGIN
  -- Check if proposal exists and is active
  SELECT * INTO v_proposal
  FROM governance_proposals
  WHERE id = p_proposal_id
    AND status = 'active'
    AND NOW() BETWEEN voting_start AND voting_end;

  IF NOT FOUND THEN
    RETURN '{"success": false, "error": "Proposal not found or voting closed"}';
  END IF;

  -- Insert/update vote
  INSERT INTO votes (
    proposal_id,
    voter_id,
    vote_choice,
    voting_power,
    cast_at
  )
  VALUES (
    p_proposal_id,
    p_voter_id,
    p_vote_choice,
    p_voting_power,
    NOW()
  )
  ON CONFLICT (proposal_id, voter_id)
  DO UPDATE SET
    vote_choice = p_vote_choice,
    voting_power = p_voting_power,
    cast_at = NOW();

  -- Update proposal vote counts
  UPDATE governance_proposals
  SET
    total_votes_cast = (
      SELECT COALESCE(SUM(voting_power), 0)
      FROM votes
      WHERE proposal_id = p_proposal_id
    ),
    votes_for = (
      SELECT COALESCE(SUM(voting_power), 0)
      FROM votes
      WHERE proposal_id = p_proposal_id AND vote_choice = 'for'
    ),
    votes_against = (
      SELECT COALESCE(SUM(voting_power), 0)
      FROM votes
      WHERE proposal_id = p_proposal_id AND vote_choice = 'against'
    ),
    votes_abstain = (
      SELECT COALESCE(SUM(voting_power), 0)
      FROM votes
      WHERE proposal_id = p_proposal_id AND vote_choice = 'abstain'
    ),
    updated_at = NOW()
  WHERE id = p_proposal_id;

  RETURN '{"success": true, "message": "Vote cast successfully"}';
END;
$$;


-- 1. Auto-log investment status changes
CREATE OR REPLACE FUNCTION log_investment_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure that the function operates on the public schema
  SET search_path = public, pg_temp;
  -- Log payment status changes
  IF TG_OP = 'UPDATE' AND OLD.payment_status != NEW.payment_status THEN
    INSERT INTO activity_logs (
      user_id,
      activity_type,
      description,
      metadata,
      created_at
    ) VALUES (
      NEW.investor_id,
      'investment_status_change',
      'Investment status changed from ' || OLD.payment_status || ' to ' || NEW.payment_status,
      json_build_object(
        'investment_id', NEW.id,
        'old_status', OLD.payment_status,
        'new_status', NEW.payment_status,
        'amount_ngn', NEW.amount_ngn
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER investment_activity_trigger
  AFTER UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION log_investment_activity();

-- 2. Auto-update tokenization investor count
CREATE OR REPLACE FUNCTION update_tokenization_investor_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure that the function operates on the public schema
  SET search_path = public, pg_temp;
  -- When payment status changes to confirmed
  IF TG_OP = 'UPDATE' AND OLD.payment_status = 'pending' AND NEW.payment_status = 'confirmed' THEN
    -- This is handled by the manual increment_tokenization_raise function
    -- to ensure proper error handling and external API coordination
    NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Auto-update voting power in chat rooms
CREATE OR REPLACE FUNCTION update_chat_voting_power()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure that the function operates on the public schema
  SET search_path = public, pg_temp;
  -- Update voting power when token holdings change
  IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
    UPDATE chat_participants
    SET voting_power = NEW.balance
    WHERE user_id = NEW.user_id
      AND room_id IN (
        SELECT id FROM chat_rooms 
        WHERE tokenization_id = NEW.tokenization_id
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_voting_power_trigger
  AFTER INSERT OR UPDATE ON token_holdings
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_voting_power();

-- 4. Auto-expire proposals
CREATE OR REPLACE FUNCTION check_proposal_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure that the function operates on the public schema
  SET search_path = public, pg_temp;
  -- Auto-expire proposals when voting period ends
  IF NEW.status = 'active' AND NOW() > NEW.voting_end THEN
    NEW.status := 'expired';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proposal_expiry_trigger
  BEFORE UPDATE ON governance_proposals
  FOR EACH ROW
  EXECUTE FUNCTION check_proposal_expiry();