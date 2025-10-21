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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { 
      room_id, 
      property_id, 
      tokenization_id, 
      title, 
      description, 
      proposal_type, 
      budget_ngn, 
      voting_period_days 
    } = await req.json();

    console.log('Creating proposal:', { room_id, property_id, tokenization_id, title });

    // Verify tokenization status - proposals only allowed after tokens are minted
    const { data: tokenization, error: tokenError } = await supabase
      .from('tokenizations')
      .select('status')
      .eq('id', tokenization_id)
      .single();

    if (tokenError || !tokenization) {
      return new Response(
        JSON.stringify({ error: 'Tokenization not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    if (tokenization.status !== 'minted' && tokenization.status !== 'distributed') {
      return new Response(
        JSON.stringify({ 
          error: 'Proposals can only be created after tokens are minted and distributed',
          currentStatus: tokenization.status
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Create the governance proposal
    const { data: proposal, error: proposalError } = await supabase
      .rpc('create_governance_proposal', {
        p_property_id: property_id,
        p_tokenization_id: tokenization_id,
        p_proposer_id: user.id,
        p_title: title,
        p_description: description,
        p_proposal_type: proposal_type,
        p_budget_ngn: budget_ngn || 0,
        p_voting_period_days: voting_period_days || 7
      });

    if (proposalError) throw proposalError;

    console.log('Proposal created:', proposal);

    // Register proposal on smart contract (if treasury exists)
    try {
      const { data: tokenizationData } = await supabase
        .from('tokenizations')
        .select('multisig_treasury_address')
        .eq('id', tokenization_id)
        .single();

      if (tokenizationData?.multisig_treasury_address) {
        // Import contract service
        const { SmartContractService } = await import('../_shared/contractService.ts');
        const contractService = new SmartContractService(supabase);
        
        const votingEnd = Math.floor(Date.now() / 1000) + (voting_period_days * 24 * 60 * 60);
        
        // ✅ REAL CONTRACT CALL
        const result = await contractService.registerProposalOnChain({
          proposalId: proposal,
          propertyTreasuryAddress: tokenizationData.multisig_treasury_address,
          budget: budget_ngn || 0,
          proposalType: proposal_type,
          votingEnd: votingEnd
        });

        // Update proposal with REAL contract data
        await supabase
          .from('governance_proposals')
          .update({
            contract_proposal_id: result.proposalId,
            contract_registered_at: new Date().toISOString(),
            contract_transaction_hash: result.txHash // ✅ REAL HEDERA TX HASH
          })
          .eq('id', proposal);

        // Log contract transaction
        await supabase.from('smart_contract_transactions').insert({
          contract_name: 'governance_executor',
          contract_address: result.contractAddress,
          function_name: 'registerProposal',
          transaction_hash: result.txHash,
          transaction_status: 'confirmed',
          user_id: user.id,
          property_id,
          tokenization_id,
          related_id: proposal,
          related_type: 'proposal',
          input_data: {
            proposal_id: proposal,
            budget_ngn: budget_ngn || 0,
            proposal_type,
            voting_end: votingEnd
          }
        });

        console.log('✅ Proposal registered on-chain:', result.txHash);
      }
    } catch (contractError) {
      console.error('❌ Failed to register proposal on-chain:', contractError);
      // Don't fail the whole proposal creation, just log the error
    }

    // Get user info for the message
    const { data: userData } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    // Post proposal to chat as a special message
    const { error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        room_id,
        sender_id: user.id,
        message_type: 'proposal',
        message_text: title,
        metadata: {
          proposal_id: proposal,
          title,
          description,
          proposal_type,
          budget_ngn,
          voting_period_days,
          proposer_name: `${userData?.first_name} ${userData?.last_name}`,
          created_at: new Date().toISOString()
        }
      });

    if (messageError) throw messageError;

    // Create activity log
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      property_id,
      tokenization_id,
      activity_type: 'governance_proposal_created',
      description: `Created proposal: ${title}`,
      metadata: {
        proposal_id: proposal,
        proposal_type,
        room_id
      }
    });

    return new Response(
      JSON.stringify({ success: true, proposal_id: proposal }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating proposal:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
