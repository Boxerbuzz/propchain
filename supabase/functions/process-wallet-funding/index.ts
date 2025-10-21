import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Client, Hbar, TransferTransaction, AccountId, PrivateKey } from "npm:@hashgraph/sdk@^2.73.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Paystack signature
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    const crypto = await import("node:crypto");
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY!).update(body).digest('hex');
    
    if (hash !== signature) {
      throw new Error("Invalid signature");
    }

    const event = JSON.parse(body);

    if (event.event !== 'charge.success') {
      return new Response(JSON.stringify({ received: true }), { headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: txData } = event;
    const metadata = txData.metadata;

    if (metadata.transaction_type !== 'wallet_funding') {
      return new Response(JSON.stringify({ received: true }), { headers: corsHeaders });
    }

    const userId = metadata.user_id;
    const amountNgn = metadata.amount_ngn;
    const targetToken = metadata.target_token;

    // Get user's wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Calculate token amount (simplified - you'd use real exchange rates)
    const usdRate = 1600; // NGN to USD
    const hbarRate = 0.05; // USD per HBAR (example)
    
    let creditAmount = 0;
    
    if (targetToken === 'HBAR') {
      creditAmount = (amountNgn / usdRate) / hbarRate;
      
      // Transfer HBAR from operator to user
      const operatorId = Deno.env.get("HEDERA_OPERATOR_ID")!;
      const operatorKey = Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY")!;
      
      const client = Client.forTestnet();
      client.setOperator(AccountId.fromString(operatorId), PrivateKey.fromStringECDSA(operatorKey));

      const transaction = new TransferTransaction()
        .addHbarTransfer(operatorId, new Hbar(-creditAmount))
        .addHbarTransfer(wallet.hedera_account_id, new Hbar(creditAmount));

      const txResponse = await transaction.execute(client);
      await txResponse.getReceipt(client);

    } else if (targetToken === 'USDC') {
      creditAmount = amountNgn / usdRate;
      // TODO: Transfer USDC tokens
    }

    // Update wallet balance
    await supabase
      .from('wallets')
      .update({
        balance_ngn: wallet.balance_ngn + amountNgn,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: userId,
      activity_type: 'wallet_funded',
      description: `Wallet funded with ₦${amountNgn.toLocaleString()} → ${creditAmount.toFixed(4)} ${targetToken}`,
      metadata: {
        amount_ngn: amountNgn,
        target_token: targetToken,
        credit_amount: creditAmount,
        paystack_reference: txData.reference,
      },
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error processing wallet funding:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
