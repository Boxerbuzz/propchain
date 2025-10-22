import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[AUTO-RENTAL-DIVIDENDS] Starting automated rental dividend distribution');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Log job start
    const { data: jobRecord } = await supabase
      .from('automation_jobs')
      .insert({
        job_name: 'auto-process-rental-dividends',
        status: 'running',
        metadata: { started_at: new Date().toISOString() }
      })
      .select()
      .single();

    // Query for rentals that are ready for distribution
    const { data: pendingRentals, error: queryError } = await supabase
      .from('property_rentals')
      .select(`
        *,
        properties (
          id,
          title,
          owner_id
        ),
        property_events (
          id,
          tokenization_id
        )
      `)
      .eq('distribution_status', 'pending')
      .eq('payment_status', 'confirmed');

    if (queryError) throw queryError;

    if (!pendingRentals || pendingRentals.length === 0) {
      console.log('[AUTO-RENTAL-DIVIDENDS] No pending rentals found');
      
      await supabase
        .from('automation_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          metadata: { 
            processed_count: 0,
            message: 'No pending rentals found'
          }
        })
        .eq('id', jobRecord.id);

      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No pending rentals' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[AUTO-RENTAL-DIVIDENDS] Found ${pendingRentals.length} pending rentals`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const rental of pendingRentals) {
      try {
        console.log(`[AUTO-RENTAL-DIVIDENDS] Processing rental ${rental.id}`);

        // Step 1: Create dividend distribution
        const { data: createResult, error: createError } = await supabase.functions.invoke(
          'create-dividend-distribution',
          {
            body: {
              rental_id: rental.id,
              property_id: rental.property_id,
              tokenization_id: rental.property_events?.tokenization_id
            }
          }
        );

        if (createError) throw createError;
        if (!createResult?.success) throw new Error(createResult?.error || 'Failed to create distribution');

        const distributionId = createResult.data.distribution_id;
        console.log(`[AUTO-RENTAL-DIVIDENDS] Created distribution ${distributionId}`);

        // Step 2: Execute dividend distribution
        const { data: distributeResult, error: distributeError } = await supabase.functions.invoke(
          'distribute-dividends',
          {
            body: {
              distribution_id: distributionId
            }
          }
        );

        if (distributeError) throw distributeError;
        if (!distributeResult?.success) throw new Error(distributeResult?.error || 'Failed to distribute dividends');

        console.log(`[AUTO-RENTAL-DIVIDENDS] ✅ Successfully processed rental ${rental.id}`);
        
        results.push({
          rental_id: rental.id,
          distribution_id: distributionId,
          success: true
        });
        
        successCount++;

      } catch (error) {
        console.error(`[AUTO-RENTAL-DIVIDENDS] ❌ Error processing rental ${rental.id}:`, error);
        
        // Mark rental as failed but don't stop processing others
        await supabase
          .from('property_rentals')
          .update({ distribution_status: 'failed' })
          .eq('id', rental.id);

        results.push({
          rental_id: rental.id,
          success: false,
          error: error.message
        });
        
        errorCount++;
      }
    }

    // Update job record
    await supabase
      .from('automation_jobs')
      .update({
        status: errorCount === 0 ? 'completed' : 'failed',
        completed_at: new Date().toISOString(),
        error_message: errorCount > 0 ? `${errorCount} rentals failed processing` : null,
        metadata: {
          processed_count: pendingRentals.length,
          success_count: successCount,
          error_count: errorCount,
          results
        }
      })
      .eq('id', jobRecord.id);

    console.log(`[AUTO-RENTAL-DIVIDENDS] Completed: ${successCount} successful, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: pendingRentals.length,
        successful: successCount,
        errors: errorCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[AUTO-RENTAL-DIVIDENDS] Fatal error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
