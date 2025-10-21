import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { proposal_id } = await req.json();

    console.log('Executing proposal:', proposal_id);

    // Get proposal details
    const { data: proposal, error: proposalError } = await supabase
      .from('governance_proposals')
      .select('*, tokenizations!inner(multisig_treasury_address, property_id)')
      .eq('id', proposal_id)
      .single();

    if (proposalError || !proposal) {
      return new Response(
        JSON.stringify({ error: 'Proposal not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Validate proposal status
    if (proposal.status !== 'approved_pending_execution') {
      return new Response(
        JSON.stringify({ error: 'Proposal not ready for execution' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if quorum and approval threshold met
    const totalVotes = Number(proposal.total_votes_cast || 0);
    const votesFor = Number(proposal.votes_for || 0);
    const quorumRequired = Number(proposal.quorum_required || 50);
    const approvalThreshold = Number(proposal.approval_threshold || 60);

    if (totalVotes < quorumRequired) {
      return new Response(
        JSON.stringify({ error: 'Quorum not met' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const approvalPercentage = (votesFor / totalVotes) * 100;
    if (approvalPercentage < approvalThreshold) {
      return new Response(
        JSON.stringify({ error: 'Approval threshold not met' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Execute proposal on smart contract (simulated - actual implementation would call contract)
    console.log('Executing proposal on GovernanceExecutor contract...');

    // Lock funds in escrow if budget > 0
    if (proposal.budget_ngn > 0) {
      await supabase
        .from('governance_proposals')
        .update({
          funds_locked: true,
          funds_locked_at: new Date().toISOString(),
          execution_status: 'funds_locked',
          updated_at: new Date().toISOString()
        })
        .eq('id', proposal_id);

      console.log('Funds locked for proposal:', proposal.budget_ngn);
    }

    // Update proposal status
    await supabase
      .from('governance_proposals')
      .update({
        status: 'executed',
        execution_date: new Date().toISOString(),
        execution_status: 'executed',
        updated_at: new Date().toISOString()
      })
      .eq('id', proposal_id);

    // Log contract transaction
    await supabase.from('smart_contract_transactions').insert({
      contract_name: 'governance_executor',
      contract_address: 'simulated-address',
      function_name: 'executeProposal',
      transaction_hash: `0x${Date.now()}`,
      transaction_status: 'confirmed',
      property_id: proposal.tokenizations.property_id,
      tokenization_id: proposal.tokenization_id,
      related_id: proposal_id,
      related_type: 'proposal',
      input_data: {
        proposal_id,
        budget: proposal.budget_ngn
      },
      confirmed_at: new Date().toISOString()
    });

    // Create notifications for property owner and investors
    await supabase.from('notifications').insert({
      title: 'Proposal Executed',
      message: `Proposal "${proposal.title}" has been executed successfully.`,
      notification_type: 'proposal_executed',
      priority: 'high',
      action_url: `/property/${proposal.tokenizations.property_id}/proposals`,
    });

    // Create activity log
    await supabase.from('activity_logs').insert({
      property_id: proposal.tokenizations.property_id,
      tokenization_id: proposal.tokenization_id,
      activity_type: 'proposal_executed',
      description: `Proposal "${proposal.title}" executed successfully`,
      metadata: {
        proposal_id,
        budget_ngn: proposal.budget_ngn,
        funds_locked: proposal.budget_ngn > 0
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Proposal executed successfully',
        funds_locked: proposal.budget_ngn > 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error executing proposal:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
