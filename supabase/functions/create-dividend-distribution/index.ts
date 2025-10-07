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

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { rental_id, platform_fee_percentage = 1.0, management_fee_percentage = 2.5 } = await req.json();

    // Get rental details
    const { data: rental } = await supabase
      .from('property_rentals')
      .select('*, properties!inner(*)')
      .eq('id', rental_id)
      .single();

    if (!rental) {
      return new Response(JSON.stringify({ error: 'Rental not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is property owner
    if (rental.properties.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get tokenization for this property
    const { data: tokenization } = await supabase
      .from('tokenizations')
      .select('*')
      .eq('property_id', rental.property_id)
      .eq('status', 'active')
      .single();

    if (!tokenization) {
      return new Response(JSON.stringify({ error: 'No active tokenization found for this property' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate distributable amount
    const rental_income = Number(rental.amount_paid_ngn || rental.monthly_rent_ngn);
    const platform_fee = rental_income * (platform_fee_percentage / 100);
    const management_fee = rental_income * (management_fee_percentage / 100);
    const total_distributable = rental_income - platform_fee - management_fee;

    // Get all token holders
    const { data: tokenHolders } = await supabase
      .from('token_holdings')
      .select('user_id, balance')
      .eq('tokenization_id', tokenization.id)
      .gt('balance', 0);

    if (!tokenHolders || tokenHolders.length === 0) {
      return new Response(JSON.stringify({ error: 'No token holders found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const total_tokens_held = tokenHolders.reduce((sum, holder) => sum + Number(holder.balance), 0);
    const per_token_amount = total_distributable / total_tokens_held;

    // Create dividend distribution
    const { data: distribution, error: distError } = await supabase
      .from('dividend_distributions')
      .insert({
        property_id: rental.property_id,
        tokenization_id: tokenization.id,
        total_amount_ngn: total_distributable,
        per_token_amount,
        distribution_date: new Date().toISOString().split('T')[0],
        total_recipients: tokenHolders.length,
        created_by: user.id,
        payment_status: 'pending',
        distribution_period: `${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`
      })
      .select()
      .single();

    if (distError) throw distError;

    // Create dividend payment records for each token holder
    const payments = tokenHolders.map(holder => ({
      distribution_id: distribution.id,
      recipient_id: holder.user_id,
      tokenization_id: tokenization.id,
      tokens_held: holder.balance,
      amount_ngn: per_token_amount * Number(holder.balance),
      net_amount: per_token_amount * Number(holder.balance), // No tax withholding for now
      payment_status: 'pending'
    }));

    const { error: paymentsError } = await supabase
      .from('dividend_payments')
      .insert(payments);

    if (paymentsError) throw paymentsError;

    // Update rental distribution status
    await supabase
      .from('property_rentals')
      .update({
        distribution_status: 'processing',
        distribution_id: distribution.id
      })
      .eq('id', rental_id);

    console.log('Dividend distribution created:', distribution.id);

    return new Response(JSON.stringify({
      success: true,
      distribution,
      total_amount: total_distributable,
      per_token_amount,
      total_recipients: tokenHolders.length,
      message: 'Dividend distribution created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error creating dividend distribution:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
