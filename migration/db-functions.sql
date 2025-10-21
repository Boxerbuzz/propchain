-- ============================================
-- DATABASE FUNCTIONS AND TRIGGERS
-- Real Estate Tokenization Platform
-- Updated: 2025-01-21
-- ============================================

-- ============================================
-- TOKEN RESERVATION & INVESTMENT FUNCTIONS
-- ============================================

-- Reserve tokens with timeout (atomic operation)
CREATE OR REPLACE FUNCTION public.reserve_tokens_with_timeout(
  p_investment_id UUID,
  p_tokenization_id UUID,
  p_tokens_requested BIGINT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
SET search_path = public, pg_temp
AS $$
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
SET search_path = public, pg_temp
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

-- Cleanup ALL expired token reservations (global cleanup)
CREATE OR REPLACE FUNCTION public.cleanup_expired_token_reservations()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_investment RECORD;
  tokenization_record RECORD;
  cleanup_count INTEGER := 0;
  total_amount_ngn NUMERIC := 0;
  total_tokens_requested BIGINT := 0;
  cleanup_id UUID;
  start_time TIMESTAMP := NOW();
  end_time TIMESTAMP;
  execution_duration INTERVAL;
  error_message TEXT;
BEGIN
  -- Start transaction
  BEGIN
    -- Generate cleanup ID for this batch
    cleanup_id := gen_random_uuid();
    
    -- Process each expired investment individually
    FOR expired_investment IN
      SELECT 
        i.*,
        t.property_id,
        t.token_name,
        t.token_symbol,
        t.price_per_token
      FROM investments i
      JOIN tokenizations t ON i.tokenization_id = t.id
      WHERE i.reservation_status IN ('pending', 'active')
        AND i.reservation_expires_at < NOW()
        AND i.reservation_expires_at IS NOT NULL
        AND i.payment_status = 'pending'
    LOOP
      -- Reverse tokens back to tokenization
      UPDATE tokenizations 
      SET 
        tokens_sold = tokens_sold - expired_investment.tokens_requested,
        current_raise = current_raise - expired_investment.amount_ngn,
        investor_count = GREATEST(0, investor_count - 1),
        updated_at = NOW()
      WHERE id = expired_investment.tokenization_id;
      
      -- Log individual cleanup activity
      INSERT INTO activity_logs (
        user_id,
        property_id,
        tokenization_id,
        activity_type,
        activity_category,
        description,
        metadata,
        ip_address,
        user_agent,
        created_at
      ) VALUES (
        expired_investment.investor_id,
        expired_investment.property_id,
        expired_investment.tokenization_id,
        'investment_cleanup',
        'expired_reservation',
        FORMAT('Cleaned up expired token reservation - %s tokens for %s (%s)', 
               expired_investment.tokens_requested,
               expired_investment.token_name,
               expired_investment.token_symbol),
        jsonb_build_object(
          'cleanup_id', cleanup_id,
          'investment_id', expired_investment.id,
          'amount_ngn', expired_investment.amount_ngn,
          'tokens_requested', expired_investment.tokens_requested,
          'action', 'cleanup_expired_reservation'
        ),
        '127.0.0.1'::inet,
        'TokenCleanupBot/1.0',
        NOW()
      );
      
      -- Create user notification
      INSERT INTO notifications (
        user_id,
        title,
        message,
        notification_type,
        priority,
        action_url,
        action_data,
        sent_via,
        expires_at,
        created_at
      ) VALUES (
        expired_investment.investor_id,
        'Token Reservation Expired',
        FORMAT('Your reservation for %s tokens worth ₦%s has expired.',
               expired_investment.tokens_requested,
               TO_CHAR(expired_investment.amount_ngn, 'FM999,999,999,990.00')),
        'reservation_expired',
        'normal',
        FORMAT('/tokenizations/%s', expired_investment.tokenization_id),
        jsonb_build_object(
          'cleanup_id', cleanup_id,
          'investment_id', expired_investment.id,
          'tokenization_id', expired_investment.tokenization_id
        ),
        ARRAY['push', 'email'],
        NOW() + INTERVAL '30 days',
        NOW()
      );
      
      -- Delete the expired investment
      DELETE FROM investments WHERE id = expired_investment.id;
      
      -- Update counters
      cleanup_count := cleanup_count + 1;
      total_amount_ngn := total_amount_ngn + expired_investment.amount_ngn;
      total_tokens_requested := total_tokens_requested + expired_investment.tokens_requested;
    END LOOP;
    
    end_time := NOW();
    execution_duration := end_time - start_time;
    
    -- Return success result
    RETURN jsonb_build_object(
      'success', true,
      'cleanup_id', cleanup_id,
      'reservations_cleaned', cleanup_count,
      'total_amount_returned_ngn', total_amount_ngn,
      'total_tokens_returned', total_tokens_requested,
      'execution_time_ms', EXTRACT(EPOCH FROM execution_duration) * 1000,
      'message', CASE 
        WHEN cleanup_count = 0 THEN 'No expired reservations found'
        ELSE FORMAT('Successfully cleaned up %s expired reservations', cleanup_count)
      END
    );

  EXCEPTION 
    WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
      end_time := NOW();
      execution_duration := end_time - start_time;
      
      RETURN jsonb_build_object(
        'success', false,
        'error_message', error_message,
        'error_code', SQLSTATE,
        'execution_time_ms', EXTRACT(EPOCH FROM execution_duration) * 1000,
        'message', 'Cleanup operation failed'
      );
  END;
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
SET search_path = public, pg_temp
AS $$
DECLARE
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
SET search_path = public, pg_temp
AS $$ 
DECLARE
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
SET search_path = public, pg_temp
AS $$
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

-- ============================================
-- GOVERNANCE FUNCTIONS
-- ============================================

-- Get user's voting power for a property
CREATE OR REPLACE FUNCTION public.get_user_voting_power(
  p_user_id UUID,
  p_property_id UUID
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
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
SET search_path = public, pg_temp
AS $$
DECLARE
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
SET search_path = public, pg_temp
AS $$
DECLARE
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

-- ============================================
-- CHAT FUNCTIONS
-- ============================================

-- Create chat room for tokenization
CREATE OR REPLACE FUNCTION public.create_chat_room_for_tokenization(
  p_tokenization_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
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
SET search_path = public, pg_temp
AS $$
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

-- ============================================
-- WALLET & SECURITY FUNCTIONS
-- ============================================

-- Get wallet private key from Vault
CREATE OR REPLACE FUNCTION public.get_wallet_private_key(
  p_wallet_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_vault_secret_id UUID;
  v_private_key TEXT;
BEGIN
  -- Get vault_secret_id from wallet
  SELECT vault_secret_id INTO v_vault_secret_id
  FROM wallets
  WHERE id = p_wallet_id;

  IF v_vault_secret_id IS NULL THEN
    RAISE EXCEPTION 'No vault secret found for wallet';
  END IF;

  -- Decrypt secret from Vault
  SELECT decrypted_secret INTO v_private_key
  FROM vault.decrypted_secrets
  WHERE id = v_vault_secret_id;

  RETURN v_private_key;
END;
$$;

-- Migrate private keys from encrypted column to Vault
CREATE OR REPLACE FUNCTION public.migrate_private_keys_to_vault()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  wallet_record RECORD;
  secret_id UUID;
  migrated_count INTEGER := 0;
  error_count INTEGER := 0;
BEGIN
  FOR wallet_record IN
    SELECT id, hedera_account_id, private_key_encrypted
    FROM public.wallets
    WHERE private_key_encrypted IS NOT NULL
      AND vault_secret_id IS NULL
  LOOP
    BEGIN
      -- Store the private key in Supabase Vault
      SELECT vault.create_secret(
        wallet_record.private_key_encrypted,
        'hedera_private_key_' || wallet_record.hedera_account_id,
        'Hedera private key for account ' || wallet_record.hedera_account_id
      ) INTO secret_id;

      -- Update the wallet record with the vault secret id
      UPDATE public.wallets
      SET vault_secret_id = secret_id
      WHERE id = wallet_record.id;

      migrated_count := migrated_count + 1;

    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      RAISE WARNING 'Failed to migrate wallet %: %', wallet_record.id, SQLERRM;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'migrated_count', migrated_count,
    'error_count', error_count,
    'message', format('Migrated %s wallets to Vault, %s errors', migrated_count, error_count)
  );
END;
$$;

-- ============================================
-- KYC FUNCTIONS
-- ============================================

-- Cleanup expired KYC drafts
CREATE OR REPLACE FUNCTION public.cleanup_expired_kyc_drafts()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM kyc_drafts WHERE expires_at < NOW();
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- 1. Auto-log investment status changes
CREATE OR REPLACE FUNCTION log_investment_activity()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public, pg_temp;
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS investment_activity_trigger ON investments;
CREATE TRIGGER investment_activity_trigger
  AFTER UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION log_investment_activity();

-- 2. Auto-update tokenization investor count (placeholder)
CREATE OR REPLACE FUNCTION update_tokenization_investor_count()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public, pg_temp;
  -- Handled by manual increment_tokenization_raise function
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 3. Auto-update voting power in chat rooms
CREATE OR REPLACE FUNCTION update_chat_voting_power()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public, pg_temp;
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS chat_voting_power_trigger ON token_holdings;
CREATE TRIGGER chat_voting_power_trigger
  AFTER INSERT OR UPDATE ON token_holdings
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_voting_power();

-- 4. Auto-expire proposals
CREATE OR REPLACE FUNCTION check_proposal_expiry()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public, pg_temp;
  IF NEW.status = 'active' AND NOW() > NEW.voting_end THEN
    NEW.status := 'expired';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS proposal_expiry_trigger ON governance_proposals;
CREATE TRIGGER proposal_expiry_trigger
  BEFORE UPDATE ON governance_proposals
  FOR EACH ROW
  EXECUTE FUNCTION check_proposal_expiry();

-- 5. Log tokenization activity
CREATE OR REPLACE FUNCTION log_tokenization_activity()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public, pg_temp;
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    INSERT INTO activity_logs (
      user_id,
      activity_type,
      description,
      tokenization_id,
      property_id,
      metadata,
      created_at
    ) VALUES (
      NEW.created_by,
      'tokenization_hedera_token_pending',
      'Tokenization approved - Hedera token creation pending',
      NEW.id,
      NEW.property_id,
      json_build_object(
        'tokenization_id', NEW.id,
        'token_name', NEW.token_name,
        'token_symbol', NEW.token_symbol,
        'total_supply', NEW.total_supply
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS tokenization_activity_trigger ON tokenizations;
CREATE TRIGGER tokenization_activity_trigger
  AFTER INSERT OR UPDATE ON tokenizations
  FOR EACH ROW
  EXECUTE FUNCTION log_tokenization_activity();
