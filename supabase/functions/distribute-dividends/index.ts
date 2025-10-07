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
