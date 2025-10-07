import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Client, PrivateKey, AccountId, TransferTransaction, Hbar } from "https://esm.sh/@hashgraph/sdk@2.73.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const HEDERA_OPERATOR_ID = Deno.env.get("HEDERA_OPERATOR_ID");
const HEDERA_OPERATOR_PRIVATE_KEY = Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { withdrawal_id } = await req.json();

    // Get withdrawal request
    const { data: withdrawal } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawal_id)
      .single();

    if (!withdrawal || withdrawal.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Invalid withdrawal request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update status to processing
    await supabase
      .from('withdrawal_requests')
      .update({ status: 'processing' })
      .eq('id', withdrawal_id);

    let transactionId = null;
    let success = false;

    try {
      if (withdrawal.withdrawal_method === 'bank_transfer') {
        // Process via Paystack Transfer
        const transferResponse = await fetch('https://api.paystack.co/transfer', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source: 'balance',
            amount: Math.round(withdrawal.net_amount_ngn * 100), // Convert to kobo
            recipient: withdrawal.bank_account_number,
            reason: 'Wallet Withdrawal',
          }),
        });

        const transferData = await transferResponse.json();
        
        if (!transferResponse.ok) {
          throw new Error(transferData.message || 'Paystack transfer failed');
        }

        transactionId = transferData.data.reference;
        success = true;

      } else if (withdrawal.withdrawal_method === 'hedera') {
        // Process HBAR transfer
        const client = Client.forTestnet();
        client.setOperator(
          AccountId.fromString(HEDERA_OPERATOR_ID!),
          PrivateKey.fromStringECDSA(HEDERA_OPERATOR_PRIVATE_KEY!)
        );

        const transferTx = new TransferTransaction()
          .addHbarTransfer(AccountId.fromString(HEDERA_OPERATOR_ID!), Hbar.fromTinybars(-withdrawal.amount_ngn))
          .addHbarTransfer(AccountId.fromString(withdrawal.recipient_hedera_account), Hbar.fromTinybars(withdrawal.amount_ngn))
          .setTransactionMemo('Wallet Withdrawal');

        const txResponse = await transferTx.execute(client);
        const receipt = await txResponse.getReceipt(client);
        
        transactionId = txResponse.transactionId.toString();
        success = receipt.status.toString() === 'SUCCESS';

      } else if (withdrawal.withdrawal_method === 'usdc') {
        // TODO: Implement USDC transfer
        throw new Error('USDC withdrawals not yet implemented');
      }

      if (success) {
        // Deduct from wallet balance
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance_ngn')
          .eq('id', withdrawal.wallet_id)
          .single();

        await supabase
          .from('wallets')
          .update({ 
            balance_ngn: wallet!.balance_ngn - withdrawal.amount_ngn,
            updated_at: new Date().toISOString()
          })
          .eq('id', withdrawal.wallet_id);

        // Update withdrawal request
        await supabase
          .from('withdrawal_requests')
          .update({
            status: 'completed',
            hedera_transaction_id: transactionId,
            processed_at: new Date().toISOString(),
          })
          .eq('id', withdrawal_id);

        // Create notification
        await supabase.from('notifications').insert({
          user_id: withdrawal.user_id,
          title: 'Withdrawal Completed',
          message: `Your withdrawal of ₦${withdrawal.amount_ngn.toLocaleString()} has been processed successfully.`,
          notification_type: 'withdrawal_completed',
          priority: 'normal',
          action_url: '/wallet/dashboard',
        });

        console.log('Withdrawal processed successfully:', withdrawal_id);

        return new Response(JSON.stringify({ 
          success: true,
          transaction_id: transactionId,
          message: 'Withdrawal processed successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

    } catch (processingError: any) {
      console.error('Processing error:', processingError);
      
      // Update to failed status
      await supabase
        .from('withdrawal_requests')
        .update({
          status: 'failed',
          failure_reason: processingError.message,
        })
        .eq('id', withdrawal_id);

      // Notify user
      await supabase.from('notifications').insert({
        user_id: withdrawal.user_id,
        title: 'Withdrawal Failed',
        message: `Your withdrawal request for ₦${withdrawal.amount_ngn.toLocaleString()} failed. Please try again or contact support.`,
        notification_type: 'withdrawal_failed',
        priority: 'high',
        action_url: '/wallet/dashboard',
      });

      throw processingError;
    }

  } catch (error: any) {
    console.error('Error processing withdrawal:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
