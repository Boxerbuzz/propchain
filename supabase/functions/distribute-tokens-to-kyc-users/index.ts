import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
        users!inner (
          id,
          hedera_account_id,
          kyc_status
        ),
        kyc_verifications (
          status,
          kyc_level
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

      const user = investment.users;
      const kyc = investment.kyc_verifications?.[0];

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

      // Associate user's account with the token first
      console.log(`[DISTRIBUTE-TOKENS] Associating token with user account`);
      const associateResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/associate-hedera-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId: tokenization.token_id,
          accountId: user.hedera_account_id,
        }),
      });

      const associateResult = await associateResponse.json();

      if (!associateResult.success) {
        console.error(`[DISTRIBUTE-TOKENS] Token association failed for user ${user.id}:`, associateResult.error);
        
        results.failed++;
        results.details.push({
          user_id: user.id,
          investment_id: investment.id,
          status: 'failed',
          reason: `Token association failed: ${associateResult.error}`
        });
        continue;
      }

      // Transfer tokens to user
      console.log(`[DISTRIBUTE-TOKENS] Transferring ${investment.tokens_requested} tokens to user ${user.id}`);
      const transferResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/transfer-hedera-tokens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId: tokenization.token_id,
          fromAccountId: Deno.env.get("HEDERA_OPERATOR_ID"),
          toAccountId: user.hedera_account_id,
          amount: investment.tokens_requested,
          memo: `Token distribution for investment in ${tokenization.properties.title}`,
        }),
      });

      const transferResult = await transferResponse.json();

      if (!transferResult.success) {
        console.error(`[DISTRIBUTE-TOKENS] Token transfer failed for user ${user.id}:`, transferResult.error);
        
        results.failed++;
        results.details.push({
          user_id: user.id,
          investment_id: investment.id,
          status: 'failed',
          reason: `Token transfer failed: ${transferResult.error}`
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
            transaction_id: transferResult.data?.transactionId
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
            transaction_id: transferResult.data?.transactionId
          }
        });

      results.distributed++;
      results.details.push({
        user_id: user.id,
        investment_id: investment.id,
        status: 'distributed',
        tokens: investment.tokens_requested,
        transaction_id: transferResult.data?.transactionId
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
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-chat-system-message`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
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
          }),
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