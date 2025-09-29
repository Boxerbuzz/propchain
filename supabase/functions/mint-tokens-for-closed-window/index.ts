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
    const { tokenization_id } = await req.json();

    if (!tokenization_id) {
      return new Response(
        JSON.stringify({ error: 'Tokenization ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`[MINT-TOKENS] Starting token minting for tokenization: ${tokenization_id}`);

    // Get tokenization details
    const { data: tokenization, error: tokenError } = await supabase
      .from('tokenizations')
      .select(`
        *,
        properties!inner (
          id,
          title,
          owner_id
        )
      `)
      .eq('id', tokenization_id)
      .eq('status', 'minting_ready')
      .single();

    if (tokenError || !tokenization) {
      console.error('[MINT-TOKENS] Tokenization not found or not ready for minting:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Tokenization not found or not ready for minting' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is already minted
    if (tokenization.token_id && tokenization.token_id !== 'pending') {
      console.log('[MINT-TOKENS] Token already minted, proceeding to distribution');
      
      // Call distribution function
      const distributeResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/distribute-tokens-to-kyc-users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenization_id: tokenization_id,
        }),
      });

      const distributeResult = await distributeResponse.json();
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Token already minted, distribution initiated',
          token_id: tokenization.token_id,
          distribution_result: distributeResult
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status to minting
    await supabase
      .from('tokenizations')
      .update({
        status: 'minting',
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenization_id);

    // Create Hedera token
    const mintResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/create-hedera-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenization_id: tokenization_id,
        property_id: tokenization.property_id,
        token_name: tokenization.token_name,
        token_symbol: tokenization.token_symbol,
        total_supply: tokenization.total_supply,
        decimals: 0,
        treasury_account_id: Deno.env.get("HEDERA_OPERATOR_ID"),
        admin_key: Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY"),
        supply_key: Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY"),
      }),
    });

    const mintResult = await mintResponse.json();

    if (!mintResult.success) {
      console.error('[MINT-TOKENS] Token minting failed:', mintResult.error);
      
      // Update status back to minting_ready for retry
      await supabase
        .from('tokenizations')
        .update({
          status: 'minting_ready',
          updated_at: new Date().toISOString()
        })
        .eq('id', tokenization_id);

      return new Response(
        JSON.stringify({
          success: false,
          error: `Token minting failed: ${mintResult.error}`
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[MINT-TOKENS] Token minted successfully: ${mintResult.data.tokenId}`);

    // Update tokenization with token ID and mark as minted
    const { error: updateError } = await supabase
      .from('tokenizations')
      .update({
        token_id: mintResult.data.tokenId,
        minting_transaction_id: mintResult.data.transactionId,
        minted_at: new Date().toISOString(),
        status: 'minted',
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenization_id);

    if (updateError) {
      console.error('[MINT-TOKENS] Failed to update tokenization:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create success notification for property owner
    await supabase
      .from('notifications')
      .insert({
        user_id: tokenization.properties.owner_id,
        title: 'Tokens Minted Successfully!',
        message: `Tokens for "${tokenization.properties.title}" have been successfully minted on Hedera. Token distribution to verified investors will begin shortly.`,
        notification_type: 'token_minted',
        action_url: `/property/${tokenization.property_id}/tokenize`,
        action_data: {
          tokenization_id: tokenization_id,
          property_id: tokenization.property_id,
          token_id: mintResult.data.tokenId,
          transaction_id: mintResult.data.transactionId
        }
      });

    // Log activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: tokenization.properties.owner_id,
        property_id: tokenization.property_id,
        tokenization_id: tokenization_id,
        activity_type: 'token_minted',
        description: `Hedera tokens minted successfully`,
        metadata: {
          token_id: mintResult.data.tokenId,
          transaction_id: mintResult.data.transactionId,
          total_supply: tokenization.total_supply,
          tokens_sold: tokenization.tokens_sold
        }
      });

    // Now initiate token distribution to KYC-verified users
    console.log('[MINT-TOKENS] Initiating token distribution');
    const distributeResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/distribute-tokens-to-kyc-users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenization_id: tokenization_id,
      }),
    });

    const distributeResult = await distributeResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token minted and distribution initiated',
        token_id: mintResult.data.tokenId,
        transaction_id: mintResult.data.transactionId,
        distribution_result: distributeResult
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[MINT-TOKENS] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});