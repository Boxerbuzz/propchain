import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { Client, PrivateKey, TokenId, TokenMintTransaction } from "npm:@hashgraph/sdk@^2.73.1";

// Load environment variables for Hedera operator
const OPERATOR_ID = Deno.env.get("HEDERA_OPERATOR_ID");
const OPERATOR_PRIVATE_KEY = Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY");

if (!OPERATOR_ID || !OPERATOR_PRIVATE_KEY) {
  throw new Error("Hedera operator ID and private key must be set in Supabase secrets.");
}

const client = Client.forTestnet(); // Or Client.forMainnet() or Client.forPreviewnet()
client.setOperator(OPERATOR_ID, PrivateKey.fromString(OPERATOR_PRIVATE_KEY));

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { tokenId, amount, supplyKey } = await req.json();

    if (!tokenId || !amount || !supplyKey) {
      return new Response(JSON.stringify({ error: "Missing tokenId, amount, or supplyKey" }), { status: 400 });
    }

    const mintTransaction = new TokenMintTransaction()
      .setTokenId(TokenId.fromString(tokenId))
      .setAmount(amount)
      .freezeWith(client);

    const mintTxSign = await mintTransaction.sign(PrivateKey.fromString(supplyKey));
    const mintTxSubmit = await mintTxSign.execute(client);
    const mintRx = await mintTxSubmit.getReceipt(client);

    if (mintRx.status.toString() !== "SUCCESS") {
      throw new Error(`Token minting failed with status: ${mintRx.status.toString()}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { transactionId: mintTxSubmit.transactionId.toString() },
        message: `Successfully minted ${amount} tokens for Token ID: ${tokenId}.`,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("Error minting Hedera tokens:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message, message: "Failed to mint Hedera tokens." }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
