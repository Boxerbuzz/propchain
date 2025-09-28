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
  console.log(`[CREATE-HEDERA-TOKEN] Request received: ${req.method}`);
  
  if (req.method !== "POST") {
    console.error(`[CREATE-HEDERA-TOKEN] Invalid method: ${req.method}`);
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
      metadata = null,
    } = await req.json();

    console.log(`[CREATE-HEDERA-TOKEN] Creating token with params:`, {
      tokenName,
      tokenSymbol,
      totalSupply,
      decimals,
      hasMetadata: !!metadata
    });

    if (!tokenName || !tokenSymbol || !totalSupply) {
      console.error(`[CREATE-HEDERA-TOKEN] ❌ Missing required fields:`, {
        hasTokenName: !!tokenName,
        hasTokenSymbol: !!tokenSymbol,
        hasTotalSupply: !!totalSupply
      });
      return new Response(
        JSON.stringify({
          error: "Missing tokenName, tokenSymbol, or totalSupply",
        }),
        { status: 400 }
      );
    }

    // Create size-optimized token memo (max 100 chars)
    const tokenMemo = `PropChain: ${tokenSymbol} Token`;
    console.log(`[CREATE-HEDERA-TOKEN] Token memo: "${tokenMemo}" (${tokenMemo.length} chars)`);

    // Create size-optimized metadata (max 100 chars)
    let tokenMetadata = null;
    if (metadata) {
      const { property_id, tokenization_id } = metadata;
      tokenMetadata = `PID:${property_id?.slice(-8)}|TID:${tokenization_id?.slice(-8)}`;
      console.log(`[CREATE-HEDERA-TOKEN] Token metadata: "${tokenMetadata}" (${tokenMetadata.length} chars)`);
    }

    console.log(`[CREATE-HEDERA-TOKEN] Initializing Hedera client for testnet`);
    const client = Client.forTestnet();
    const operatorKey = PrivateKey.fromString(
      Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY")!
    );
    const operatorId = Deno.env.get("HEDERA_OPERATOR_ID")!;
    client.setOperator(operatorId, operatorKey);

    console.log(`[CREATE-HEDERA-TOKEN] Creating token transaction...`);
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
      .setTokenMemo(tokenMemo);

    // Add metadata if provided
    if (tokenMetadata) {
      tokenCreateTx.setMetadata(new TextEncoder().encode(JSON.stringify(tokenMetadata)));
    }

    const executedTx = await tokenCreateTx.execute(client);
    console.log(`[CREATE-HEDERA-TOKEN] Token creation transaction executed, waiting for receipt...`);

    const receipt = await executedTx.getReceipt(client);
    const tokenId = receipt.tokenId!.toString();
    const transactionId = executedTx.transactionId?.toString();

    console.log(`[CREATE-HEDERA-TOKEN] ✅ Token created successfully:`, {
      tokenId,
      transactionId,
      memo: tokenMemo,
      metadata: tokenMetadata
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          tokenId,
          transactionId,
          memo: tokenMemo,
          metadata: tokenMetadata,
        },
        message: `Token created: ${tokenId}`,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(`[CREATE-HEDERA-TOKEN] ❌ Error creating Hedera token:`, error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  }
});
