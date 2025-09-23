import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { Client, PrivateKey, AccountId, TokenId, TransferTransaction } from "npm:@hashgraph/sdk@^2.73.1";

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
    const { senderAccountId, recipientAccountId, tokenId, amount, senderPrivateKey } = await req.json();

    if (!senderAccountId || !recipientAccountId || !tokenId || !amount || !senderPrivateKey) {
      return new Response(JSON.stringify({ error: "Missing senderAccountId, recipientAccountId, tokenId, amount, or senderPrivateKey" }), { status: 400 });
    }

    const transferTransaction = new TransferTransaction()
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(senderAccountId), -amount)
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(recipientAccountId), amount)
      .freezeWith(client);

    const transferTxSign = await transferTransaction.sign(PrivateKey.fromString(senderPrivateKey));
    const transferTxSubmit = await transferTxSign.execute(client);
    const transferRx = await transferTxSubmit.getReceipt(client);

    if (transferRx.status.toString() !== "SUCCESS") {
      throw new Error(`Token transfer failed with status: ${transferRx.status.toString()}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { transactionId: transferTxSubmit.transactionId.toString() },
        message: `Successfully transferred ${amount} of Token ID: ${tokenId}.`,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("Error transferring Hedera tokens:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message, message: "Failed to transfer Hedera tokens." }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
