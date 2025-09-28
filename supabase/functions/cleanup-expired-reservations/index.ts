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

    console.log('[CLEANUP-RESERVATIONS] Starting cleanup of expired reservations');

    // Get all active tokenizations to clean up their expired reservations
    const { data: tokenizations, error: tokenizationError } = await supabase
      .from('tokenizations')
      .select('property_id')
      .eq('status', 'active');

    if (tokenizationError) {
      console.error('[CLEANUP-RESERVATIONS] Failed to get tokenizations:', tokenizationError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to get tokenizations' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let totalCleaned = 0;

    // Process each property
    for (const tokenization of tokenizations || []) {
      console.log(`[CLEANUP-RESERVATIONS] Cleaning property: ${tokenization.property_id}`);
      
      const { data: cleanedCount, error: cleanupError } = await supabase.rpc(
        'cleanup_expired_reservations_for_property',
        { p_property_id: tokenization.property_id }
      );

      if (cleanupError) {
        console.error(`[CLEANUP-RESERVATIONS] Cleanup failed for property ${tokenization.property_id}:`, cleanupError);
      } else {
        console.log(`[CLEANUP-RESERVATIONS] Cleaned ${cleanedCount} reservations for property ${tokenization.property_id}`);
        totalCleaned += cleanedCount || 0;
      }
    }

    // Also clean up any expired reservations directly
    console.log('[CLEANUP-RESERVATIONS] Cleaning expired reservations directly');
    const { data: expiredInvestments, error: expiredError } = await supabase
      .from('investments')
      .select('id, tokenization_id, tokens_requested')
      .eq('reservation_status', 'active')
      .eq('payment_status', 'pending')
      .lt('reservation_expires_at', new Date().toISOString());

    if (!expiredError && expiredInvestments) {
      for (const investment of expiredInvestments) {
        console.log(`[CLEANUP-RESERVATIONS] Processing expired investment: ${investment.id}`);
        
        const { error: releaseError } = await supabase.rpc(
          'release_expired_reservation',
          {
            p_investment_id: investment.id,
            p_tokenization_id: investment.tokenization_id,
            p_tokens_to_release: investment.tokens_requested
          }
        );

        if (releaseError) {
          console.error(`[CLEANUP-RESERVATIONS] Failed to release reservation ${investment.id}:`, releaseError);
        } else {
          totalCleaned++;
        }
      }
    }

    console.log(`[CLEANUP-RESERVATIONS] Cleanup completed. Total reservations cleaned: ${totalCleaned}`);

    // Log cleanup activity
    await supabase
      .from('activity_logs')
      .insert({
        activity_type: 'system_cleanup',
        description: `Automated cleanup of expired reservations completed. ${totalCleaned} reservations cleaned.`,
        metadata: {
          cleaned_count: totalCleaned,
          cleanup_time: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleanup completed. ${totalCleaned} expired reservations processed.`,
        cleaned_count: totalCleaned
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[CLEANUP-RESERVATIONS] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});