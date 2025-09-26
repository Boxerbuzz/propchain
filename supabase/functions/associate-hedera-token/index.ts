// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import {
  Client,
  PrivateKey,
  AccountId,
  TokenId,
  TokenAssociateTransaction,
} from "https://esm.sh/@hashgraph/sdk@2.73.2";

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

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const { accountId, tokenId, privateKey } = await req.json();

    if (!accountId || !tokenId || !privateKey) {
      return new Response(
        JSON.stringify({ error: "Missing accountId, tokenId, or privateKey" }),
        { status: 400 }
      );
    }

    const associateTransaction = new TokenAssociateTransaction()
      .setAccountId(AccountId.fromString(accountId))
      .setTokenIds([TokenId.fromString(tokenId)])
      .freezeWith(client);

    const associateTxSign = await associateTransaction.sign(
      PrivateKey.fromString(privateKey)
    );
    const associateTxSubmit = await associateTxSign.execute(client);
    const associateRx = await associateTxSubmit.getReceipt(client);

    if (associateRx.status.toString() !== "SUCCESS") {
      throw new Error(
        `Token association failed with status: ${associateRx.status.toString()}`
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { transactionId: associateTxSubmit.transactionId.toString() },
        message: `Successfully associated Token ID: ${tokenId} with Account ID: ${accountId}.`,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error associating Hedera token:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: "Failed to associate Hedera token.",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
