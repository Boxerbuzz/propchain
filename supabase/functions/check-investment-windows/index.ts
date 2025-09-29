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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[CHECK-WINDOWS] Checking for closed investment windows...');

    // Find tokenizations with closed investment windows that haven't been processed
    const { data: closedTokenizations, error: queryError } = await supabase
      .from('tokenizations')
      .select(`
        id,
        property_id,
        token_name,
        token_symbol,
        investment_window_end,
        status,
        minimum_raise,
        current_raise,
        total_supply,
        tokens_sold,
        properties!inner (
          id,
          title,
          owner_id
        )
      `)
      .eq('status', 'active')
      .lt('investment_window_end', new Date().toISOString())
      .gt('current_raise', 0); // Only process if there were actual investments

    if (queryError) {
      console.error('[CHECK-WINDOWS] Error querying tokenizations:', queryError);
      return new Response(
        JSON.stringify({ success: false, error: queryError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!closedTokenizations || closedTokenizations.length === 0) {
      console.log('[CHECK-WINDOWS] No closed investment windows found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No closed investment windows found',
          processed: 0 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[CHECK-WINDOWS] Found ${closedTokenizations.length} closed investment windows`);

    const results = [];

    for (const tokenization of closedTokenizations) {
      console.log(`[CHECK-WINDOWS] Processing tokenization: ${tokenization.id}`);

      // Check if minimum raise was met
      const raiseMet = tokenization.current_raise >= tokenization.minimum_raise;
      
      if (raiseMet) {
        // Mark as ready for minting
        const { error: updateError } = await supabase
          .from('tokenizations')
          .update({
            status: 'minting_ready',
            updated_at: new Date().toISOString()
          })
          .eq('id', tokenization.id);

        if (updateError) {
          console.error(`[CHECK-WINDOWS] Failed to update tokenization ${tokenization.id}:`, updateError);
          results.push({
            tokenization_id: tokenization.id,
            success: false,
            error: updateError.message
          });
          continue;
        }

        // Create notification for property owner
        await supabase
          .from('notifications')
          .insert({
            user_id: tokenization.properties.owner_id,
            title: 'Investment Window Closed - Ready for Minting',
            message: `The investment window for "${tokenization.properties.title}" has closed successfully. Raised ₦${tokenization.current_raise.toLocaleString()} of ₦${tokenization.minimum_raise.toLocaleString()} minimum. Token minting will begin shortly.`,
            notification_type: 'investment_window_closed',
            action_url: `/property/${tokenization.property_id}/tokenize`,
            action_data: {
              tokenization_id: tokenization.id,
              property_id: tokenization.property_id,
              total_raised: tokenization.current_raise,
              minimum_raise: tokenization.minimum_raise,
              status: 'minting_ready'
            }
          });

        // Log activity
        await supabase
          .from('activity_logs')
          .insert({
            user_id: tokenization.properties.owner_id,
            property_id: tokenization.property_id,
            tokenization_id: tokenization.id,
            activity_type: 'investment_window_closed',
            description: `Investment window closed successfully - Ready for token minting`,
            metadata: {
              total_raised: tokenization.current_raise,
              minimum_raise: tokenization.minimum_raise,
              tokens_sold: tokenization.tokens_sold,
              total_supply: tokenization.total_supply
            }
          });

        results.push({
          tokenization_id: tokenization.id,
          success: true,
          status: 'minting_ready',
          total_raised: tokenization.current_raise
        });

      } else {
        // Minimum raise not met - mark as failed and process refunds
        const { error: updateError } = await supabase
          .from('tokenizations')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', tokenization.id);

        if (updateError) {
          console.error(`[CHECK-WINDOWS] Failed to update failed tokenization ${tokenization.id}:`, updateError);
          continue;
        }

        // Mark all pending investments as refund_pending
        await supabase
          .from('investments')
          .update({
            payment_status: 'refund_pending',
            updated_at: new Date().toISOString()
          })
          .eq('tokenization_id', tokenization.id)
          .eq('payment_status', 'confirmed');

        // Create notification for property owner
        await supabase
          .from('notifications')
          .insert({
            user_id: tokenization.properties.owner_id,
            title: 'Investment Window Closed - Minimum Not Met',
            message: `The investment window for "${tokenization.properties.title}" has closed. Only ₦${tokenization.current_raise.toLocaleString()} was raised of the ₦${tokenization.minimum_raise.toLocaleString()} minimum required. All investors will be refunded.`,
            notification_type: 'investment_window_failed',
            action_url: `/property/${tokenization.property_id}`,
            action_data: {
              tokenization_id: tokenization.id,
              property_id: tokenization.property_id,
              total_raised: tokenization.current_raise,
              minimum_raise: tokenization.minimum_raise,
              status: 'failed'
            }
          });

        results.push({
          tokenization_id: tokenization.id,
          success: true,
          status: 'failed',
          total_raised: tokenization.current_raise,
          refunds_initiated: true
        });
      }
    }

    console.log(`[CHECK-WINDOWS] Processed ${results.length} tokenizations`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} closed investment windows`,
        processed: results.length,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[CHECK-WINDOWS] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});