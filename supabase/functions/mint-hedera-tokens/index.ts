import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import {
  Client,
  PrivateKey,
  TokenId,
  TokenMintTransaction,
} from "https://esm.sh/@hashgraph/sdk@2.73.2";

//https://esm.sh/@hashgraph/sdk@2.73.2

// Load environment variables for Hedera operator
const OPERATOR_ID = Deno.env.get("HEDERA_OPERATOR_ID");
const HEDERA_OPERATOR_PRIVATE_KEY = Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY");

if (!OPERATOR_ID || !HEDERA_OPERATOR_PRIVATE_KEY) {
  throw new Error(
    "Hedera operator ID and private key must be set in Supabase secrets."
  );
}

const client = Client.forTestnet(); // Or Client.forMainnet() or Client.forPreviewnet()
client.setOperator(OPERATOR_ID, PrivateKey.fromString(HEDERA_OPERATOR_PRIVATE_KEY));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`[MINT-HEDERA-TOKENS] Request received: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    console.log(`[MINT-HEDERA-TOKENS] CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.error(`[MINT-HEDERA-TOKENS] Invalid method: ${req.method}`);
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { tokenId, amount } = await req.json();

    if (!tokenId || !amount) {
      console.error(`[MINT-HEDERA-TOKENS] Missing required parameters`);
      return new Response(
        JSON.stringify({ error: "Missing tokenId or amount" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`[MINT-HEDERA-TOKENS] Minting ${amount} tokens for Token ID: ${tokenId}`);

    // Use operator private key as supply key (set during token creation)
    const supplyKey = PrivateKey.fromString(HEDERA_OPERATOR_PRIVATE_KEY);

    const mintTransaction = new TokenMintTransaction()
      .setTokenId(TokenId.fromString(tokenId))
      .setAmount(amount)
      .freezeWith(client);

    console.log(`[MINT-HEDERA-TOKENS] Signing mint transaction with supply key`);
    const mintTxSign = await mintTransaction.sign(supplyKey);
    
    console.log(`[MINT-HEDERA-TOKENS] Executing mint transaction`);
    const mintTxSubmit = await mintTxSign.execute(client);
    const mintRx = await mintTxSubmit.getReceipt(client);

    if (mintRx.status.toString() !== "SUCCESS") {
      console.error(`[MINT-HEDERA-TOKENS] ❌ Token minting failed with status: ${mintRx.status.toString()}`);
      throw new Error(
        `Token minting failed with status: ${mintRx.status.toString()}`
      );
    }

    console.log(`[MINT-HEDERA-TOKENS] ✅ Successfully minted ${amount} tokens for Token ID: ${tokenId}`);
    console.log(`[MINT-HEDERA-TOKENS] Transaction ID: ${mintTxSubmit.transactionId.toString()}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: { transactionId: mintTxSubmit.transactionId.toString() },
        message: `Successfully minted ${amount} tokens for Token ID: ${tokenId}.`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[MINT-HEDERA-TOKENS] ❌ Error minting Hedera tokens:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: "Failed to mint Hedera tokens.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
