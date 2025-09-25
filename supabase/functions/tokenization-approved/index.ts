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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { tokenizationId } = await req.json();

    if (!tokenizationId) {
      return new Response(JSON.stringify({ error: 'Missing tokenizationId' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get tokenization details
    const { data: tokenization, error: tokenError } = await supabaseClient
      .from('tokenizations')
      .select('*, properties(*)')
      .eq('id', tokenizationId)
      .single();

    if (tokenError || !tokenization) {
      console.error('Error fetching tokenization:', tokenError);
      return new Response(JSON.stringify({ error: 'Tokenization not found' }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Call create-hedera-token edge function
    const tokenResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/create-hedera-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenName: tokenization.token_name,
        tokenSymbol: tokenization.token_symbol,
        totalSupply: tokenization.total_supply,
        decimals: 0,
      }),
    });

    const tokenResult = await tokenResponse.json();

    if (!tokenResult.success) {
      console.error('Error creating Hedera token:', tokenResult.error);
      return new Response(JSON.stringify({ error: 'Failed to create token' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Update tokenization with Hedera token details
    const { error: updateError } = await supabaseClient
      .from('tokenizations')
      .update({
        token_id: tokenResult.data.tokenId,
        minting_transaction_id: tokenResult.data.transactionId,
        status: 'active',
        minted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', tokenizationId);

    if (updateError) {
      console.error('Error updating tokenization:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update tokenization' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Create notification for property owner
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: tokenization.properties.owner_id,
        notification_type: 'tokenization_approved',
        title: 'Tokenization Approved & Active',
        message: `Your property "${tokenization.properties.title}" has been successfully tokenized. Token ID: ${tokenResult.data.tokenId}`,
        action_url: `/property/${tokenization.properties.id}/view`,
      });

    console.log(`Tokenization ${tokenizationId} successfully activated with token ID: ${tokenResult.data.tokenId}`);

    return new Response(JSON.stringify({ 
      success: true,
      data: { 
        tokenId: tokenResult.data.tokenId,
        transactionId: tokenResult.data.transactionId 
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in tokenization-approved:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});