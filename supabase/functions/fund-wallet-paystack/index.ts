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

    const { amount_ngn, target_token, email } = await req.json();

    if (!amount_ngn || !target_token || !email) {
      throw new Error("Missing required fields");
    }

    // Generate unique reference
    const reference = `fund_${user.id.slice(0, 8)}_${Date.now()}`;

    // Initialize Paystack payment
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount_ngn * 100), // Convert to kobo
        reference,
        metadata: {
          user_id: user.id,
          target_token,
          amount_ngn,
          transaction_type: 'wallet_funding',
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      throw new Error(paystackData.message || "Failed to initialize payment");
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      activity_type: 'wallet_funding_initiated',
      description: `Initiated wallet funding of ₦${amount_ngn.toLocaleString()} for ${target_token}`,
      metadata: {
        amount_ngn,
        target_token,
        reference,
        paystack_reference: paystackData.data.reference,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error funding wallet:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
