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

    const { amount_ngn, withdrawal_method, bank_details, hedera_account } = await req.json();

    // Validate amount
    if (!amount_ngn || amount_ngn <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's KYC status
    const { data: userData } = await supabase
      .from('users')
      .select('kyc_status, daily_withdrawal_limit_ngn, monthly_withdrawal_limit_ngn')
      .eq('id', user.id)
      .single();

    if (userData?.kyc_status !== 'approved') {
      return new Response(JSON.stringify({ error: 'KYC verification required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('hedera_account_id', user.hedera_account_id)
      .single();

    if (!wallet) {
      return new Response(JSON.stringify({ error: 'Wallet not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check available balance
    if (wallet.balance_ngn < amount_ngn) {
      return new Response(JSON.stringify({ error: 'Insufficient balance' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check daily withdrawal limit
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { data: todayWithdrawals } = await supabase
      .from('withdrawal_requests')
      .select('amount_ngn')
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())
      .in('status', ['pending', 'processing', 'completed']);

    const todayTotal = todayWithdrawals?.reduce((sum, w) => sum + Number(w.amount_ngn), 0) || 0;

    if (todayTotal + amount_ngn > userData.daily_withdrawal_limit_ngn) {
      return new Response(JSON.stringify({ 
        error: 'Daily withdrawal limit exceeded',
        daily_limit: userData.daily_withdrawal_limit_ngn,
        today_total: todayTotal
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate processing fee (₦100 for bank, free for HBAR/USDC)
    const processing_fee_ngn = withdrawal_method === 'bank_transfer' ? 100 : 0;
    const net_amount_ngn = amount_ngn - processing_fee_ngn;

    // Create withdrawal request
    const withdrawalData: any = {
      user_id: user.id,
      wallet_id: wallet.id,
      amount_ngn,
      withdrawal_method,
      processing_fee_ngn,
      net_amount_ngn,
      status: 'pending',
    };

    if (withdrawal_method === 'bank_transfer' && bank_details) {
      withdrawalData.bank_account_number = bank_details.account_number;
      withdrawalData.bank_account_name = bank_details.account_name;
      withdrawalData.bank_name = bank_details.bank_name;
      withdrawalData.bank_code = bank_details.bank_code;
    } else if ((withdrawal_method === 'hedera' || withdrawal_method === 'usdc') && hedera_account) {
      withdrawalData.recipient_hedera_account = hedera_account;
    }

    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawal_requests')
      .insert(withdrawalData)
      .select()
      .single();

    if (withdrawalError) throw withdrawalError;

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Withdrawal Request Created',
      message: `Your withdrawal request for ₦${amount_ngn.toLocaleString()} has been created and is pending approval.`,
      notification_type: 'withdrawal_created',
      priority: 'normal',
      action_url: '/account/dashboard',
    });

    console.log('Withdrawal request created:', withdrawal.id);

    return new Response(JSON.stringify({ 
      success: true,
      withdrawal,
      message: 'Withdrawal request created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error initiating withdrawal:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
