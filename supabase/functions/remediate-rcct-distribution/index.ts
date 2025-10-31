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
    console.log('[RCCT-REMEDIATION] Starting RCCT token distribution remediation');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get RCCT tokenization
    const { data: tokenization, error: tokenError } = await supabase
      .from('tokenizations')
      .select('id, token_id, token_symbol, tokens_sold')
      .eq('token_symbol', 'RCCT')
      .single();

    if (tokenError || !tokenization) {
      throw new Error('RCCT tokenization not found');
    }

    console.log(`[RCCT-REMEDIATION] Found RCCT tokenization: ${tokenization.id}`);

    // The two users who were missed
    const targetUserIds = [
      '0900972f-8903-4b8c-99e2-b9a5ca5e31bc', // 0.0.6974643
      'b8956f7a-7c1d-4201-a2f3-7c4559176871'  // 0.0.7158111
    ];

    // Get their confirmed investments
    const { data: investments, error: invError } = await supabase
      .from('investments')
      .select('*')
      .eq('tokenization_id', tokenization.id)
      .in('investor_id', targetUserIds)
      .eq('payment_status', 'confirmed');

    if (invError || !investments || investments.length === 0) {
      throw new Error('No confirmed investments found for target users');
    }

    const totalTokensNeeded = investments.reduce((sum, inv) => sum + inv.tokens_requested, 0);
    console.log(`[RCCT-REMEDIATION] Need to distribute ${totalTokensNeeded} tokens to ${investments.length} investments`);

    // Step 1: Mint the additional tokens needed
    console.log(`[RCCT-REMEDIATION] Minting ${totalTokensNeeded} additional RCCT tokens`);
    
    const { data: mintResult, error: mintError } = await supabase.functions.invoke('mint-hedera-tokens', {
      body: {
        tokenId: tokenization.token_id,
        amount: totalTokensNeeded
      }
    });

    if (mintError) {
      throw new Error(`Failed to mint tokens: ${mintError.message}`);
    }

    console.log(`[RCCT-REMEDIATION] Minted successfully:`, mintResult);

    // Step 2: Distribute to the two users
    console.log(`[RCCT-REMEDIATION] Distributing tokens to target users`);
    
    const { data: distResult, error: distError } = await supabase.functions.invoke('distribute-tokens-to-kyc-users', {
      body: {
        tokenization_id: tokenization.id,
        target_user_ids: targetUserIds
      }
    });

    if (distError) {
      throw new Error(`Failed to distribute tokens: ${distError.message}`);
    }

    console.log(`[RCCT-REMEDIATION] Distribution complete:`, distResult);

    // Step 3: Update tokenization tokens_sold count
    const newTokensSold = tokenization.tokens_sold + totalTokensNeeded;
    await supabase
      .from('tokenizations')
      .update({ tokens_sold: newTokensSold })
      .eq('id', tokenization.id);

    console.log(`[RCCT-REMEDIATION] Updated tokens_sold from ${tokenization.tokens_sold} to ${newTokensSold}`);

    return new Response(
      JSON.stringify({
        success: true,
        tokens_minted: totalTokensNeeded,
        distribution_result: distResult,
        mint_result: mintResult
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[RCCT-REMEDIATION] Fatal error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
