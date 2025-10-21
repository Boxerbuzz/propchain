import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { amount_ngn, bank_account, account_number, bank_code } = await req.json();

    if (!amount_ngn || !account_number || !bank_code) {
      throw new Error("Missing required fields");
    }

    // Get user's wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.balance_ngn < amount_ngn) {
      throw new Error("Insufficient balance");
    }

    // Create transfer recipient in Paystack
    const recipientResponse = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name: bank_account,
        account_number,
        bank_code,
        currency: "NGN",
      }),
    });

    const recipientData = await recipientResponse.json();

    if (!recipientResponse.ok) {
      throw new Error(recipientData.message || "Failed to create recipient");
    }

    // Initiate transfer
    const transferResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: Math.round(amount_ngn * 100), // Convert to kobo
        recipient: recipientData.data.recipient_code,
        reason: "Wallet withdrawal",
      }),
    });

    const transferData = await transferResponse.json();

    if (!transferResponse.ok) {
      throw new Error(transferData.message || "Failed to initiate transfer");
    }

    // Deduct from wallet
    await supabase
      .from('wallets')
      .update({
        balance_ngn: wallet.balance_ngn - amount_ngn,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    // Create withdrawal request record
    await supabase.from('withdrawal_requests').insert({
      user_id: user.id,
      amount: amount_ngn,
      status: 'processing',
      payment_method: 'bank_transfer',
      bank_details: {
        account_number,
        bank_code,
        bank_account,
        paystack_transfer_code: transferData.data.transfer_code,
      },
    });

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      activity_type: 'withdrawal_initiated',
      description: `Initiated withdrawal of ₦${amount_ngn.toLocaleString()} to bank account`,
      metadata: {
        amount_ngn,
        account_number,
        transfer_code: transferData.data.transfer_code,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Withdrawal initiated successfully",
        transfer_code: transferData.data.transfer_code,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error processing withdrawal:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
