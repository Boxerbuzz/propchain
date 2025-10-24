import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    console.log('[RETRY-TREASURY] Starting treasury creation retry process...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query for tokenizations with tokens but missing treasury accounts
    console.log('[RETRY-TREASURY] Querying for tokenizations missing treasury accounts...');
    const { data: missingTreasuries, error: queryError } = await supabase
      .from('tokenizations')
      .select(`
        id,
        token_name,
        token_symbol,
        token_id,
        property_id,
        properties!inner(
          title,
          owner_id
        )
      `)
      .not('token_id', 'is', null)
      .is('treasury_account_id', null)
      .eq('status', 'active');

    if (queryError) {
      console.error('[RETRY-TREASURY] Error querying tokenizations:', queryError);
      throw queryError;
    }

    console.log(`[RETRY-TREASURY] Found ${missingTreasuries?.length || 0} tokenizations missing treasuries`);

    if (!missingTreasuries || missingTreasuries.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          summary: {
            total_found: 0,
            successfully_fixed: 0,
            failed: 0,
          },
          message: 'No tokenizations found missing treasury accounts',
          fixed_tokenizations: [],
          failed_tokenizations: [],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Process each tokenization
    const fixedTokenizations = [];
    const failedTokenizations = [];

    for (const tokenization of missingTreasuries) {
      console.log(`[RETRY-TREASURY] Processing tokenization: ${tokenization.id} (${tokenization.token_name} - ${tokenization.token_symbol})`);
      
      try {
        // Call the existing create-property-treasury function
        const { data: treasuryResult, error: treasuryError } = await supabase.functions.invoke(
          'create-property-treasury',
          {
            body: { tokenization_id: tokenization.id }
          }
        );

        if (treasuryError) {
          console.error(`[RETRY-TREASURY] Failed to create treasury for ${tokenization.token_name}:`, treasuryError);
          failedTokenizations.push({
            tokenization_id: tokenization.id,
            token_name: tokenization.token_name,
            token_symbol: tokenization.token_symbol,
            error: treasuryError.message || 'Unknown error',
          });
          continue;
        }

        console.log(`[RETRY-TREASURY] Successfully created treasury for ${tokenization.token_name}: ${treasuryResult?.treasury_account_id}`);

        // Log success in activity logs
        await supabase.from('activity_logs').insert({
          user_id: tokenization.properties.owner_id,
          property_id: tokenization.property_id,
          tokenization_id: tokenization.id,
          activity_type: 'treasury_retry_success',
          description: `Treasury account successfully created via retry for ${tokenization.token_name} (${tokenization.token_symbol})`,
          metadata: {
            treasury_account_id: treasuryResult?.treasury_account_id,
            token_id: tokenization.token_id,
            retry_timestamp: new Date().toISOString(),
          },
        });

        fixedTokenizations.push({
          tokenization_id: tokenization.id,
          token_name: tokenization.token_name,
          token_symbol: tokenization.token_symbol,
          treasury_account_id: treasuryResult?.treasury_account_id,
          property_title: tokenization.properties.title,
        });

      } catch (error) {
        console.error(`[RETRY-TREASURY] Exception processing ${tokenization.token_name}:`, error);
        failedTokenizations.push({
          tokenization_id: tokenization.id,
          token_name: tokenization.token_name,
          token_symbol: tokenization.token_symbol,
          error: error.message || 'Unknown exception',
        });
      }
    }

    // Create summary activity log
    await supabase.from('activity_logs').insert({
      activity_type: 'treasury_retry_summary',
      description: `Treasury retry completed: ${fixedTokenizations.length} fixed, ${failedTokenizations.length} failed`,
      metadata: {
        total_found: missingTreasuries.length,
        successfully_fixed: fixedTokenizations.length,
        failed: failedTokenizations.length,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`[RETRY-TREASURY] Process complete: ${fixedTokenizations.length} fixed, ${failedTokenizations.length} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_found: missingTreasuries.length,
          successfully_fixed: fixedTokenizations.length,
          failed: failedTokenizations.length,
        },
        message: `Treasury retry completed: ${fixedTokenizations.length} treasuries created successfully`,
        fixed_tokenizations: fixedTokenizations,
        failed_tokenizations: failedTokenizations,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[RETRY-TREASURY] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
