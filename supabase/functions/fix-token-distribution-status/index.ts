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

    console.log('[FIX-TOKEN-STATUS] Starting fix for inconsistent token distribution statuses...');

    // Find investments where:
    // 1. payment_status is 'confirmed' (not updated)
    // 2. User has tokens in token_holdings for that tokenization (tokens were distributed)
    const { data: inconsistentInvestments, error: queryError } = await supabase
      .from('investments')
      .select(`
        id,
        investor_id,
        tokenization_id,
        tokens_requested,
        tokens_allocated,
        payment_status,
        token_holdings!inner (
          balance,
          user_id,
          tokenization_id
        )
      `)
      .eq('payment_status', 'confirmed')
      .gt('token_holdings.balance', 0);

    if (queryError) {
      throw queryError;
    }

    if (!inconsistentInvestments || inconsistentInvestments.length === 0) {
      console.log('[FIX-TOKEN-STATUS] No inconsistent records found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No inconsistent records found',
          fixed: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[FIX-TOKEN-STATUS] Found ${inconsistentInvestments.length} inconsistent records`);

    let fixed = 0;
    const details = [];

    for (const investment of inconsistentInvestments) {
      console.log(`[FIX-TOKEN-STATUS] Fixing investment ${investment.id} for user ${investment.investor_id}`);

      // Update investment status to tokens_distributed
      const { error: updateError } = await supabase
        .from('investments')
        .update({
          payment_status: 'tokens_distributed',
          tokens_allocated: investment.tokens_requested,
          updated_at: new Date().toISOString()
        })
        .eq('id', investment.id);

      if (updateError) {
        console.error(`[FIX-TOKEN-STATUS] Failed to update investment ${investment.id}:`, updateError);
        details.push({
          investment_id: investment.id,
          status: 'failed',
          error: updateError.message
        });
        continue;
      }

      // Create notification for the user
      await supabase
        .from('notifications')
        .insert({
          user_id: investment.investor_id,
          title: 'Token Distribution Status Updated',
          message: `Your investment status has been updated. Your tokens are now confirmed as distributed.`,
          notification_type: 'system',
          priority: 'low'
        });

      fixed++;
      details.push({
        investment_id: investment.id,
        user_id: investment.investor_id,
        status: 'fixed',
        tokens: investment.tokens_requested
      });

      console.log(`[FIX-TOKEN-STATUS] Successfully fixed investment ${investment.id}`);
    }

    console.log(`[FIX-TOKEN-STATUS] Fix complete. Fixed: ${fixed}/${inconsistentInvestments.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Fixed ${fixed} inconsistent records`,
        fixed,
        total_found: inconsistentInvestments.length,
        details
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[FIX-TOKEN-STATUS] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
