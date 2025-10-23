import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  Hbar,
  TokenAssociateTransaction,
  AccountId,
} from "https://esm.sh/@hashgraph/sdk@2.73.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Patch Protobuf Long.js instance
console.log("Patching Protobuf Long.js instance...");
const Long = (globalThis as any).Long || ((globalThis as any).Long = {});
Long.isLong = (obj: any) => obj && obj.__isLong__;
Long.fromValue = (val: any) => {
  if (Long.isLong(val)) return val;
  if (typeof val === "number") return Long.fromNumber(val);
  if (typeof val === "string") return Long.fromString(val);
  return val;
};
Long.fromNumber = (num: number) => ({
  __isLong__: true,
  low: num & 0xffffffff,
  high: (num / 0x100000000) | 0,
  unsigned: false,
});
Long.fromString = (str: string) => Long.fromNumber(parseInt(str, 10));

serve(async (req) => {
  console.log(`[CREATE-TREASURY] Request received: ${req.method}`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, { db: { schema: 'public' } });

    const { tokenization_id } = await req.json();

    if (!tokenization_id) {
      throw new Error("tokenization_id is required");
    }

    console.log(`[CREATE-TREASURY] Creating treasury for tokenization: ${tokenization_id}`);

    // Fetch tokenization and property details
    const { data: tokenization, error: tokenError } = await supabase
      .from("tokenizations")
      .select(`
        *,
        properties!inner (
          id,
          title,
          owner_id
        )
      `)
      .eq("id", tokenization_id)
      .single();

    if (tokenError || !tokenization) {
      throw new Error("Tokenization not found");
    }

    // Check if treasury already exists
    if (tokenization.treasury_account_id) {
      console.log(`[CREATE-TREASURY] Treasury already exists: ${tokenization.treasury_account_id}`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Treasury account already exists",
          data: {
            treasury_account_id: tokenization.treasury_account_id,
            existing: true,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Setup Hedera client
    const operatorId = Deno.env.get("HEDERA_OPERATOR_ID");
    const operatorPrivateKey = Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY");
    const network = Deno.env.get("HEDERA_NETWORK") || "testnet";
    const usdcTokenId = Deno.env.get("HEDERA_USDC_TOKEN_ID");

    if (!operatorId || !operatorPrivateKey) {
      throw new Error("Hedera operator credentials not configured");
    }

    const client = network === "mainnet" ? Client.forMainnet() : Client.forTestnet();
    client.setOperator(
      AccountId.fromString(operatorId),
      PrivateKey.fromString(operatorPrivateKey)
    );

    console.log(`[CREATE-TREASURY] Using operator: ${operatorId}`);

    // Generate new ED25519 keypair for treasury account
    const treasuryPrivateKey = PrivateKey.generateED25519();
    const treasuryPublicKey = treasuryPrivateKey.publicKey;

    console.log(`[CREATE-TREASURY] Generated keypair for treasury account`);

    // Create Hedera account for property treasury
    const accountCreateTx = new AccountCreateTransaction()
      .setKey(treasuryPublicKey)
      .setInitialBalance(new Hbar(5)) // Initial 5 HBAR for transaction fees
      .setAccountMemo(`PropChain Treasury: ${tokenization.properties.title}`);

    const accountCreateSubmit = await accountCreateTx.execute(client);
    const accountCreateReceipt = await accountCreateSubmit.getReceipt(client);
    const treasuryAccountId = accountCreateReceipt.accountId;

    if (!treasuryAccountId) {
      throw new Error("Failed to create treasury account");
    }

    console.log(`[CREATE-TREASURY] Treasury account created: ${treasuryAccountId.toString()}`);

    // Associate USDC token with treasury account if USDC token ID is configured
    if (usdcTokenId) {
      console.log(`[CREATE-TREASURY] Associating USDC token: ${usdcTokenId}`);
      
      const associateTx = new TokenAssociateTransaction()
        .setAccountId(treasuryAccountId)
        .setTokenIds([usdcTokenId])
        .freezeWith(client);

      const associateSignedTx = await associateTx.sign(treasuryPrivateKey);
      const associateSubmit = await associateSignedTx.execute(client);
      await associateSubmit.getReceipt(client);

      console.log(`[CREATE-TREASURY] USDC token associated successfully`);
    }

    // Store private key in Supabase Vault using database function wrapper
    const { data: vaultSecret, error: vaultError } = await supabase
      .rpc('create_vault_secret', {
        p_secret: treasuryPrivateKey.toString(),
        p_name: `treasury_${treasuryAccountId.toString()}`,
        p_description: `Treasury private key for property: ${tokenization.properties.title}`
      });

    console.log('[CREATE-TREASURY] Vault secret ID:', vaultSecret);

    if (vaultError) {
      console.error("[CREATE-TREASURY] Vault error:", vaultError);
      throw new Error(`Failed to store private key in Vault: ${vaultError.message}`);
    }

    console.log(`[CREATE-TREASURY] Private key stored in Vault`);

    // Update tokenization with treasury details
    const { error: updateError } = await supabase
      .from("tokenizations")
      .update({
        treasury_account_id: treasuryAccountId.toString(),
        treasury_account_private_key_vault_id: vaultSecret,
        treasury_balance_hbar: 5,
        treasury_balance_usdc: 0,
        treasury_balance_ngn: 0,
        treasury_created_at: new Date().toISOString(),
      })
      .eq("id", tokenization_id);

    if (updateError) {
      throw new Error(`Failed to update tokenization: ${updateError.message}`);
    }

    // Create activity log
    await supabase.from("activity_logs").insert({
      user_id: tokenization.properties.owner_id,
      property_id: tokenization.properties.id,
      tokenization_id: tokenization_id,
      activity_type: "treasury_created",
      activity_category: "treasury",
      description: `Property treasury account created: ${treasuryAccountId.toString()}`,
      metadata: {
        treasury_account_id: treasuryAccountId.toString(),
        initial_balance_hbar: 5,
        usdc_associated: !!usdcTokenId,
      },
    });

    // Create notification for property owner
    await supabase.from("notifications").insert({
      user_id: tokenization.properties.owner_id,
      notification_type: "treasury_created",
      title: "Property Treasury Created",
      message: `A dedicated treasury account has been created for "${tokenization.properties.title}". Account ID: ${treasuryAccountId.toString()}`,
      action_url: `/property/${tokenization.properties.id}/view`,
    });

    console.log(`[CREATE-TREASURY] Treasury creation complete`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Property treasury account created successfully",
        data: {
          treasury_account_id: treasuryAccountId.toString(),
          initial_balance_hbar: 5,
          usdc_associated: !!usdcTokenId,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[CREATE-TREASURY] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create property treasury",
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
