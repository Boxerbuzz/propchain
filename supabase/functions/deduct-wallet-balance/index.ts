import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, amount, reference } = await req.json();

    if (!userId || !amount || !reference) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single();

    if (walletError || !wallet) {
      return new Response(
        JSON.stringify({ success: false, error: 'Wallet not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check sufficient balance
    if (wallet.balance_ngn < amount) {
      return new Response(
        JSON.stringify({ success: false, error: 'Insufficient balance' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct balance
    const { error: updateError } = await supabaseClient
      .from('wallets')
      .update({
        balance_ngn: wallet.balance_ngn - amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    if (updateError) {
      console.error('Error updating wallet balance:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update wallet balance' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update investment status to confirmed for wallet payments
    const { error: investmentError } = await supabaseClient
      .from('investments')
      .update({
        payment_status: 'confirmed',
        payment_confirmed_at: new Date().toISOString(),
        payment_method: 'wallet',
      })
      .eq('id', reference);

    if (investmentError) {
      console.error('Error updating investment:', investmentError);
      // Rollback wallet balance
      await supabaseClient
        .from('wallets')
        .update({
          balance_ngn: wallet.balance_ngn,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id);
      
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to confirm investment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call process-investment-completion to handle post-payment actions
    try {
      const completionResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/process-investment-completion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investment_id: reference,
        }),
      });

      const completionResult = await completionResponse.json();
      
      if (!completionResult.success) {
        console.error('Investment completion processing failed:', completionResult.error);
      } else {
        console.log('Investment completion processed successfully');
      }
    } catch (error) {
      console.error('Error calling investment completion:', error);
    }

    // Insert activity log
    await supabaseClient
      .from('activity_logs')
      .insert({
        user_id: userId,
        activity_type: 'wallet_debit',
        description: `Wallet debited for investment: ₦${amount.toLocaleString()}`,
        metadata: {
          amount,
          reference,
          investment_id: reference,
          wallet_balance_before: wallet.balance_ngn,
          wallet_balance_after: wallet.balance_ngn - amount
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment processed successfully',
        new_balance: wallet.balance_ngn - amount,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in deduct-wallet-balance function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});