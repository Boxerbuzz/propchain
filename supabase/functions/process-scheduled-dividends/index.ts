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
          token_symbol,
          fees,
          minted_at
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

        const tokenization = schedule.tokenizations;
        
        // Get fee percentages from tokenization, fallback to defaults
        const platformFeePercentage = tokenization.fees?.platform_fee_percentage || 1.0;
        const managementFeePercentage = tokenization.fees?.management_fee_percentage || 2.5;

        // Determine period start date
        const periodStart = schedule.last_distribution_date || tokenization.minted_at;
        const periodEnd = schedule.next_distribution_date;

        console.log(`[SCHEDULED-DIVIDENDS] Period: ${periodStart} to ${periodEnd}`);

        // Fetch confirmed rentals in period
        const { data: rentals, error: rentalError } = await supabase
          .from('property_rentals')
          .select('id, amount_paid_ngn, monthly_rent_ngn')
          .eq('property_id', schedule.property_id)
          .eq('payment_status', 'confirmed')
          .in('distribution_status', ['pending'])
          .or(`distribution_status.is.null`)
          .gte('start_date', periodStart)
          .lte('start_date', periodEnd);

        if (rentalError) throw rentalError;

        if (!rentals || rentals.length === 0) {
          console.log(`[SCHEDULED-DIVIDENDS] No accumulated rental income for schedule ${schedule.id}`);
          
          // Still update schedule to next date
          const nextDate = calculateNextDate(schedule.frequency, new Date(schedule.next_distribution_date));
          await supabase
            .from('dividend_schedules')
            .update({
              last_distribution_date: today,
              next_distribution_date: nextDate,
              updated_at: new Date().toISOString()
            })
            .eq('id', schedule.id);

          results.push({
            schedule_id: schedule.id,
            success: true,
            skipped: true,
            reason: 'No rental income to distribute'
          });
          successCount++;
          continue;
        }

        console.log(`[SCHEDULED-DIVIDENDS] Found ${rentals.length} rentals to aggregate`);

        // Aggregate rental income
        const grossAmount = rentals.reduce((sum, r) => 
          sum + (r.amount_paid_ngn || r.monthly_rent_ngn), 0);

        console.log(`[SCHEDULED-DIVIDENDS] Gross amount: ₦${grossAmount.toLocaleString()}`);

        // Calculate fees
        const platformFeeAmount = grossAmount * (platformFeePercentage / 100);
        const managementFeeAmount = grossAmount * (managementFeePercentage / 100);
        const totalDistributable = grossAmount - platformFeeAmount - managementFeeAmount;

        console.log(`[SCHEDULED-DIVIDENDS] Platform fee: ₦${platformFeeAmount.toFixed(2)}`);
        console.log(`[SCHEDULED-DIVIDENDS] Management fee: ₦${managementFeeAmount.toFixed(2)}`);
        console.log(`[SCHEDULED-DIVIDENDS] Distributable: ₦${totalDistributable.toFixed(2)}`);

        // Get token holders with balance > 0
        const { data: holders, error: holdersError } = await supabase
          .from('token_holdings')
          .select('user_id, balance')
          .eq('tokenization_id', schedule.tokenization_id)
          .gt('balance', 0);

        if (holdersError) throw holdersError;

        if (!holders || holders.length === 0) {
          throw new Error('No token holders found');
        }

        const totalTokens = holders.reduce((sum, h) => sum + h.balance, 0);
        const perTokenAmount = totalDistributable / totalTokens;

        console.log(`[SCHEDULED-DIVIDENDS] ${holders.length} holders, ${totalTokens} total tokens`);
        console.log(`[SCHEDULED-DIVIDENDS] Per token: ₦${perTokenAmount.toFixed(4)}`);

        // Create distribution record
        const { data: distribution, error: distributionError } = await supabase
          .from('dividend_distributions')
          .insert({
            property_id: schedule.property_id,
            tokenization_id: schedule.tokenization_id,
            distribution_date: new Date().toISOString().split('T')[0],
            total_amount_ngn: totalDistributable,
            per_token_amount: perTokenAmount,
            total_recipients: holders.length,
            payment_status: 'pending',
            distribution_period: formatPeriod(schedule.frequency, periodEnd),
            included_rental_ids: JSON.stringify(rentals.map(r => r.id)),
            gross_amount_ngn: grossAmount,
            platform_fee_amount: platformFeeAmount,
            management_fee_amount: managementFeeAmount,
            created_by: null
          })
          .select()
          .single();

        if (distributionError) throw distributionError;

        console.log(`[SCHEDULED-DIVIDENDS] Created distribution ${distribution.id}`);

        // Create dividend_payments for each holder
        const payments = holders.map(holder => ({
          distribution_id: distribution.id,
          recipient_id: holder.user_id,
          tokenization_id: schedule.tokenization_id,
          tokens_held: holder.balance,
          amount_ngn: perTokenAmount * holder.balance,
          payment_status: 'pending'
        }));

        const { error: paymentsError } = await supabase
          .from('dividend_payments')
          .insert(payments);

        if (paymentsError) throw paymentsError;

        console.log(`[SCHEDULED-DIVIDENDS] Created ${payments.length} dividend payments`);

        // Update rentals
        const { error: updateRentalsError } = await supabase
          .from('property_rentals')
          .update({
            distribution_status: 'processing',
            distribution_id: distribution.id
          })
          .in('id', rentals.map(r => r.id));

        if (updateRentalsError) throw updateRentalsError;

        // Invoke distribute-dividends (existing function)
        console.log(`[SCHEDULED-DIVIDENDS] Invoking distribute-dividends`);
        const { data: distributeResult, error: distributeError } = await supabase.functions.invoke(
          'distribute-dividends',
          {
            body: { distribution_id: distribution.id }
          }
        );

        if (distributeError) throw distributeError;
        if (!distributeResult?.success) throw new Error(distributeResult?.error || 'Failed to distribute dividends');

        console.log(`[SCHEDULED-DIVIDENDS] Distribution executed successfully`);

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
        console.log(`[SCHEDULED-DIVIDENDS] Next distribution: ${nextDate}`);
        
        results.push({
          schedule_id: schedule.id,
          property_id: schedule.property_id,
          rentals_aggregated: rentals.length,
          gross_amount: grossAmount,
          distributable_amount: totalDistributable,
          distribution_id: distribution.id,
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

// Helper function to format period label
function formatPeriod(frequency: string, endDate: string): string {
  const date = new Date(endDate);
  const year = date.getFullYear();
  const month = date.toLocaleString('default', { month: 'long' });
  
  if (frequency === 'monthly') {
    return `${month} ${year}`;
  } else if (frequency === 'quarterly') {
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `Q${quarter} ${year}`;
  } else {
    return `${year}`;
  }
}
