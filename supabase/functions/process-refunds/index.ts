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

    console.log('Starting refund processing...');

    // Get all investments pending refund
    const { data: pendingRefunds, error: fetchError } = await supabase
      .from('investments')
      .select(`
        *,
        tokenization:tokenizations(
          token_name,
          token_symbol,
          property:properties(title)
        )
      `)
      .eq('payment_status', 'refund_pending');

    if (fetchError) {
      console.error('Error fetching pending refunds:', fetchError);
      throw fetchError;
    }

    if (!pendingRefunds || pendingRefunds.length === 0) {
      console.log('No pending refunds found');
      return new Response(JSON.stringify({
        success: true,
        message: 'No pending refunds to process',
        refunds_processed: 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`Found ${pendingRefunds.length} pending refunds to process`);

    let successCount = 0;
    let failureCount = 0;
    const errors: any[] = [];

    // Process each refund
    for (const investment of pendingRefunds) {
      try {
        console.log(`Processing refund for investment ${investment.id}`);

        // Get user's Hedera account
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('hedera_account_id, wallet_balance_ngn, first_name, last_name')
          .eq('id', investment.investor_id)
          .single();

        if (userError || !userData?.hedera_account_id) {
          console.error(`User ${investment.investor_id} has no Hedera account`);
          errors.push({
            investment_id: investment.id,
            error: 'User has no Hedera account',
          });
          failureCount++;
          continue;
        }

        // Update user's wallet balance
        const newBalance = (userData.wallet_balance_ngn || 0) + investment.amount_ngn;
        const { error: balanceError } = await supabase
          .from('users')
          .update({ wallet_balance_ngn: newBalance })
          .eq('id', investment.investor_id);

        if (balanceError) {
          console.error(`Error updating wallet balance:`, balanceError);
          errors.push({
            investment_id: investment.id,
            error: balanceError.message,
          });
          failureCount++;
          continue;
        }

        // Update investment status
        const { error: updateError } = await supabase
          .from('investments')
          .update({
            payment_status: 'refunded',
            refund_amount: investment.amount_ngn,
            refund_processed_at: new Date().toISOString(),
          })
          .eq('id', investment.id);

        if (updateError) {
          console.error(`Error updating investment:`, updateError);
          errors.push({
            investment_id: investment.id,
            error: updateError.message,
          });
          failureCount++;
          continue;
        }

        // Create notification
        await supabase.from('notifications').insert({
          user_id: investment.investor_id,
          title: 'Investment Refunded',
          message: `Your investment of ₦${investment.amount_ngn.toLocaleString()} in ${investment.tokenization?.property?.title || 'property'} has been refunded to your wallet.`,
          notification_type: 'refund_processed',
          priority: 'high',
          action_url: '/wallet/dashboard',
          action_data: {
            investment_id: investment.id,
            refund_amount: investment.amount_ngn,
            tokenization_id: investment.tokenization_id,
          },
        });

        // Log activity
        await supabase.from('activity_logs').insert({
          user_id: investment.investor_id,
          activity_type: 'refund_processed',
          description: `Refund of ₦${investment.amount_ngn.toLocaleString()} processed for failed investment`,
          metadata: {
            investment_id: investment.id,
            tokenization_id: investment.tokenization_id,
            refund_amount: investment.amount_ngn,
            tokens_requested: investment.tokens_requested,
            new_wallet_balance: newBalance,
          },
        });

        console.log(`Successfully processed refund for investment ${investment.id}`);
        successCount++;

      } catch (error: any) {
        console.error(`Error processing refund for investment ${investment.id}:`, error);
        errors.push({
          investment_id: investment.id,
          error: error.message,
        });
        failureCount++;
      }
    }

    console.log(`Refund processing complete: ${successCount} successful, ${failureCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${successCount} refunds successfully`,
      refunds_processed: successCount,
      failures: failureCount,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in refund processing:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
