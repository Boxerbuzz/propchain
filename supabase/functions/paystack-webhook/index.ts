import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AccountId, PrivateKey, TransferTransaction, Hbar } from "https://esm.sh/@hashgraph/sdk@2.73.1";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const HEDERA_OPERATOR_ID = Deno.env.get("HEDERA_OPERATOR_ID");
const HEDERA_OPERATOR_PRIVATE_KEY = Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("Paystack secret key must be set in Supabase secrets.");
}

// Verify webhook signature
async function verifySignature(rawBody: string, signature: string): Promise<boolean> {
  const crypto = await import("node:crypto");
  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
  return hash === signature;
}

// Handle investment payment
async function handleInvestmentPayment(event: any, supabaseClient: any) {
  console.log("[INVESTMENT] Processing investment payment");
  
  const transactionReference = event.data.reference;
  const amount = event.data.amount / 100; // Convert kobo to actual currency unit
  const currency = event.data.currency;
  const customerEmail = event.data.customer.email;

  console.log(`[INVESTMENT] Charge successful for reference: ${transactionReference}, amount: ${amount} ${currency}`);

  // Find the investment by paystack_reference
  const { data: investment, error: fetchError } = await supabaseClient
    .from("investments")
    .select("id, tokens_requested, investor_id, tokenization_id, amount_ngn")
    .eq("paystack_reference", transactionReference)
    .single();

  if (fetchError || !investment) {
    console.error("[INVESTMENT] Error fetching investment or investment not found:", fetchError?.message);
    return { success: false, error: "Investment not found or database error." };
  }

  // Update investment record with payment confirmation
  const { error: updateError } = await supabaseClient
    .from('investments')
    .update({
      payment_status: 'confirmed',
      payment_confirmed_at: new Date().toISOString(),
      tokens_allocated: investment.tokens_requested,
      amount_usd: amount / 100 / 1500, // Rough conversion, should use actual exchange rate
      exchange_rate: 1500,
      payment_method: 'paystack'
    })
    .eq('id', investment.id);

  if (updateError) {
    console.error('[INVESTMENT] Failed to update investment:', updateError);
    throw new Error('Failed to update investment record');
  }

  // Process investment completion using the edge function
  const { error: completionError } = await supabaseClient.functions.invoke(
    'process-investment-completion',
    { body: { investment_id: investment.id } }
  );

  if (completionError) {
    console.error('[INVESTMENT] Failed to process investment completion:', completionError);
  }

  console.log("[INVESTMENT] Investment payment processed successfully");
  return { success: true, type: 'investment' };
}

// Handle wallet funding
async function handleWalletFunding(event: any, supabaseClient: any) {
  console.log("[WALLET-FUNDING] Processing wallet funding");
  
  const amount = event.data.amount / 100; // Convert kobo to NGN
  const metadata = event.data.metadata;
  const userEmail = event.data.customer.email;
  const reference = event.data.reference;

  console.log(`[WALLET-FUNDING] Processing for email: ${userEmail}, amount: ${amount} NGN`);

  // Extract metadata
  const userId = metadata.user_id;
  const targetToken = metadata.target_token || 'HBAR';
  const walletId = metadata.wallet_id;

  if (!userId) {
    console.error("[WALLET-FUNDING] No user_id in metadata");
    return { success: false, error: "Missing user_id in metadata" };
  }

  // Get user's wallet
  const { data: wallet, error: walletError } = await supabaseClient
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .single();

  if (walletError || !wallet) {
    console.error('[WALLET-FUNDING] Failed to fetch wallet:', walletError);
    return { success: false, error: 'Wallet not found' };
  }

  // Calculate token amount based on exchange rate
  // Example: 1 HBAR = 250 NGN, 1 USDC = 1500 NGN
  const hbarRate = 250;
  const usdcRate = 1500;
  let tokenAmount = 0;

  if (targetToken === 'HBAR') {
    tokenAmount = amount / hbarRate;
  } else if (targetToken === 'USDC') {
    tokenAmount = amount / usdcRate;
  }

  console.log(`[WALLET-FUNDING] Calculated ${tokenAmount} ${targetToken} for ${amount} NGN`);

  // If target token is HBAR, transfer from operator account
  if (targetToken === 'HBAR' && HEDERA_OPERATOR_ID && HEDERA_OPERATOR_PRIVATE_KEY) {
    try {
      const operatorAccount = AccountId.fromString(HEDERA_OPERATOR_ID);
      const operatorKey = PrivateKey.fromString(HEDERA_OPERATOR_PRIVATE_KEY);
      const recipientAccount = AccountId.fromString(wallet.hedera_account_id);

      // Create and execute transfer
      const transferTx = new TransferTransaction()
        .addHbarTransfer(operatorAccount, Hbar.fromTinybars(-Math.floor(tokenAmount * 100_000_000)))
        .addHbarTransfer(recipientAccount, Hbar.fromTinybars(Math.floor(tokenAmount * 100_000_000)))
        .freezeWith({
          nodeAccountIds: [AccountId.fromString("0.0.3")],
        });

      const signedTx = await transferTx.sign(operatorKey);
      const txResponse = await signedTx.execute({
        nodeAccountIds: [AccountId.fromString("0.0.3")],
      });

      console.log(`[WALLET-FUNDING] HBAR transfer completed. Transaction ID: ${txResponse.transactionId}`);
    } catch (error) {
      console.error('[WALLET-FUNDING] HBAR transfer failed:', error);
      return { success: false, error: 'HBAR transfer failed' };
    }
  }

  // Update wallet balance
  const { error: balanceError } = await supabaseClient
    .from('wallets')
    .update({
      balance_ngn: (parseFloat(wallet.balance_ngn || '0') + amount).toString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', wallet.id);

  if (balanceError) {
    console.error('[WALLET-FUNDING] Failed to update wallet balance:', balanceError);
    return { success: false, error: 'Failed to update wallet balance' };
  }

  // Log the funding activity
  await supabaseClient.from('activity_logs').insert({
    user_id: userId,
    activity_type: 'wallet_funding',
    description: `Wallet funded with ${amount} NGN (${tokenAmount} ${targetToken})`,
    metadata: {
      amount_ngn: amount,
      token_amount: tokenAmount,
      target_token: targetToken,
      reference: reference,
      payment_method: 'paystack'
    }
  });

  console.log("[WALLET-FUNDING] Wallet funding processed successfully");
  return { success: true, type: 'wallet_funding' };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      console.warn("[WEBHOOK] No signature found in headers");
      return new Response(JSON.stringify({ error: "No signature found in headers." }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const rawBody = await req.text();

    // Verify the webhook signature
    const isValid = await verifySignature(rawBody, signature);
    if (!isValid) {
      console.warn("[WEBHOOK] Invalid signature");
      return new Response(JSON.stringify({ error: "Invalid signature." }), { 
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const event = JSON.parse(rawBody);
    console.log(`[WEBHOOK] Received event: ${event.event}`);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let result;

    // Route to appropriate handler based on event type
    switch (event.event) {
      case "charge.success":
        // Check if it's wallet funding or investment
        if (event.data.metadata?.transaction_type === 'wallet_funding') {
          result = await handleWalletFunding(event, supabaseClient);
        } else {
          // Try investment payment
          result = await handleInvestmentPayment(event, supabaseClient);
        }
        break;

      case "transfer.success":
        console.log("[WEBHOOK] Transfer successful:", event.data);
        result = { success: true, type: 'transfer', message: 'Transfer event logged' };
        break;

      case "refund.successful":
        console.log("[WEBHOOK] Refund successful:", event.data);
        result = { success: true, type: 'refund', message: 'Refund event logged' };
        break;

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.event}`);
        result = { success: true, message: 'Event type not processed but acknowledged' };
        break;
    }

    // Always return 200 OK to prevent Paystack retries
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Webhook processed successfully",
        ...result 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("[WEBHOOK] Error processing webhook:", error);
    
    // Still return 200 to prevent retries, but log the error
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Webhook received but processing failed",
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  }
});
