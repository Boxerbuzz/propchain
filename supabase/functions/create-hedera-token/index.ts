// deno-lint-ignore-file
// supabase/functions/create-hedera-token/index.ts
import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
} from "https://esm.sh/@hashgraph/sdk@2.73.2";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const {
      tokenName,
      tokenSymbol,
      totalSupply,
      decimals = 0,
    } = await req.json();

    if (!tokenName || !tokenSymbol || !totalSupply) {
      return new Response(
        JSON.stringify({
          error: "Missing tokenName, tokenSymbol, or totalSupply",
        }),
        { status: 400 }
      );
    }

    const client = Client.forTestnet();
    const operatorKey = PrivateKey.fromString(
      Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY")!
    );
    const operatorId = Deno.env.get("HEDERA_OPERATOR_ID")!;
    client.setOperator(operatorId, operatorKey);

    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName(tokenName)
      .setTokenSymbol(tokenSymbol)
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(decimals)
      .setInitialSupply(0) // Mint later based on investments
      .setTreasuryAccountId(operatorId)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(totalSupply)
      .setSupplyKey(operatorKey)
      .setKycKey(operatorKey) // Enable KYC requirements
      .setFreezeKey(operatorKey)
      .execute(client);

    const receipt = await tokenCreateTx.getReceipt(client);
    const tokenId = receipt.tokenId!.toString();

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          tokenId,
          transactionId: tokenCreateTx.transactionId?.toString(),
        },
        message: `Token created: ${tokenId}`,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating Hedera token:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  }
});
