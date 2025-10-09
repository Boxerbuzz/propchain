import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { 
      tokenization_id, 
      investor_id, 
      amount_ngn, 
      tokens_requested, 
      payment_method, // 'paystack' or 'wallet'
      email 
    } = await req.json();

    if (!tokenization_id || !investor_id || !amount_ngn || !tokens_requested || !payment_method) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`[CREATE-INVESTMENT] Creating investment for ${payment_method} payment`);

    // Step 0: Server-side validation - Fetch tokenization details
    const { data: tokenization, error: tokenizationError } = await supabase
      .from('tokenizations')
      .select('*')
      .eq('id', tokenization_id)
      .single();

    if (tokenizationError || !tokenization) {
      console.error('[CREATE-INVESTMENT] Tokenization not found:', tokenizationError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Tokenization not found'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate investment amount
    if (amount_ngn < tokenization.min_investment) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Investment amount must be at least ₦${tokenization.min_investment.toLocaleString()}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (tokenization.max_investment && amount_ngn > tokenization.max_investment) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Investment amount cannot exceed ₦${tokenization.max_investment.toLocaleString()}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate tokenization is active
    if (tokenization.status !== 'active') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Investment window is not active'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate investment window
    const now = new Date();
    const windowStart = new Date(tokenization.investment_window_start);
    const windowEnd = new Date(tokenization.investment_window_end);
    
    if (now < windowStart || now > windowEnd) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Investment window has closed'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate available tokens
    const availableTokens = tokenization.total_supply - tokenization.tokens_sold;
    if (tokens_requested > availableTokens) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Only ${availableTokens.toLocaleString()} tokens available`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate target raise not exceeded
    const newTotalRaise = tokenization.current_raise + amount_ngn;
    if (newTotalRaise > tokenization.target_raise) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Target raise would be exceeded. Please reduce investment amount.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Create investment with reservation using database function
    const { data: reservationResult, error: reservationError } = await supabase.rpc(
      'create_investment_with_reservation',
      {
        p_tokenization_id: tokenization_id,
        p_investor_id: investor_id,
        p_amount_ngn: amount_ngn,
        p_tokens_requested: tokens_requested,
        p_reservation_minutes: 15
      }
    );

    if (reservationError || !reservationResult?.success) {
      console.error('[CREATE-INVESTMENT] Reservation failed:', reservationError || reservationResult?.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: reservationResult?.error || reservationError?.message || 'Failed to reserve tokens'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const investment_id = reservationResult.investment_id;
    console.log(`[CREATE-INVESTMENT] Investment created with ID: ${investment_id}`);

    // Step 2: Handle payment based on method
    if (payment_method === 'paystack') {
      if (!email) {
        return new Response(
          JSON.stringify({ error: 'Email required for Paystack payment' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Initialize Paystack payment
      console.log('[CREATE-INVESTMENT] Initializing Paystack payment');
      // Ensure amount is a clean number (remove any commas or formatting)
      const cleanAmount = typeof amount_ngn === 'string' 
        ? parseFloat(amount_ngn.replace(/,/g, ''))
        : amount_ngn;
      
      const { data: paystackData, error: paystackError } = await supabase.functions.invoke(
        'initialize-paystack-payment',
        {
          body: {
            email,
            amount: Math.round(cleanAmount * 100), // Convert to kobo
            reference: investment_id
          }
        }
      );

      if (paystackError || !paystackData?.success) {
        console.error('[CREATE-INVESTMENT] Paystack initialization failed:', paystackError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to initialize payment'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update investment with Paystack reference
      await supabase
        .from('investments')
        .update({ 
          paystack_reference: investment_id,
          payment_method: 'paystack'
        })
        .eq('id', investment_id);

      return new Response(
        JSON.stringify({
          success: true,
          investment_id,
          payment_url: paystackData.data.authorization_url,
          reservation_expires_at: reservationResult.reservation_expires_at
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (payment_method === 'wallet') {
      // Process wallet payment immediately
      console.log('[CREATE-INVESTMENT] Processing wallet payment');
      const { data: walletData, error: walletError } = await supabase.functions.invoke(
        'deduct-wallet-balance',
        {
          body: {
            userId: investor_id,
            amount: amount_ngn,
            reference: investment_id
          }
        }
      );

      if (walletError || !walletData?.success) {
        console.error('[CREATE-INVESTMENT] Wallet payment failed:', walletError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: walletData?.error || 'Insufficient wallet balance or payment failed'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update investment status
      await supabase
        .from('investments')
        .update({ 
          payment_method: 'wallet',
          payment_status: 'confirmed',
          payment_confirmed_at: new Date().toISOString()
        })
        .eq('id', investment_id);

      // Trigger post-payment processing
      await supabase.functions.invoke('process-investment-completion', {
        body: { investment_id }
      });

      return new Response(
        JSON.stringify({
          success: true,
          investment_id,
          message: 'Investment completed successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid payment method' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[CREATE-INVESTMENT] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});