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

    const { withdrawal_id } = await req.json();

    // Get withdrawal request
    const { data: withdrawal } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawal_id)
      .eq('user_id', user.id)
      .single();

    if (!withdrawal) {
      return new Response(JSON.stringify({ error: 'Withdrawal not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (withdrawal.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Only pending withdrawals can be cancelled' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update status to cancelled
    await supabase
      .from('withdrawal_requests')
      .update({ status: 'cancelled' })
      .eq('id', withdrawal_id);

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Withdrawal Cancelled',
      message: `Your withdrawal request for ₦${withdrawal.amount_ngn.toLocaleString()} has been cancelled.`,
      notification_type: 'withdrawal_cancelled',
      priority: 'normal',
      action_url: '/account/dashboard',
    });

    console.log('Withdrawal cancelled:', withdrawal_id);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Withdrawal cancelled successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error cancelling withdrawal:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
