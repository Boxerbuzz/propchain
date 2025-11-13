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
} from "https://esm.sh/@hashgraph/sdk@2.73.2";

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
      PrivateKey.fromString(operatorKey)
    );
    const opPrivKey = PrivateKey.fromString(operatorKey);
    const operatorAccountId = AccountId.fromString(operatorId);
    console.log(
      `[DISTRIBUTE-TOKENS] Starting token distribution for tokenization: ${tokenization_id}`
    );

    // FIX 2.1: Use PostgreSQL advisory lock (database-level, more reliable)
    // Advisory lock using tokenization_id hash as lock ID
    const lockKey = Math.abs(
      tokenization_id
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    );
    console.log(`[DISTRIBUTE-TOKENS] Attempting to acquire advisory lock with key: ${lockKey}`);

    // Try to acquire lock with timeout (30 seconds max wait with exponential backoff)
    let lockAcquired = false;
    let retryCount = 0;
    const maxRetries = 5;
    
    while (!lockAcquired && retryCount < maxRetries) {
      const { data: lockResult, error: lockError } = await supabase.rpc(
        "pg_try_advisory_lock",
        { lock_id: lockKey }
      );

      if (lockError) {
        console.error("[DISTRIBUTE-TOKENS] Lock acquisition error:", lockError);
        throw new Error(`Failed to acquire lock: ${lockError.message}`);
      }

      lockAcquired = lockResult;

      if (!lockAcquired) {
        const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
        console.log(
          `[DISTRIBUTE-TOKENS] Lock not available, waiting ${waitTime}ms (attempt ${retryCount + 1}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        retryCount++;
      }
    }

    if (!lockAcquired) {
      console.log(
        "[DISTRIBUTE-TOKENS] Could not acquire lock after retries - distribution already in progress"
      );
      return new Response(
        JSON.stringify({
          error: "Distribution already in progress, please try again later",
          retries: retryCount,
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[DISTRIBUTE-TOKENS] Advisory lock acquired successfully");

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

      // FIX 1.3: Get already successfully distributed investment IDs to avoid re-processing
      console.log("[DISTRIBUTE-TOKENS] Checking for already distributed investments...");
      const { data: successfulDistributions } = await supabase
        .from("token_distribution_events")
        .select("investment_id")
        .eq("tokenization_id", tokenization_id)
        .eq("status", "success");

      const alreadyDistributedIds = new Set(
        (successfulDistributions || []).map((d) => d.investment_id)
      );

      if (alreadyDistributedIds.size > 0) {
        console.log(
          `[DISTRIBUTE-TOKENS] Found ${alreadyDistributedIds.size} investments already distributed (idempotency check)`
        );
      }

      // FIX 2.1: Get all confirmed investments using SELECT FOR UPDATE SKIP LOCKED
      // This prevents race conditions by locking rows and skipping already locked ones
      console.log("[DISTRIBUTE-TOKENS] Selecting investments with row-level locks");
      
      // First, get the investment IDs with locking to prevent concurrent processing
      const { data: lockedInvestmentIds, error: lockQueryError } = await supabase
        .rpc("get_investments_for_distribution", {
          p_tokenization_id: tokenization_id,
          p_target_user_ids: target_user_ids || null
        });

      if (lockQueryError) {
        console.error("[DISTRIBUTE-TOKENS] Failed to lock investments:", lockQueryError);
        throw new Error(`Failed to lock investments: ${lockQueryError.message}`);
      }

      if (!lockedInvestmentIds || lockedInvestmentIds.length === 0) {
        console.log("[DISTRIBUTE-TOKENS] No unlocked investments available");
        return new Response(
          JSON.stringify({
            success: true,
            message: "No investments available (may be locked by another process)",
            distributed: 0,
            skipped: 0,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Now fetch full investment details for the locked IDs
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
        .in("id", lockedInvestmentIds)
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

      // Filter out already distributed investments (idempotency)
      const investmentsToProcess = (investments || []).filter(
        (inv) => !alreadyDistributedIds.has(inv.id)
      );

      if (investmentsToProcess.length === 0) {
        const skippedCount = (investments || []).length;
        console.log(
          `[DISTRIBUTE-TOKENS] No investments to process (${skippedCount} already distributed)`
        );
        return new Response(
          JSON.stringify({
            success: true,
            message: "No new investments to distribute (all already processed)",
            distributed: 0,
            skipped: skippedCount,
            already_distributed: skippedCount,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log(
        `[DISTRIBUTE-TOKENS] Processing ${investmentsToProcess.length} investments (${alreadyDistributedIds.size} already distributed)`
      );

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

      for (const inv of investmentsToProcess) {
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

        // PHASE 3: Log distribution events with "processing" status BEFORE transfer
        const distributionEventIds: string[] = [];
        console.log(`[DISTRIBUTE-TOKENS] Creating processing event logs for ${agg.investment_ids.length} investments`);
        for (const inv of agg.investments) {
          const { data: eventData, error: eventError } = await supabase
            .from("token_distribution_events")
            .insert({
              tokenization_id,
              user_id: userId,
              investment_id: inv.id,
              tokens_requested: inv.tokens_requested,
              tokens_transferred: 0,
              status: "processing",
              hedera_account_id: wallet.hedera_account_id,
              created_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (eventError) {
            console.error(`[DISTRIBUTE-TOKENS] Failed to create processing event for investment ${inv.id}:`, eventError);
          } else if (eventData) {
            distributionEventIds.push(eventData.id);
          }
        }

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

          // FIX 1.2: Throw error if status update fails (prevents re-processing)
          const { error: updateError, count: updatedCount } = await supabase
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
              "[DISTRIBUTE-TOKENS] CRITICAL: Failed to update investments:",
              updateError
            );
            throw new Error(
              `Failed to update investment statuses: ${updateError.message}. Investment IDs: ${agg.investment_ids.join(", ")}`
            );
          }

          console.log(
            `[DISTRIBUTE-TOKENS] Successfully updated ${agg.investment_ids.length} investment statuses`
          );

          // FIX 1.1: Use database function to correctly ADD to balance instead of replacing
          const { error: holdingsError } = await supabase.rpc(
            "upsert_token_holdings",
            {
              p_user_id: userId,
              p_tokenization_id: tokenization_id,
              p_property_id: tokenization.property_id,
              p_token_id: tokenization.token_id,
              p_tokens_to_add: Number(agg.total_tokens_requested),
              p_amount_invested: agg.investments.reduce(
                (sum, inv) => sum + Number(inv.amount_ngn),
                0
              ),
            }
          );

          if (holdingsError) {
            console.error(
              "[DISTRIBUTE-TOKENS] CRITICAL: Failed to update token holdings:",
              holdingsError
            );
            throw new Error(
              `Failed to update token holdings: ${holdingsError.message}. User: ${userId}`
            );
          }

          console.log(
            `[DISTRIBUTE-TOKENS] Successfully updated token holdings for user ${userId}`
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

          // PHASE 3: Update distribution events to SUCCESS with full transaction details
          console.log(`[DISTRIBUTE-TOKENS] Updating ${distributionEventIds.length} distribution events to SUCCESS`);
          for (let i = 0; i < agg.investments.length; i++) {
            const inv = agg.investments[i];
            const eventId = distributionEventIds[i];

            if (eventId) {
              // Update existing processing event
              await supabase
                .from("token_distribution_events")
                .update({
                  tokens_transferred: inv.tokens_requested,
                  status: "success",
                  association_tx_id: associationTxId,
                  kyc_grant_tx_id: grantKycTxId,
                  transfer_tx_id: transferTxId,
                  completed_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", eventId);
            } else {
              // Fallback: create new success event if processing event wasn't created
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

          // PHASE 3: Update distribution events to FAILED with error details
          console.log(`[DISTRIBUTE-TOKENS] Updating ${distributionEventIds.length} distribution events to FAILED`);
          for (let i = 0; i < agg.investment_ids.length; i++) {
            const invId = agg.investment_ids[i];
            const eventId = distributionEventIds[i];

            if (eventId) {
              // Update existing processing event
              await supabase
                .from("token_distribution_events")
                .update({
                  status: "failed",
                  error_message: errorMessage,
                  association_tx_id: associationTxId,
                  kyc_grant_tx_id: grantKycTxId,
                  transfer_tx_id: transferTxId,
                  completed_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", eventId);
            } else {
              // Fallback: create new failed event if processing event wasn't created
              await supabase.from("token_distribution_events").insert({
                tokenization_id,
                user_id: userId,
                investment_id: invId,
                tokens_requested: Number(agg.total_tokens_requested) / agg.investment_ids.length,
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

      // Update last distribution timestamp (for cooldown tracking)
      await supabase
        .from("tokenizations")
        .update({ last_distribution_at: new Date().toISOString() })
        .eq("id", tokenization_id);

      // Release the advisory lock
      await supabase.rpc("pg_advisory_unlock", { lock_id: lockKey });

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
      // Release the advisory lock on error
      try {
        await supabase.rpc("pg_advisory_unlock", { lock_id: lockKey });
      } catch (unlockError) {
        console.error("[DISTRIBUTE-TOKENS] Failed to release lock:", unlockError);
      }

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
