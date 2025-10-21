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

    const { property_id, tokenization_id, amount_ngn, recipient, description } = await req.json();

    console.log('Submitting treasury withdrawal:', { property_id, amount_ngn, recipient });

    // Get tokenization with treasury details
    const { data: tokenization, error: tokenError } = await supabase
      .from('tokenizations')
      .select('multisig_treasury_address, treasury_signers, treasury_threshold')
      .eq('id', tokenization_id)
      .single();

    if (tokenError || !tokenization) {
      return new Response(
        JSON.stringify({ error: 'Tokenization not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Validate user is a signer
    if (!tokenization.treasury_signers.includes(user.id)) {
      return new Response(
        JSON.stringify({ error: 'User is not authorized to submit withdrawals' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Submit withdrawal to smart contract (simulated)
    const requestId = `0x${Date.now()}_req_${property_id.substring(0, 8)}`;
    console.log('Submitting withdrawal to MultiSigTreasury contract...');

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('property_treasury_transactions')
      .insert({
        property_id,
        tokenization_id,
        transaction_type: 'withdrawal',
        source_type: 'multisig_treasury',
        amount_ngn,
        description,
        status: 'pending',
        hedera_transaction_id: requestId,
        created_by: user.id,
        metadata: {
          recipient,
          approvals_required: tokenization.treasury_threshold,
          approvals_count: 1, // Submitter automatically approves
          approvers: [user.id]
        }
      })
      .select()
      .single();

    if (txError) throw txError;

    // Log contract transaction
    await supabase.from('smart_contract_transactions').insert({
      contract_name: 'multisig_treasury',
      contract_address: tokenization.multisig_treasury_address,
      function_name: 'submitWithdrawal',
      transaction_hash: requestId,
      transaction_status: 'pending',
      user_id: user.id,
      property_id,
      tokenization_id,
      related_id: transaction.id,
      related_type: 'treasury_transaction',
      input_data: {
        amount_ngn,
        recipient,
        description
      }
    });

    // Notify other signers
    const otherSigners = tokenization.treasury_signers.filter((s: string) => s !== user.id);
    for (const signerId of otherSigners) {
      await supabase.from('notifications').insert({
        user_id: signerId,
        title: 'Treasury Withdrawal Approval Needed',
        message: `A withdrawal request of ₦${amount_ngn.toLocaleString()} requires your approval.`,
        notification_type: 'withdrawal_approval_needed',
        priority: 'high',
        action_url: `/property/${property_id}/treasury`,
        action_data: {
          transaction_id: transaction.id,
          amount_ngn,
          recipient
        }
      });
    }

    // Create activity log
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      property_id,
      tokenization_id,
      activity_type: 'withdrawal_submitted',
      description: `Withdrawal request submitted for ₦${amount_ngn.toLocaleString()}`,
      metadata: {
        transaction_id: transaction.id,
        amount_ngn,
        recipient,
        request_id: requestId
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        request_id: requestId,
        approvals_needed: tokenization.treasury_threshold - 1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error submitting treasury withdrawal:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
