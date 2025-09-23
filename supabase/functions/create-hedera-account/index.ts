// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import {
  Client,
  PrivateKey,
  Hbar,
  AccountCreateTransaction,
} from "https://esm.sh/@hashgraph/sdk@2.73.2";

// Load environment variables for Hedera operator
const OPERATOR_ID = Deno.env.get("HEDERA_OPERATOR_ID");
const OPERATOR_PRIVATE_KEY = Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY");

if (!OPERATOR_ID || !OPERATOR_PRIVATE_KEY) {
  throw new Error(
    "Hedera operator ID and private key must be set in Supabase secrets."
  );
}

const client = Client.forTestnet(); // Or Client.forMainnet() or Client.forPreviewnet()
client.setOperator(OPERATOR_ID, PrivateKey.fromStringED25519(OPERATOR_PRIVATE_KEY));

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    // Generate new keypair for the new account
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    // Create the new Hedera account with an initial balance (e.g., 1 Hbar)
    const createAccountTransaction = new AccountCreateTransaction()
      .setKeyWithoutAlias(newAccountPublicKey)
      .setInitialBalance(Hbar.fromTinybars(0))
      .freezeWith(client); // Freeze the transaction for signing

    const signedTransaction = await createAccountTransaction.sign(
      PrivateKey.fromStringED25519(OPERATOR_PRIVATE_KEY)
    );
    const txResponse = await signedTransaction.execute(client);
    const receipt = await txResponse.getReceipt(client);

    if (receipt.status.toString() !== "SUCCESS") {
      throw new Error(
        `Account creation failed with status: ${receipt.status.toString()}`
      );
    }

    const newAccountId = receipt.accountId!.toString();

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          accountId: newAccountId,
          privateKey: newAccountPrivateKey.toString(),
        },
        message: "Hedera account created and funded successfully.",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating Hedera account:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: "Failed to create Hedera account.",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
