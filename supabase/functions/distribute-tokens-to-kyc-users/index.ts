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
  AccountInfoQuery,
  AccountBalanceQuery,
  Status
} from "https://esm.sh/@hashgraph/sdk@2.73.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tokenization_id } = await req.json();

    if (!tokenization_id) {
      return new Response(
        JSON.stringify({ error: 'Tokenization ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize Hedera client with operator credentials
    const operatorId = Deno.env.get('HEDERA_OPERATOR_ID');
    const operatorKey = Deno.env.get('HEDERA_OPERATOR_PRIVATE_KEY');

    if (!operatorId || !operatorKey) {
      throw new Error('Missing HEDERA_OPERATOR_ID or HEDERA_OPERATOR_PRIVATE_KEY');
    }

    const client = Client.forTestnet();
    client.setOperator(
      AccountId.fromString(operatorId),
      PrivateKey.fromStringECDSA(operatorKey)
    );
    const opPrivKey = PrivateKey.fromStringECDSA(operatorKey);
    console.log(`[DISTRIBUTE-TOKENS] Starting token distribution for tokenization: ${tokenization_id}`);

    // Get tokenization details
    const { data: tokenization, error: tokenError } = await supabase
      .from('tokenizations')
      .select(`
        *,
        properties!inner (
          id,
          title,
          owner_id
        )
      `)
      .eq('id', tokenization_id)
      .single();

    if (tokenError || !tokenization) {
      console.error('[DISTRIBUTE-TOKENS] Tokenization not found:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Tokenization not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tokenization.token_id || tokenization.token_id === 'pending') {
      return new Response(
        JSON.stringify({ error: 'Token not yet minted' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all confirmed investments for this tokenization with user details
    const { data: investments, error: investmentError } = await supabase
      .from('investments')
      .select(`
        *,
        investor:users!inner (
          id,
          hedera_account_id,
          kyc_status,
          kyc_verifications!kyc_verifications_user_id_fkey (
            status,
            kyc_level
          )
        )
      `)
      .eq('tokenization_id', tokenization_id)
      .eq('payment_status', 'confirmed');

    if (investmentError) {
      console.error('[DISTRIBUTE-TOKENS] Error fetching investments:', investmentError);
      return new Response(
        JSON.stringify({ error: investmentError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!investments || investments.length === 0) {
      console.log('[DISTRIBUTE-TOKENS] No confirmed investments found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No confirmed investments found for distribution',
          distributed: 0,
          skipped: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = {
      distributed: 0,
      skipped: 0,
      failed: 0,
      details: [] as any[]
    };

    for (const investment of investments) {
      console.log(`[DISTRIBUTE-TOKENS] Processing investment: ${investment.id}`);

      const user = investment.investor;
      const kyc = investment.investor?.kyc_verifications?.[0];

      // Check if user has KYC verification and Hedera account
      const isKycVerified = user.kyc_status === 'verified' || kyc?.status === 'verified';
      const hasHederaAccount = user.hedera_account_id;

      if (!isKycVerified) {
        console.log(`[DISTRIBUTE-TOKENS] Skipping user ${user.id} - KYC not verified`);
        
        // Create notification for KYC requirement
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: 'Complete KYC to Receive Tokens',
            message: `Your investment in "${tokenization.properties.title}" is confirmed, but you need to complete KYC verification to receive your ${investment.tokens_requested} tokens.`,
            notification_type: 'kyc_required_for_tokens',
            action_url: '/kyc/start',
            action_data: {
              investment_id: investment.id,
              tokenization_id: tokenization_id,
              tokens_pending: investment.tokens_requested
            }
          });

        results.skipped++;
        results.details.push({
          user_id: user.id,
          investment_id: investment.id,
          status: 'skipped',
          reason: 'KYC not verified'
        });
        continue;
      }

      if (!hasHederaAccount) {
        console.log(`[DISTRIBUTE-TOKENS] Skipping user ${user.id} - No Hedera account`);
        
        // Create notification for Hedera account requirement
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: 'Create Wallet to Receive Tokens',
            message: `Your investment in "${tokenization.properties.title}" is ready for token distribution, but you need to create a Hedera wallet first.`,
            notification_type: 'wallet_required_for_tokens',
            action_url: '/wallet/setup',
            action_data: {
              investment_id: investment.id,
              tokenization_id: tokenization_id,
              tokens_pending: investment.tokens_requested
            }
          });

        results.skipped++;
        results.details.push({
          user_id: user.id,
          investment_id: investment.id,
          status: 'skipped',
          reason: 'No Hedera account'
        });
        continue;
      }

      // Get user's wallet details from database
      console.log(`[DISTRIBUTE-TOKENS] Loading wallet for user ${user.id}`);
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('id, hedera_account_id, wallet_type, vault_secret_id')
        .eq('user_id', user.id)
        .eq('wallet_type', 'hedera')
        .single();

      if (walletError || !wallet || !wallet.vault_secret_id) {
        console.log(`[DISTRIBUTE-TOKENS] Skipping user ${user.id} - No custodial wallet or vault secret`);
        
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: 'External Wallet Token Association Required',
            message: `Your investment in "${tokenization.properties.title}" is ready, but you're using an external wallet. Please associate token ${tokenization.token_id} in your wallet to receive ${investment.tokens_requested} tokens.`,
            notification_type: 'external_wallet_association_required',
            action_data: {
              investment_id: investment.id,
              tokenization_id: tokenization_id,
              token_id: tokenization.token_id,
              tokens_pending: investment.tokens_requested
            }
          });

        results.skipped++;
        results.details.push({
          user_id: user.id,
          investment_id: investment.id,
          status: 'skipped',
          reason: 'External wallet - manual token association required'
        });
        continue;
      }

      console.log(`[DISTRIBUTE-TOKENS] Wallet found for user ${user.id}: ${wallet.hedera_account_id}`);

      // Get user's private key from Vault
      const { data: userPrivateKey, error: vaultError } = await supabase.rpc(
        'get_wallet_private_key',
        { p_wallet_id: wallet.id }
      );

      if (vaultError || !userPrivateKey) {
        console.error(`[DISTRIBUTE-TOKENS] Failed to retrieve private key for user ${user.id}:`, vaultError);
        
        results.failed++;
        results.details.push({
          user_id: user.id,
          investment_id: investment.id,
          status: 'failed',
          reason: 'Failed to retrieve wallet private key from Vault'
        });
        continue;
      }

      console.log(`[DISTRIBUTE-TOKENS] Retrieved private key from Vault for user ${user.id}`);

      let associationTxId: string | undefined;
      let grantKycTxId: string | undefined;
      let transferTxId: string | undefined;

      try {
        const userPrivKey = PrivateKey.fromStringDer(userPrivateKey);
        const tokenIdObj = TokenId.fromString(tokenization.token_id);
        const userAccountId = AccountId.fromString(wallet.hedera_account_id);
        const operatorAccountId = AccountId.fromString(operatorId);

        // Pre-check account state to determine what actions are needed
        let isAssociated = false;
        let kycGranted = false;
        let tokenRelationship: any = undefined;

        console.log(`[DISTRIBUTE-TOKENS] Checking account state for ${wallet.hedera_account_id}`);
        try {
          const accountInfo = await new AccountInfoQuery()
            .setAccountId(userAccountId)
            .execute(client);
          
          tokenRelationship = accountInfo.tokenRelationships?.get(tokenIdObj);
          if (tokenRelationship) {
            isAssociated = true;
            // Check KYC status from token relationship
            const kycStatus = tokenRelationship.kycStatus;
            if (kycStatus && (kycStatus.toString() === 'KycGranted' || kycStatus._code === 1)) {
              kycGranted = true;
            }
            console.log(`[DISTRIBUTE-TOKENS] Token ${isAssociated ? 'IS' : 'NOT'} associated, KYC ${kycGranted ? 'IS' : 'NOT'} granted`);
          }
        } catch (queryError: any) {
          console.warn('[DISTRIBUTE-TOKENS] AccountInfoQuery failed, will proceed with transactions:', queryError.message);
        }

        // Step 1: Associate token if needed
        if (!isAssociated) {
          console.log(`[DISTRIBUTE-TOKENS] Associating token ${tokenization.token_id} with account ${wallet.hedera_account_id}`);
          
          try {
            const associateTx = new TokenAssociateTransaction()
              .setAccountId(userAccountId)
              .setTokenIds([tokenIdObj])
              .freezeWith(client);

            const associateSignedTx = await associateTx.sign(userPrivKey);
            const associateSubmit = await associateSignedTx.execute(client);
            const associateReceipt = await associateSubmit.getReceipt(client);

            associationTxId = associateSubmit.transactionId.toString();
            console.log(`[DISTRIBUTE-TOKENS] Token association successful (status: ${associateReceipt.status})`);
          } catch (associateError: any) {
            // TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT (code 194) is not an error
            if (associateError.status?._code === 194) {
              console.log(`[DISTRIBUTE-TOKENS] Token already associated (race condition) - continuing`);
              associationTxId = associateError.transactionId?.toString() || 'already-associated';
            } else {
              throw associateError;
            }
          }
        } else {
          console.log(`[DISTRIBUTE-TOKENS] Token already associated - skipping association step`);
          associationTxId = 'pre-associated';
        }

        // Step 2: Grant KYC if needed
        if (!kycGranted) {
          console.log(`[DISTRIBUTE-TOKENS] Granting KYC for account ${wallet.hedera_account_id}`);
          
          try {
            const grantKycTx = new TokenGrantKycTransaction()
              .setAccountId(userAccountId)
              .setTokenId(tokenIdObj)
              .freezeWith(client);

            const grantKycSignedTx = await grantKycTx.sign(opPrivKey);
            const grantKycSubmit = await grantKycSignedTx.execute(client);
            const grantKycReceipt = await grantKycSubmit.getReceipt(client);

            grantKycTxId = grantKycSubmit.transactionId.toString();
            
            if (grantKycReceipt.status !== Status.Success) {
              throw new Error(`KYC grant failed with status: ${grantKycReceipt.status}`);
            }

            console.log(`[DISTRIBUTE-TOKENS] KYC granted successfully. Tx ID: ${grantKycTxId}`);
          } catch (kycError: any) {
            const errorMsg = kycError.message || '';
            // These are acceptable states - not actual errors
            if (errorMsg.includes('ACCOUNT_KYC_ALREADY_GRANTED') || 
                errorMsg.includes('TOKEN_HAS_NO_KYC_KEY') ||
                kycError.status?._code === 222) { // ACCOUNT_KYC_ALREADY_GRANTED_FOR_TOKEN
              console.log(`[DISTRIBUTE-TOKENS] KYC already granted or token has no KYC - continuing`);
              grantKycTxId = kycError.transactionId?.toString() || 'already-granted';
            } else {
              throw kycError;
            }
          }
        } else {
          console.log(`[DISTRIBUTE-TOKENS] KYC already granted - skipping KYC grant step`);
          grantKycTxId = 'pre-granted';
        }

        // Step 3: Idempotent transfer - only send the delta
        console.log(`[DISTRIBUTE-TOKENS] Checking current token balance for ${wallet.hedera_account_id}`);
        
        let currentBalance = 0n;
        try {
          const balance = await new AccountBalanceQuery()
            .setAccountId(userAccountId)
            .execute(client);
          
          // Get balance for this specific token
          const tokenBalance = balance.tokens.get(tokenIdObj);
          if (tokenBalance) {
            currentBalance = BigInt(tokenBalance.toString());
            console.log(`[DISTRIBUTE-TOKENS] Current on-chain balance: ${currentBalance} tokens`);
          }
        } catch (balanceError: any) {
          console.warn('[DISTRIBUTE-TOKENS] Balance query failed, will attempt full transfer:', balanceError.message);
        }

        // Get expected balance from database
        const { data: holding } = await supabase
          .from('token_holdings')
          .select('balance')
          .eq('user_id', user.id)
          .eq('tokenization_id', tokenization_id)
          .maybeSingle();

        const priorHoldings = BigInt(String(holding?.balance ?? 0));
        const tokensRequested = BigInt(String(investment.tokens_requested));
        const expectedTotalBalance = priorHoldings + tokensRequested;

        console.log(`[DISTRIBUTE-TOKENS] Prior holdings: ${priorHoldings}, Requested: ${tokensRequested}, Expected total: ${expectedTotalBalance}, Current on-chain: ${currentBalance}`);

        let tokensToTransfer = 0n;
        if (expectedTotalBalance > currentBalance) {
          tokensToTransfer = expectedTotalBalance - currentBalance;
        }

        if (tokensToTransfer > 0n) {
          console.log(`[DISTRIBUTE-TOKENS] Transferring ${tokensToTransfer} tokens to ${wallet.hedera_account_id}`);
          
          const transferTx = new TransferTransaction()
            .addTokenTransfer(tokenIdObj, operatorAccountId, -Number(tokensToTransfer))
            .addTokenTransfer(tokenIdObj, userAccountId, Number(tokensToTransfer))
            .setTransactionMemo(`Token distribution for ${tokenization.properties.title}`)
            .freezeWith(client);

          const transferSignedTx = await transferTx.sign(opPrivKey);
          const transferSubmit = await transferSignedTx.execute(client);
          const transferReceipt = await transferSubmit.getReceipt(client);

          transferTxId = transferSubmit.transactionId.toString();

          if (transferReceipt.status !== Status.Success) {
            throw new Error(`Token transfer failed with status: ${transferReceipt.status}`);
          }

          console.log(`[DISTRIBUTE-TOKENS] Token transfer successful. Transaction ID: ${transferTxId}`);
        } else {
          console.log(`[DISTRIBUTE-TOKENS] No transfer needed - account already has sufficient tokens (idempotent retry)`);
          transferTxId = 'no-transfer-needed';
        }

      } catch (hederaError: any) {
        console.error(`[DISTRIBUTE-TOKENS] Hedera operation failed for user ${user.id}:`, hederaError);
        
        let errorMessage = hederaError.message || 'Unknown Hedera error';
        
        // Map common Hedera error codes to user-friendly messages
        if (errorMessage.includes('INSUFFICIENT_ACCOUNT_BALANCE')) {
          errorMessage = 'Insufficient HBAR balance for transaction fees';
        } else if (errorMessage.includes('INVALID_SIGNATURE')) {
          errorMessage = 'Invalid signature - wallet key mismatch';
        } else if (errorMessage.includes('TOKEN_NOT_ASSOCIATED')) {
          errorMessage = 'Token not associated with account';
        }

        results.failed++;
        results.details.push({
          user_id: user.id,
          investment_id: investment.id,
          status: 'failed',
          reason: errorMessage,
          association_tx: associationTxId,
          grant_kyc_tx: grantKycTxId,
          transfer_tx: transferTxId
        });
        continue;
      }

      // Update investment status and token holdings
      await supabase
        .from('investments')
        .update({
          payment_status: 'tokens_distributed',
          tokens_allocated: investment.tokens_requested,
          updated_at: new Date().toISOString()
        })
        .eq('id', investment.id);

      // Update token holdings with actual token ID and transaction ID
      await supabase
        .from('token_holdings')
        .update({
          token_id: tokenization.token_id,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('tokenization_id', tokenization_id);

      // Create success notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Tokens Distributed Successfully!',
          message: `Congratulations! Your ${investment.tokens_requested} ${tokenization.token_symbol} tokens for "${tokenization.properties.title}" have been distributed to your wallet.`,
          notification_type: 'tokens_distributed',
          action_url: '/portfolio',
          action_data: {
            investment_id: investment.id,
            tokenization_id: tokenization_id,
            token_id: tokenization.token_id,
            tokens_received: investment.tokens_requested,
            association_tx: associationTxId,
            grant_kyc_tx: grantKycTxId,
            transfer_tx: transferTxId
          }
        });

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          property_id: tokenization.property_id,
          tokenization_id: tokenization_id,
          activity_type: 'tokens_distributed',
          description: `Received ${investment.tokens_requested} ${tokenization.token_symbol} tokens`,
          metadata: {
            investment_id: investment.id,
            token_id: tokenization.token_id,
            tokens_received: investment.tokens_requested,
            association_tx: associationTxId,
            grant_kyc_tx: grantKycTxId,
            transfer_tx: transferTxId
          }
        });

      results.distributed++;
      results.details.push({
        user_id: user.id,
        investment_id: investment.id,
        status: 'distributed',
        tokens: investment.tokens_requested,
        association_tx: associationTxId,
        grant_kyc_tx: grantKycTxId,
        transfer_tx: transferTxId
      });

      console.log(`[DISTRIBUTE-TOKENS] Successfully distributed tokens to user ${user.id}`);
    }

    // Update tokenization status to distributed if all eligible users received tokens
    if (results.distributed > 0 && results.failed === 0) {
      await supabase
        .from('tokenizations')
        .update({
          status: 'distributed',
          updated_at: new Date().toISOString()
        })
        .eq('id', tokenization_id);

      // Get associated chat room for this tokenization
      const { data: chatRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('tokenization_id', tokenization_id)
        .single();

      // Send AI system message to chat
      if (chatRoom) {
        await supabase.functions.invoke('send-chat-system-message', {
          body: {
            room_id: chatRoom.id,
            message_text: `✅ Token distribution complete! ${results.distributed} investor${results.distributed > 1 ? 's' : ''} received their ${tokenization.token_symbol} tokens. You can now create governance proposals and participate in property decisions.`,
            message_type: 'system',
            metadata: {
              event_type: 'tokens_distributed',
              tokenization_id: tokenization_id,
              token_id: tokenization.token_id,
              investors_count: results.distributed,
              token_symbol: tokenization.token_symbol
            }
          }
        });
      }
    }

    console.log(`[DISTRIBUTE-TOKENS] Distribution complete. Distributed: ${results.distributed}, Skipped: ${results.skipped}, Failed: ${results.failed}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Token distribution complete`,
        distributed: results.distributed,
        skipped: results.skipped,
        failed: results.failed,
        details: results.details
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[DISTRIBUTE-TOKENS] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});