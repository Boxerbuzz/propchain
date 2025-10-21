import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
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

    const { distribution_id } = await req.json();

    // Get distribution details
    const { data: distribution } = await supabase
      .from('dividend_distributions')
      .select('*')
      .eq('id', distribution_id)
      .single();

    if (!distribution || distribution.payment_status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Invalid distribution' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create distribution on smart contract (if contract distribution ID exists)
    try {
      if (distribution.tokenization_id) {
        const { data: tokenizationData } = await supabase
          .from('tokenizations')
          .select('token_id')
          .eq('id', distribution.tokenization_id)
          .single();

        if (tokenizationData?.token_id) {
          // Import contract service
          const { SmartContractService } = await import('../_shared/contractService.ts');
          const contractService = new SmartContractService(supabase);
          
          // Get current block number
          const blockNumber = await contractService.getLatestBlockNumber();
          
          // ✅ REAL CONTRACT CALL
          const result = await contractService.createDistributionOnChain({
            distributionId: distribution_id,
            tokenContract: tokenizationData.token_id,
            totalAmount: distribution.total_amount_ngn,
            perTokenAmount: distribution.per_token_amount,
            snapshotBlock: blockNumber
          });

          // Update distribution with REAL contract data
          await supabase
            .from('dividend_distributions')
            .update({
              contract_distribution_id: result.distributionId,
              contract_transaction_hash: result.txHash, // ✅ REAL TX HASH
              contract_created_at: new Date().toISOString(),
              snapshot_block_number: blockNumber
            })
            .eq('id', distribution_id);

          // Log contract transaction
          await supabase.from('smart_contract_transactions').insert({
            contract_name: 'dividend_distributor',
            contract_address: result.contractAddress,
            function_name: 'createDistribution',
            transaction_hash: result.txHash,
            transaction_status: 'confirmed',
            tokenization_id: distribution.tokenization_id,
            related_id: distribution_id,
            related_type: 'dividend',
            input_data: {
              total_amount_ngn: distribution.total_amount_ngn,
              per_token_amount: distribution.per_token_amount,
              snapshot_block: blockNumber
            }
          });

          console.log('✅ Distribution registered on-chain:', result.txHash);
        }
      }
    } catch (contractError) {
      console.error('❌ Failed to register distribution on-chain:', contractError);
      // Continue with off-chain distribution
    }

    // Get all pending payments for this distribution
    const { data: payments } = await supabase
      .from('dividend_payments')
      .select('*')
      .eq('distribution_id', distribution_id)
      .eq('payment_status', 'pending');

    if (!payments || payments.length === 0) {
      return new Response(JSON.stringify({ error: 'No pending payments found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let successful = 0;
    let failed = 0;

    // Process each payment
    for (const payment of payments) {
      try {
        // Get recipient's wallet
        const { data: userWallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', payment.recipient_id)
          .single();

        if (!userWallet) {
          console.log(`No wallet found for user ${payment.recipient_id}`);
          failed++;
          continue;
        }

        // Credit wallet balance
        const newBalance = Number(userWallet.balance_ngn) + Number(payment.amount_ngn);

        const { error: updateError } = await supabase
          .from('wallets')
          .update({
            balance_ngn: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', userWallet.id);

        if (updateError) {
          console.error('Wallet update error:', updateError);
          failed++;
          continue;
        }

        // Update payment status
        await supabase
          .from('dividend_payments')
          .update({
            payment_status: 'completed',
            paid_at: new Date().toISOString()
          })
          .eq('id', payment.id);

        // Create notification
        await supabase.from('notifications').insert({
          user_id: payment.recipient_id,
          title: 'Dividend Payment Received',
          message: `You've received a dividend payment of ₦${Number(payment.amount_ngn).toLocaleString()} from your property investment.`,
          notification_type: 'dividend_received',
          priority: 'normal',
          action_url: '/portfolio',
        });

        // Create activity log
        await supabase.from('activity_logs').insert({
          user_id: payment.recipient_id,
          activity_type: 'dividend_received',
          description: `Received dividend payment of ₦${Number(payment.amount_ngn).toLocaleString()}`,
          tokenization_id: payment.tokenization_id,
          metadata: {
            distribution_id,
            amount_ngn: payment.amount_ngn,
            tokens_held: payment.tokens_held
          }
        });

        successful++;
        console.log(`Dividend distributed to user ${payment.recipient_id}: ₦${payment.amount_ngn}`);

      } catch (paymentError: any) {
        console.error('Payment processing error:', paymentError);
        failed++;
      }
    }

    // Update distribution status
    await supabase
      .from('dividend_distributions')
      .update({
        payment_status: failed === 0 ? 'completed' : 'partially_completed',
        successful_payments: successful,
        failed_payments: failed
      })
      .eq('id', distribution_id);

    // Update rental distribution status
    if (distribution.property_id) {
      await supabase
        .from('property_rentals')
        .update({
          distribution_status: 'completed',
          distributed_at: new Date().toISOString()
        })
        .eq('distribution_id', distribution_id);
    }

    console.log(`Distribution complete - Success: ${successful}, Failed: ${failed}`);

    return new Response(JSON.stringify({
      success: true,
      successful_payments: successful,
      failed_payments: failed,
      message: `Dividends distributed successfully to ${successful} recipients`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error distributing dividends:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
