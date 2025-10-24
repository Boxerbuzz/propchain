-- Function to check and execute proposals
CREATE OR REPLACE FUNCTION public.check_and_execute_proposals()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  proposal_record RECORD;
  executed_count INTEGER := 0;
  failed_count INTEGER := 0;
BEGIN
  -- Find proposals that need execution
  FOR proposal_record IN
    SELECT id, title, votes_for, votes_against, total_votes_cast,
           approval_threshold, quorum_required, tokenization_id, property_id
    FROM governance_proposals
    WHERE status = 'active'
      AND voting_end < NOW()
      AND contract_proposal_id IS NOT NULL
      AND funds_locked = FALSE
  LOOP
    -- Check if passed (quorum + approval threshold)
    IF (proposal_record.total_votes_cast >= proposal_record.quorum_required)
       AND ((proposal_record.votes_for::DECIMAL / proposal_record.total_votes_cast * 100) >= proposal_record.approval_threshold)
    THEN
      -- Mark as pending execution
      UPDATE governance_proposals
      SET status = 'approved_pending_execution',
          updated_at = NOW()
      WHERE id = proposal_record.id;
      
      executed_count := executed_count + 1;
    ELSE
      -- Mark as rejected
      UPDATE governance_proposals
      SET status = 'rejected',
          updated_at = NOW()
      WHERE id = proposal_record.id;
      
      failed_count := failed_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'proposals_approved', executed_count,
    'proposals_rejected', failed_count
  );
END;
$$;

-- Update cast_vote to check for proposal execution
CREATE OR REPLACE FUNCTION public.cast_vote(p_proposal_id uuid, p_voter_id uuid, p_vote_choice text, p_voting_power bigint)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
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

  -- Check if voting just ended and proposal should be executed
  IF v_proposal.voting_end < NOW() THEN
    -- Trigger execution check
    PERFORM pg_notify('proposal_ended', v_proposal.id::text);
  END IF;

  RETURN '{"success": true, "message": "Vote cast successfully"}';
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_and_execute_proposals() TO service_role;
GRANT EXECUTE ON FUNCTION public.cast_vote(uuid, uuid, text, bigint) TO authenticated;