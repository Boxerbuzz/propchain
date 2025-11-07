import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  Client,
  PrivateKey,
  AccountId,
  TokenId,
  TokenAssociateTransaction,
  TokenGrantKycTransaction,
  TransferTransaction,
  AccountBalanceQuery,
  Status,
} from "https://esm.sh/@hashgraph/sdk@2.73.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tokenization_id, target_user_ids } = await req.json();

    if (!tokenization_id) {
      return new Response(
        JSON.stringify({ error: "Tokenization ID required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Initialize Hedera client with operator credentials
    const operatorId = Deno.env.get("HEDERA_OPERATOR_ID");
    const operatorKey = Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY");

    if (!operatorId || !operatorKey) {
      throw new Error(
        "Missing HEDERA_OPERATOR_ID or HEDERA_OPERATOR_PRIVATE_KEY"
      );
    }

    const client = Client.forTestnet();
    client.setOperator(
      AccountId.fromString(operatorId),
      PrivateKey.fromStringECDSA(operatorKey)
    );
    const opPrivKey = PrivateKey.fromStringECDSA(operatorKey);
    const operatorAccountId = AccountId.fromString(operatorId);
    console.log(
      `[DISTRIBUTE-TOKENS] Starting token distribution for tokenization: ${tokenization_id}`
    );

    // Try to acquire distribution lock
    const lockId = `dist-${tokenization_id}-${Date.now()}`;
    const { error: lockError } = await supabase
      .from("token_distribution_locks")
      .insert({
        tokenization_id,
        locked_by: lockId,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
      });

    if (lockError) {
      // Check if lock exists and is not expired
      const { data: existingLock } = await supabase
        .from("token_distribution_locks")
        .select("*")
        .eq("tokenization_id", tokenization_id)
        .single();

      if (existingLock && new Date(existingLock.expires_at) > new Date()) {
        console.log("[DISTRIBUTE-TOKENS] Distribution already in progress");
        return new Response(
          JSON.stringify({
            error: "Distribution already in progress",
            locked_by: existingLock.locked_by,
          }),
          {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Lock expired, delete and retry
      await supabase
        .from("token_distribution_locks")
        .delete()
        .eq("tokenization_id", tokenization_id);
      await supabase.from("token_distribution_locks").insert({
        tokenization_id,
        locked_by: lockId,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });
    }

    try {
      // Get tokenization details
      const { data: tokenization, error: tokenError } = await supabase
        .from("tokenizations")
        .select(
          `
          *,
          properties!inner (
            id,
            title,
            owner_id
          )
        `
        )
        .eq("id", tokenization_id)
        .single();

      if (tokenError || !tokenization) {
        console.error(
          "[DISTRIBUTE-TOKENS] Tokenization not found:",
          tokenError
        );
        throw new Error("Tokenization not found");
      }

      if (!tokenization.token_id || tokenization.token_id === "pending") {
        throw new Error("Token not yet minted");
      }

      const tokenIdObj = TokenId.fromString(tokenization.token_id);

      // Pre-flight: Check treasury balance
      console.log("[DISTRIBUTE-TOKENS] Checking treasury token balance...");
      const treasuryBalance = await new AccountBalanceQuery()
        .setAccountId(operatorAccountId)
        .execute(client);

      const treasuryTokenBalance = treasuryBalance.tokens.get(tokenIdObj);
      const availableSupply = treasuryTokenBalance
        ? BigInt(treasuryTokenBalance.toString())
        : 0n;
      console.log(
        `[DISTRIBUTE-TOKENS] Treasury has ${availableSupply} tokens available`
      );

      // Get all confirmed investments grouped by user
      let investmentsQuery = supabase
        .from("investments")
        .select(
          `
          id,
          investor_id,
          tokens_requested,
          amount_ngn,
          investor:users!inner (
            id,
            hedera_account_id,
            kyc_status,
            kyc_verifications!kyc_verifications_user_id_fkey (
              status,
              kyc_level
            )
          )
        `
        )
        .eq("tokenization_id", tokenization_id)
        .eq("payment_status", "confirmed");

      // Filter by target users if specified (for remediation)
      if (
        target_user_ids &&
        Array.isArray(target_user_ids) &&
        target_user_ids.length > 0
      ) {
        investmentsQuery = investmentsQuery.in("investor_id", target_user_ids);
        console.log(
          `[DISTRIBUTE-TOKENS] Targeting specific users: ${target_user_ids.join(
            ", "
          )}`
        );
      }

      const { data: investments, error: investmentError } =
        await investmentsQuery;

      if (investmentError) {
        console.error(
          "[DISTRIBUTE-TOKENS] Error fetching investments:",
          investmentError
        );
        throw new Error(investmentError.message);
      }

      if (!investments || investments.length === 0) {
        console.log("[DISTRIBUTE-TOKENS] No confirmed investments found");
        return new Response(
          JSON.stringify({
            success: true,
            message: "No confirmed investments found for distribution",
            distributed: 0,
            skipped: 0,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Aggregate investments by user
      const userAggregates = new Map<
        string,
        {
          user_id: string;
          hedera_account_id: string | null;
          kyc_status: string;
          kyc_verified: boolean;
          total_tokens_requested: bigint;
          investment_ids: string[];
          investments: any[];
        }
      >();

      for (const inv of investments) {
        const userId = inv.investor_id;
        const user = inv.investor;

        if (!userAggregates.has(userId)) {
          const kyc = user?.kyc_verifications?.[0];
          const isKycVerified =
            user.kyc_status === "verified" || kyc?.status === "verified";

          userAggregates.set(userId, {
            user_id: userId,
            hedera_account_id: user.hedera_account_id,
            kyc_status: user.kyc_status,
            kyc_verified: isKycVerified,
            total_tokens_requested: 0n,
            investment_ids: [],
            investments: [],
          });
        }

        const agg = userAggregates.get(userId)!;
        agg.total_tokens_requested += BigInt(inv.tokens_requested);
        agg.investment_ids.push(inv.id);
        agg.investments.push(inv);
      }

      console.log(
        `[DISTRIBUTE-TOKENS] Processing ${userAggregates.size} unique users`
      );

      const results = {
        distributed: 0,
        skipped: 0,
        failed: 0,
        details: [] as any[],
      };

      // Calculate total tokens needed
      let totalTokensNeeded = 0n;
      for (const agg of userAggregates.values()) {
        if (agg.kyc_verified && agg.hedera_account_id) {
          // Query on-chain balance to determine delta
          try {
            const userAccountId = AccountId.fromString(agg.hedera_account_id);
            const balance = await new AccountBalanceQuery()
              .setAccountId(userAccountId)
              .execute(client);

            const currentBalance = balance.tokens.get(tokenIdObj);
            const onChainBalance = currentBalance
              ? BigInt(currentBalance.toString())
              : 0n;
            const delta =
              agg.total_tokens_requested > onChainBalance
                ? agg.total_tokens_requested - onChainBalance
                : 0n;
            totalTokensNeeded += delta;
          } catch (e) {
            console.warn(
              `[DISTRIBUTE-TOKENS] Could not query balance for ${agg.hedera_account_id}, assuming full transfer needed`
            );
            totalTokensNeeded += agg.total_tokens_requested;
          }
        }
      }

      console.log(
        `[DISTRIBUTE-TOKENS] Total tokens needed: ${totalTokensNeeded}`
      );

      if (totalTokensNeeded > availableSupply) {
        const shortfall = totalTokensNeeded - availableSupply;
        console.error(
          `[DISTRIBUTE-TOKENS] INSUFFICIENT TREASURY SUPPLY: Need ${totalTokensNeeded}, have ${availableSupply}, shortfall: ${shortfall}`
        );
        throw new Error(
          `Insufficient token supply in treasury. Need ${totalTokensNeeded} tokens but only ${availableSupply} available. Shortfall: ${shortfall}`
        );
      }

      // Process each user
      for (const [userId, agg] of userAggregates.entries()) {
        console.log(
          `[DISTRIBUTE-TOKENS] Processing user: ${userId} with ${agg.investment_ids.length} investments`
        );

        // Check KYC
        if (!agg.kyc_verified) {
          console.log(
            `[DISTRIBUTE-TOKENS] Skipping user ${userId} - KYC not verified`
          );

          await supabase.from("notifications").insert({
            user_id: userId,
            title: "Complete KYC to Receive Tokens",
            message: `Your investment in "${tokenization.properties.title}" is confirmed, but you need to complete KYC verification to receive your ${agg.total_tokens_requested} tokens.`,
            notification_type: "kyc_required_for_tokens",
            action_url: "/kyc/start",
            action_data: {
              tokenization_id: tokenization_id,
              tokens_pending: Number(agg.total_tokens_requested),
            },
          });

          // Log skip event for each investment
          for (const invId of agg.investment_ids) {
            await supabase.from("token_distribution_events").insert({
              tokenization_id,
              user_id: userId,
              investment_id: invId,
              tokens_requested: Number(agg.total_tokens_requested),
              tokens_transferred: 0,
              status: "skipped",
              skip_reason: "KYC not verified",
              hedera_account_id: agg.hedera_account_id,
              completed_at: new Date().toISOString(),
            });
          }

          results.skipped++;
          results.details.push({
            user_id: userId,
            investment_ids: agg.investment_ids,
            status: "skipped",
            reason: "KYC not verified",
          });
          continue;
        }

        // Check Hedera account
        if (!agg.hedera_account_id) {
          console.log(
            `[DISTRIBUTE-TOKENS] Skipping user ${userId} - No Hedera account`
          );

          await supabase.from("notifications").insert({
            user_id: userId,
            title: "Create Wallet to Receive Tokens",
            message: `Your investment in "${tokenization.properties.title}" is ready for token distribution, but you need to create a Hedera wallet first.`,
            notification_type: "wallet_required_for_tokens",
            action_url: "/wallet/setup",
            action_data: {
              tokenization_id: tokenization_id,
              tokens_pending: Number(agg.total_tokens_requested),
            },
          });

          for (const invId of agg.investment_ids) {
            await supabase.from("token_distribution_events").insert({
              tokenization_id,
              user_id: userId,
              investment_id: invId,
              tokens_requested: Number(agg.total_tokens_requested),
              tokens_transferred: 0,
              status: "skipped",
              skip_reason: "No Hedera account",
              completed_at: new Date().toISOString(),
            });
          }

          results.skipped++;
          results.details.push({
            user_id: userId,
            investment_ids: agg.investment_ids,
            status: "skipped",
            reason: "No Hedera account",
          });
          continue;
        }

        // Get wallet details
        console.log(`[DISTRIBUTE-TOKENS] Loading wallet for user ${userId}`);
        const { data: wallet, error: walletError } = await supabase
          .from("wallets")
          .select("id, hedera_account_id, wallet_type, vault_secret_id")
          .eq("user_id", userId)
          .eq("wallet_type", "hedera")
          .single();

        if (walletError || !wallet || !wallet.vault_secret_id) {
          console.log(
            `[DISTRIBUTE-TOKENS] Skipping user ${userId} - No custodial wallet`
          );

          await supabase.from("notifications").insert({
            user_id: userId,
            title: "External Wallet Token Association Required",
            message: `Your investment in "${tokenization.properties.title}" is ready, but you're using an external wallet. Please associate token ${tokenization.token_id} in your wallet to receive ${agg.total_tokens_requested} tokens.`,
            notification_type: "external_wallet_association_required",
            action_data: {
              tokenization_id: tokenization_id,
              token_id: tokenization.token_id,
              tokens_pending: Number(agg.total_tokens_requested),
            },
          });

          for (const invId of agg.investment_ids) {
            await supabase.from("token_distribution_events").insert({
              tokenization_id,
              user_id: userId,
              investment_id: invId,
              tokens_requested: Number(agg.total_tokens_requested),
              tokens_transferred: 0,
              status: "skipped",
              skip_reason: "External wallet - manual association required",
              hedera_account_id: agg.hedera_account_id,
              completed_at: new Date().toISOString(),
            });
          }

          results.skipped++;
          results.details.push({
            user_id: userId,
            investment_ids: agg.investment_ids,
            status: "skipped",
            reason: "External wallet",
          });
          continue;
        }

        // Get private key from Vault
        const { data: userPrivateKey, error: vaultError } = await supabase.rpc(
          "get_wallet_private_key",
          { p_wallet_id: wallet.id }
        );

        if (vaultError || !userPrivateKey) {
          console.error(
            `[DISTRIBUTE-TOKENS] Failed to retrieve private key for user ${userId}:`,
            vaultError
          );

          for (const invId of agg.investment_ids) {
            await supabase.from("token_distribution_events").insert({
              tokenization_id,
              user_id: userId,
              investment_id: invId,
              tokens_requested: Number(agg.total_tokens_requested),
              tokens_transferred: 0,
              status: "failed",
              error_message: "Failed to retrieve wallet private key from Vault",
              hedera_account_id: agg.hedera_account_id,
              completed_at: new Date().toISOString(),
            });
          }

          results.failed++;
          results.details.push({
            user_id: userId,
            investment_ids: agg.investment_ids,
            status: "failed",
            reason: "Failed to retrieve wallet private key",
          });
          continue;
        }

        let associationTxId: string | undefined;
        let grantKycTxId: string | undefined;
        let transferTxId: string | undefined;

        try {
          const userPrivKey = PrivateKey.fromStringDer(userPrivateKey);
          const userAccountId = AccountId.fromString(wallet.hedera_account_id);

          // Query on-chain balance
          console.log(
            `[DISTRIBUTE-TOKENS] Checking on-chain balance for ${wallet.hedera_account_id}`
          );
          let currentBalance = 0n;
          try {
            const balance = await new AccountBalanceQuery()
              .setAccountId(userAccountId)
              .execute(client);

            const tokenBalance = balance.tokens.get(tokenIdObj);
            if (tokenBalance) {
              currentBalance = BigInt(tokenBalance.toString());
              console.log(
                `[DISTRIBUTE-TOKENS] Current on-chain balance: ${currentBalance} tokens`
              );
            }
          } catch (balanceError: any) {
            console.warn(
              "[DISTRIBUTE-TOKENS] Balance query failed:",
              balanceError.message
            );
          }

          // Calculate tokens to transfer (idempotent: only send the delta)
          const tokensToTransfer =
            agg.total_tokens_requested > currentBalance
              ? agg.total_tokens_requested - currentBalance
              : 0n;

          if (tokensToTransfer === 0n) {
            console.log(
              `[DISTRIBUTE-TOKENS] User ${userId} already has ${currentBalance} tokens (expected ${agg.total_tokens_requested}). No transfer needed.`
            );
            transferTxId = "no-transfer-needed";
          } else {
            console.log(
              `[DISTRIBUTE-TOKENS] Will transfer ${tokensToTransfer} tokens to reach target of ${agg.total_tokens_requested}`
            );

            // Associate token if not already
            const isAssociated =
              currentBalance > 0n ||
              (await (async () => {
                try {
                  const bal = await new AccountBalanceQuery()
                    .setAccountId(userAccountId)
                    .execute(client);
                  return bal.tokens.get(tokenIdObj) !== null;
                } catch {
                  return false;
                }
              })());

            if (!isAssociated) {
              console.log(
                `[DISTRIBUTE-TOKENS] Associating token with account ${wallet.hedera_account_id}`
              );
              try {
                const associateTx = new TokenAssociateTransaction()
                  .setAccountId(userAccountId)
                  .setTokenIds([tokenIdObj])
                  .freezeWith(client);

                const associateSignedTx = await associateTx.sign(userPrivKey);
                const associateSubmit = await associateSignedTx.execute(client);
                await associateSubmit.getReceipt(client);
                associationTxId = associateSubmit.transactionId.toString();
                console.log(
                  `[DISTRIBUTE-TOKENS] Token associated: ${associationTxId}`
                );
              } catch (associateError: any) {
                if (associateError.status?._code === 194) {
                  console.log(`[DISTRIBUTE-TOKENS] Token already associated`);
                  associationTxId = "already-associated";
                } else {
                  throw associateError;
                }
              }
            } else {
              associationTxId = "pre-associated";
            }

            // Grant KYC
            console.log(
              `[DISTRIBUTE-TOKENS] Granting KYC for account ${wallet.hedera_account_id}`
            );
            try {
              const grantKycTx = new TokenGrantKycTransaction()
                .setAccountId(userAccountId)
                .setTokenId(tokenIdObj)
                .freezeWith(client);

              const grantKycSignedTx = await grantKycTx.sign(opPrivKey);
              const grantKycSubmit = await grantKycSignedTx.execute(client);
              await grantKycSubmit.getReceipt(client);
              grantKycTxId = grantKycSubmit.transactionId.toString();
              console.log(`[DISTRIBUTE-TOKENS] KYC granted: ${grantKycTxId}`);
            } catch (kycError: any) {
              if (
                kycError.status?._code === 222 ||
                kycError.message?.includes("ACCOUNT_KYC_ALREADY_GRANTED")
              ) {
                console.log(`[DISTRIBUTE-TOKENS] KYC already granted`);
                grantKycTxId = "already-granted";
              } else {
                throw kycError;
              }
            }

            // Transfer tokens
            console.log(
              `[DISTRIBUTE-TOKENS] Transferring ${tokensToTransfer} tokens to ${wallet.hedera_account_id}`
            );
            const transferTx = new TransferTransaction()
              .addTokenTransfer(
                tokenIdObj,
                operatorAccountId,
                -Number(tokensToTransfer)
              )
              .addTokenTransfer(
                tokenIdObj,
                userAccountId,
                Number(tokensToTransfer)
              )
              .setTransactionMemo(
                `Distribution: ${tokenization.properties.title}`
              )
              .freezeWith(client);

            const transferSignedTx = await transferTx.sign(opPrivKey);
            const transferSubmit = await transferSignedTx.execute(client);
            const transferReceipt = await transferSubmit.getReceipt(client);

            if (transferReceipt.status !== Status.Success) {
              throw new Error(
                `Token transfer failed with status: ${transferReceipt.status}`
              );
            }

            transferTxId = transferSubmit.transactionId.toString();
            console.log(
              `[DISTRIBUTE-TOKENS] Transfer successful: ${transferTxId}`
            );
          }

          // SUCCESS: Mark all user's confirmed investments as tokens_distributed
          console.log(
            `[DISTRIBUTE-TOKENS] Marking ${agg.investment_ids.length} investments as tokens_distributed`
          );

          const { error: updateError } = await supabase
            .from("investments")
            .update({
              payment_status: "tokens_distributed",
              tokens_allocated: Number(agg.total_tokens_requested),
              updated_at: new Date().toISOString(),
            })
            .in("id", agg.investment_ids)
            .eq("payment_status", "confirmed");

          if (updateError) {
            console.error(
              "[DISTRIBUTE-TOKENS] Failed to update investments:",
              updateError
            );
          }

          // Update token holdings
          await supabase.from("token_holdings").upsert(
            {
              user_id: userId,
              tokenization_id,
              property_id: tokenization.property_id,
              balance: Number(agg.total_tokens_requested),
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,tokenization_id",
            }
          );

          // Log activity
          await supabase.from("activity_logs").insert({
            user_id: userId,
            activity_type: "token_distribution",
            activity_category: "investment",
            description: `Received ${agg.total_tokens_requested} tokens for ${tokenization.properties.title}`,
            tokenization_id,
            property_id: tokenization.property_id,
            metadata: {
              tokens_distributed: Number(agg.total_tokens_requested),
              transfer_tx: transferTxId,
              investment_ids: agg.investment_ids,
            },
          });

          // Send notification
          await supabase.from("notifications").insert({
            user_id: userId,
            title: "Tokens Successfully Distributed",
            message: `You have received ${agg.total_tokens_requested} tokens for your investment in "${tokenization.properties.title}".`,
            notification_type: "tokens_distributed",
            action_url: `/portfolio/${tokenization.property_id}`,
            action_data: {
              tokens_received: Number(agg.total_tokens_requested),
              transfer_tx: transferTxId,
            },
          });

          // Log distribution events
          for (const inv of agg.investments) {
            await supabase.from("token_distribution_events").insert({
              tokenization_id,
              user_id: userId,
              investment_id: inv.id,
              tokens_requested: inv.tokens_requested,
              tokens_transferred: inv.tokens_requested,
              status: "success",
              hedera_account_id: wallet.hedera_account_id,
              association_tx_id: associationTxId,
              kyc_grant_tx_id: grantKycTxId,
              transfer_tx_id: transferTxId,
              completed_at: new Date().toISOString(),
            });
          }

          results.distributed++;
          results.details.push({
            user_id: userId,
            investment_ids: agg.investment_ids,
            tokens_distributed: Number(agg.total_tokens_requested),
            status: "success",
            transfer_tx: transferTxId,
          });
        } catch (hederaError: any) {
          console.error(
            `[DISTRIBUTE-TOKENS] Hedera operation failed for user ${userId}:`,
            hederaError
          );

          let errorMessage = hederaError.message || "Unknown Hedera error";

          if (errorMessage.includes("INSUFFICIENT_ACCOUNT_BALANCE")) {
            errorMessage = "Insufficient HBAR balance for transaction fees";
          } else if (errorMessage.includes("INSUFFICIENT_TOKEN_BALANCE")) {
            errorMessage = "Insufficient token balance in treasury";
          } else if (errorMessage.includes("INVALID_SIGNATURE")) {
            errorMessage = "Invalid signature - wallet key mismatch";
          } else if (errorMessage.includes("TOKEN_NOT_ASSOCIATED")) {
            errorMessage = "Token not associated with account";
          }

          // Log failure events
          for (const invId of agg.investment_ids) {
            await supabase.from("token_distribution_events").insert({
              tokenization_id,
              user_id: userId,
              investment_id: invId,
              tokens_requested: Number(agg.total_tokens_requested),
              tokens_transferred: 0,
              status: "failed",
              error_message: errorMessage,
              hedera_account_id: agg.hedera_account_id,
              association_tx_id: associationTxId,
              kyc_grant_tx_id: grantKycTxId,
              transfer_tx_id: transferTxId,
              completed_at: new Date().toISOString(),
            });
          }

          results.failed++;
          results.details.push({
            user_id: userId,
            investment_ids: agg.investment_ids,
            status: "failed",
            reason: errorMessage,
            association_tx: associationTxId,
            grant_kyc_tx: grantKycTxId,
            transfer_tx: transferTxId,
          });
          continue;
        }
      }

      // Release the lock
      await supabase
        .from("token_distribution_locks")
        .delete()
        .eq("tokenization_id", tokenization_id);

      console.log(
        `[DISTRIBUTE-TOKENS] Distribution complete. Distributed: ${results.distributed}, Skipped: ${results.skipped}, Failed: ${results.failed}`
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: `Token distribution complete`,
          distributed: results.distributed,
          skipped: results.skipped,
          failed: results.failed,
          details: results.details,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (innerError: any) {
      // Release the lock on error
      await supabase
        .from("token_distribution_locks")
        .delete()
        .eq("tokenization_id", tokenization_id);

      throw innerError;
    }
  } catch (error: any) {
    console.error("[DISTRIBUTE-TOKENS] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
