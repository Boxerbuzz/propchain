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
    console.log('[SCHEDULED-DIVIDENDS] Starting scheduled dividend processing');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Log job start
    const { data: jobRecord } = await supabase
      .from('automation_jobs')
      .insert({
        job_name: 'process-scheduled-dividends',
        status: 'running',
        metadata: { started_at: new Date().toISOString() }
      })
      .select()
      .single();

    const today = new Date().toISOString().split('T')[0];

    // Query for schedules due today
    const { data: dueSchedules, error: queryError } = await supabase
      .from('dividend_schedules')
      .select(`
        *,
        properties (
          id,
          title,
          owner_id
        ),
        tokenizations (
          id,
          token_name,
          token_symbol
        )
      `)
      .eq('auto_distribute', true)
      .lte('next_distribution_date', today);

    if (queryError) throw queryError;

    if (!dueSchedules || dueSchedules.length === 0) {
      console.log('[SCHEDULED-DIVIDENDS] No schedules due today');
      
      await supabase
        .from('automation_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          metadata: { 
            processed_count: 0,
            message: 'No schedules due today'
          }
        })
        .eq('id', jobRecord.id);

      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No schedules due' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[SCHEDULED-DIVIDENDS] Found ${dueSchedules.length} schedules due`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const schedule of dueSchedules) {
      try {
        console.log(`[SCHEDULED-DIVIDENDS] Processing schedule ${schedule.id}`);

        // Find accumulated rental income since last distribution
        const { data: rentals, error: rentalError } = await supabase
          .from('property_rentals')
          .select('*')
          .eq('property_id', schedule.property_id)
          .eq('payment_status', 'confirmed')
          .or(`distribution_status.eq.pending,distribution_status.is.null`);

        if (rentalError) throw rentalError;

        if (!rentals || rentals.length === 0) {
          console.log(`[SCHEDULED-DIVIDENDS] No accumulated rental income for schedule ${schedule.id}`);
          results.push({
            schedule_id: schedule.id,
            success: true,
            skipped: true,
            reason: 'No rental income to distribute'
          });
          continue;
        }

        console.log(`[SCHEDULED-DIVIDENDS] Found ${rentals.length} rentals to process`);

        // Process each rental
        for (const rental of rentals) {
          // Create dividend distribution
          const { data: createResult, error: createError } = await supabase.functions.invoke(
            'create-dividend-distribution',
            {
              body: {
                rental_id: rental.id,
                property_id: rental.property_id,
                tokenization_id: schedule.tokenization_id
              }
            }
          );

          if (createError) throw createError;
          if (!createResult?.success) throw new Error(createResult?.error || 'Failed to create distribution');

          const distributionId = createResult.data.distribution_id;

          // Execute distribution
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
        }

        // Update schedule for next distribution
        const nextDate = calculateNextDate(schedule.frequency, new Date(schedule.next_distribution_date));

        await supabase
          .from('dividend_schedules')
          .update({
            last_distribution_date: today,
            next_distribution_date: nextDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', schedule.id);

        console.log(`[SCHEDULED-DIVIDENDS] ✅ Successfully processed schedule ${schedule.id}`);
        
        results.push({
          schedule_id: schedule.id,
          property_id: schedule.property_id,
          rentals_processed: rentals.length,
          next_distribution_date: nextDate,
          success: true
        });
        
        successCount++;

      } catch (error) {
        console.error(`[SCHEDULED-DIVIDENDS] ❌ Error processing schedule ${schedule.id}:`, error);
        
        results.push({
          schedule_id: schedule.id,
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
        error_message: errorCount > 0 ? `${errorCount} schedules failed` : null,
        metadata: {
          processed_count: dueSchedules.length,
          success_count: successCount,
          error_count: errorCount,
          results
        }
      })
      .eq('id', jobRecord.id);

    console.log(`[SCHEDULED-DIVIDENDS] Completed: ${successCount} successful, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: dueSchedules.length,
        successful: successCount,
        errors: errorCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SCHEDULED-DIVIDENDS] Fatal error:', error);

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

// Helper function to calculate next distribution date
function calculateNextDate(frequency: string, lastDate: Date): string {
  const next = new Date(lastDate);
  
  switch (frequency) {
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'annually':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  
  return next.toISOString().split('T')[0];
}
