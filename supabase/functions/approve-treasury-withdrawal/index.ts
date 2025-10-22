import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SmartContractService } from "../_shared/contractService.ts";

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

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { transaction_id, request_id } = await req.json();

    console.log('Approving treasury withdrawal:', { transaction_id, request_id, user_id: user.id });

    // Get transaction details
    const { data: transaction, error: txError } = await supabase
      .from('property_treasury_transactions')
      .select(`
        *,
        tokenizations!inner(
          multisig_treasury_address,
          treasury_signers,
          treasury_threshold,
          treasury_type,
          property_id
        )
      `)
      .eq('id', transaction_id)
      .single();

    if (txError || !transaction) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Verify user is a signer
    const tokenization = (transaction as any).tokenizations;
    const isSigner = tokenization.treasury_signers?.includes(user.id);

    if (!isSigner) {
      return new Response(
        JSON.stringify({ error: 'Not authorized to approve this withdrawal' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Check if already approved by this user
    const approvals = (transaction.metadata as any)?.approvals || [];
    if (approvals.includes(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Already approved by you' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (tokenization.treasury_type === 'multisig' && tokenization.multisig_treasury_address) {
      // Submit approval to smart contract
      const contractService = new SmartContractService(supabase);
      
      try {
        const result = await contractService.approveTreasuryWithdrawal({
          treasuryAddress: tokenization.multisig_treasury_address,
          requestId: parseInt(request_id)
        });

        console.log('✅ Approval submitted to contract:', result.txHash);

        // Update transaction metadata with approval
        approvals.push(user.id);
        const metadata = {
          ...(transaction.metadata as any || {}),
          approvals,
          approval_count: approvals.length,
          last_approval_at: new Date().toISOString(),
          last_approval_by: user.id,
          contract_approval_tx: result.txHash
        };

        // Check if threshold reached and auto-executed
        if (result.executed) {
          await supabase
            .from('property_treasury_transactions')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              metadata
            })
            .eq('id', transaction_id);

          console.log('✅ Withdrawal auto-executed after approval');
        } else {
          await supabase
            .from('property_treasury_transactions')
            .update({
              status: approvals.length >= tokenization.treasury_threshold ? 'approved' : 'pending',
              metadata
            })
            .eq('id', transaction_id);
        }

        // Log contract transaction
        await supabase.from('smart_contract_transactions').insert({
          contract_name: 'multisig_treasury',
          contract_address: tokenization.multisig_treasury_address,
          function_name: 'approveWithdrawal',
          transaction_hash: result.txHash,
          transaction_status: 'confirmed',
          property_id: tokenization.property_id,
          tokenization_id: transaction.tokenization_id,
          related_id: transaction_id,
          related_type: 'treasury_transaction',
          user_id: user.id,
          input_data: { request_id, transaction_id },
          confirmed_at: new Date().toISOString()
        });

        // Create activity log
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          property_id: tokenization.property_id,
          tokenization_id: transaction.tokenization_id,
          activity_type: 'treasury_approval',
          description: `Withdrawal request approved (${approvals.length}/${tokenization.treasury_threshold})`,
          metadata: {
            transaction_id,
            request_id,
            amount_ngn: transaction.amount_ngn,
            contract_tx: result.txHash
          }
        });

        return new Response(
          JSON.stringify({
            success: true,
            tx_hash: result.txHash,
            executed: result.executed,
            approval_count: approvals.length,
            threshold: tokenization.treasury_threshold
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (contractError: any) {
        console.error('Contract approval failed:', contractError);
        
        // Fall back to database-only approval
        approvals.push(user.id);
        await supabase
          .from('property_treasury_transactions')
          .update({
            metadata: {
              ...(transaction.metadata as any || {}),
              approvals,
              approval_count: approvals.length,
              contract_error: contractError.message
            }
          })
          .eq('id', transaction_id);

        return new Response(
          JSON.stringify({
            success: true,
            warning: 'Approved in database but contract call failed',
            approval_count: approvals.length,
            threshold: tokenization.treasury_threshold
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Custodial treasury - just update database
      approvals.push(user.id);
      
      await supabase
        .from('property_treasury_transactions')
        .update({
          status: approvals.length >= tokenization.treasury_threshold ? 'approved' : 'pending',
          metadata: {
            ...(transaction.metadata as any || {}),
            approvals,
            approval_count: approvals.length
          }
        })
        .eq('id', transaction_id);

      return new Response(
        JSON.stringify({
          success: true,
          approval_count: approvals.length,
          threshold: tokenization.treasury_threshold
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Error approving withdrawal:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});