import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  Client, 
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  AccountId,
  PrivateKey
} from "https://esm.sh/@hashgraph/sdk@2.73.1";

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

    console.log('Executing treasury withdrawal:', { transaction_id, request_id });

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
      .eq('status', 'approved')
      .single();

    if (txError || !transaction) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found or not approved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const tokenization = (transaction as any).tokenizations;

    // Verify user is a signer
    const isSigner = tokenization.treasury_signers?.includes(user.id);
    if (!isSigner) {
      return new Response(
        JSON.stringify({ error: 'Not authorized to execute this withdrawal' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Check if enough approvals
    const approvals = (transaction.metadata as any)?.approvals || [];
    if (approvals.length < tokenization.treasury_threshold) {
      return new Response(
        JSON.stringify({ 
          error: `Insufficient approvals: ${approvals.length}/${tokenization.treasury_threshold}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (tokenization.treasury_type === 'multisig' && tokenization.multisig_treasury_address) {
      // Execute withdrawal on smart contract
      console.log('⚡ Executing withdrawal on MultiSigTreasury contract...');

      const operatorId = Deno.env.get('HEDERA_OPERATOR_ID');
      const operatorKey = Deno.env.get('HEDERA_OPERATOR_PRIVATE_KEY');
      
      if (!operatorId || !operatorKey) {
        throw new Error('Hedera operator credentials not configured');
      }
      
      const client = Client.forTestnet();
      client.setOperator(
        AccountId.fromString(operatorId),
        PrivateKey.fromStringECDSA(operatorKey)
      );

      const params = new ContractFunctionParameters()
        .addUint256(parseInt(request_id));

      const contractId = ContractId.fromSolidityAddress(tokenization.multisig_treasury_address);
      
      const executeTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(2000000)
        .setFunction('executeWithdrawal', params);

      const txResponse = await executeTx.execute(client);
      const receipt = await txResponse.getReceipt(client);

      const txHash = txResponse.transactionId.toString();
      console.log('✅ Withdrawal executed:', txHash);

      // Update transaction status
      await supabase
        .from('property_treasury_transactions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          hedera_transaction_id: txHash,
          metadata: {
            ...(transaction.metadata as any || {}),
            executed_by: user.id,
            executed_at: new Date().toISOString(),
            execution_tx: txHash
          }
        })
        .eq('id', transaction_id);

      // Log contract transaction
      await supabase.from('smart_contract_transactions').insert({
        contract_name: 'multisig_treasury',
        contract_address: tokenization.multisig_treasury_address,
        function_name: 'executeWithdrawal',
        transaction_hash: txHash,
        transaction_status: receipt.status.toString() === 'SUCCESS' ? 'confirmed' : 'failed',
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
        activity_type: 'treasury_withdrawal_executed',
        description: `Withdrawal executed: ₦${transaction.amount_ngn.toLocaleString()}`,
        metadata: {
          transaction_id,
          amount_ngn: transaction.amount_ngn,
          recipient: (transaction.metadata as any)?.recipient,
          contract_tx: txHash
        }
      });

      // Notify other signers
      for (const signerId of tokenization.treasury_signers) {
        if (signerId !== user.id) {
          await supabase.from('notifications').insert({
            user_id: signerId,
            title: 'Withdrawal Executed',
            message: `A treasury withdrawal of ₦${transaction.amount_ngn.toLocaleString()} has been executed.`,
            notification_type: 'treasury_executed',
            priority: 'high',
            action_url: `/property/${tokenization.property_id}/treasury`,
            action_data: { transaction_id, tx_hash: txHash }
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          tx_hash: txHash,
          status: receipt.status.toString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      // Custodial treasury - mark as completed
      await supabase
        .from('property_treasury_transactions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', transaction_id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Withdrawal executed (custodial)'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Error executing withdrawal:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});