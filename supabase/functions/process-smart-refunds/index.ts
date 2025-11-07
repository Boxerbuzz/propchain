import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  Client, 
  PrivateKey, 
  TransferTransaction, 
  Hbar,
  AccountId 
} from "https://esm.sh/@hashgraph/sdk@2.73.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[SMART-REFUNDS] Starting smart refund processing...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch investments pending refund
    const { data: pendingRefunds, error: fetchError } = await supabaseClient
      .from('investments')
      .select(`
        *,
        tokenizations!inner(token_name, token_symbol),
        wallets!inner(hedera_account_id)
      `)
      .eq('payment_status', 'refund_pending');

    if (fetchError) {
      throw new Error(`Failed to fetch pending refunds: ${fetchError.message}`);
    }

    console.log(`[SMART-REFUNDS] Found ${pendingRefunds?.length || 0} pending refunds`);

    const results = {
      success: true,
      total_processed: 0,
      paystack_refunds: 0,
      wallet_refunds: 0,
      failed_refunds: 0,
      errors: [] as any[]
    };

    if (!pendingRefunds || pendingRefunds.length === 0) {
      return new Response(
        JSON.stringify({ ...results, message: 'No pending refunds to process' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    for (const investment of pendingRefunds) {
      try {
        console.log(`[SMART-REFUNDS] Processing investment ${investment.id}, method: ${investment.payment_method}`);

        if (investment.payment_method === 'paystack') {
          // Refund via Paystack API
          await processPaystackRefund(investment, supabaseClient);
          results.paystack_refunds++;
        } else if (investment.payment_method === 'wallet') {
          // Refund via HBAR transfer
          await processWalletRefund(investment, supabaseClient);
          results.wallet_refunds++;
        } else {
          console.error(`[SMART-REFUNDS] Unknown payment method: ${investment.payment_method}`);
          results.failed_refunds++;
          results.errors.push({
            investment_id: investment.id,
            error: 'Unknown payment method'
          });
          continue;
        }

        results.total_processed++;

      } catch (error: any) {
        console.error(`[SMART-REFUNDS] Failed to process refund for ${investment.id}:`, error);
        results.failed_refunds++;
        results.errors.push({
          investment_id: investment.id,
          error: error.message
        });
      }
    }

    console.log('[SMART-REFUNDS] Processing complete:', results);

    return new Response(
      JSON.stringify(results),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[SMART-REFUNDS] Fatal error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processPaystackRefund(investment: any, supabaseClient: any) {
  console.log(`[PAYSTACK-REFUND] Processing Paystack refund for ${investment.id}`);

  if (!investment.paystack_reference) {
    throw new Error('Missing Paystack reference');
  }

  // Call Paystack refund API
  const response = await fetch('https://api.paystack.co/refund', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transaction: investment.paystack_reference,
      amount: Math.round(investment.amount_ngn * 100), // Convert to kobo
    }),
  });

  const data = await response.json();

  if (!data.status) {
    throw new Error(`Paystack refund failed: ${data.message}`);
  }

  console.log(`[PAYSTACK-REFUND] Refund initiated: ${data.data.id}`);

  // Update investment record
  await supabaseClient
    .from('investments')
    .update({
      payment_status: 'refunded',
      refund_tx_reference: data.data.id,
      refunded_at: new Date().toISOString(),
    })
    .eq('id', investment.id);

  // Create notification
  await supabaseClient
    .from('notifications')
    .insert({
      user_id: investment.investor_id,
      title: 'Refund Processed',
      message: `Your payment of ₦${investment.amount_ngn.toLocaleString()} has been refunded to your original payment method. It may take 5-7 business days to reflect.`,
      notification_type: 'refund_processed',
      priority: 'high',
    });

  // Log activity
  await supabaseClient
    .from('activity_logs')
    .insert({
      user_id: investment.investor_id,
      activity_type: 'refund_processed_paystack',
      description: `Refund of ₦${investment.amount_ngn.toLocaleString()} initiated to Paystack`,
      metadata: {
        investment_id: investment.id,
        amount_ngn: investment.amount_ngn,
        paystack_refund_id: data.data.id,
      },
    });
}

async function processWalletRefund(investment: any, supabaseClient: any) {
  console.log(`[WALLET-REFUND] Processing wallet refund for ${investment.id}`);

  if (!investment.crypto_amount_paid || !investment.crypto_currency) {
    throw new Error('Missing crypto payment details');
  }

  // Initialize Hedera client
  const hederaClient = Client.forTestnet();
  const operatorId = AccountId.fromString(Deno.env.get('HEDERA_OPERATOR_ID') ?? '');
  const operatorKey = PrivateKey.fromStringECDSA(Deno.env.get('HEDERA_OPERATOR_PRIVATE_KEY') ?? '');
  hederaClient.setOperator(operatorId, operatorKey);

  const userAccountId = AccountId.fromString(investment.wallets.hedera_account_id);
  const refundAmount = investment.crypto_amount_paid;

  console.log(`[WALLET-REFUND] Transferring ${refundAmount} HBAR from treasury to ${userAccountId}`);

  // Transfer HBAR from treasury back to user
  const transferTx = await new TransferTransaction()
    .addHbarTransfer(operatorId, Hbar.from(-refundAmount))
    .addHbarTransfer(userAccountId, Hbar.from(refundAmount))
    .execute(hederaClient);

  const receipt = await transferTx.getReceipt(hederaClient);

  if (receipt.status.toString() !== 'SUCCESS') {
    throw new Error(`Hedera transfer failed: ${receipt.status}`);
  }

  const transactionId = transferTx.transactionId.toString();
  console.log(`[WALLET-REFUND] Transfer successful: ${transactionId}`);

  // Update investment record
  await supabaseClient
    .from('investments')
    .update({
      payment_status: 'refunded',
      refund_tx_reference: transactionId,
      refunded_at: new Date().toISOString(),
    })
    .eq('id', investment.id);

  // Sync user wallet balance
  await supabaseClient.functions.invoke('sync-wallet-balance', {
    body: { hederaAccountId: investment.wallets.hedera_account_id }
  });

  // Create notification
  await supabaseClient
    .from('notifications')
    .insert({
      user_id: investment.investor_id,
      title: 'Refund Processed',
      message: `Your payment of ₦${investment.amount_ngn.toLocaleString()} (${refundAmount.toFixed(2)} HBAR) has been refunded to your wallet.`,
      notification_type: 'refund_processed',
      priority: 'high',
    });

  // Log activity
  await supabaseClient
    .from('activity_logs')
    .insert({
      user_id: investment.investor_id,
      activity_type: 'refund_processed_wallet',
      description: `Refund of ${refundAmount.toFixed(2)} HBAR (₦${investment.amount_ngn.toLocaleString()}) returned to wallet`,
      metadata: {
        investment_id: investment.id,
        amount_ngn: investment.amount_ngn,
        hbar_amount: refundAmount,
        hedera_tx_id: transactionId,
      },
    });
}
