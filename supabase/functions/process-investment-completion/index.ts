import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { investment_id } = await req.json();

    if (!investment_id) {
      return new Response(JSON.stringify({ error: "Investment ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log(
      `[PROCESS-COMPLETION] Processing completion for investment: ${investment_id}`
    );

    // Get investment details
    const { data: investment, error: investmentError } = await supabase
      .from("investments")
      .select(
        `
        *,
        tokenizations!inner (
          id,
          property_id,
          token_id,
          token_name,
          token_symbol,
          properties!inner (
            id,
            title,
            owner_id
          )
        )
      `
      )
      .eq("id", investment_id)
      .single();

    if (investmentError || !investment) {
      console.error(
        "[PROCESS-COMPLETION] Investment not found:",
        investmentError
      );
      return new Response(JSON.stringify({ error: "Investment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[PROCESS-COMPLETION] Found investment:", investment.id);

    // Step 1: Update tokenization stats using database function
    console.log("[PROCESS-COMPLETION] Incrementing tokenization raise");
    const { error: incrementError } = await supabase.rpc(
      "increment_tokenization_raise",
      { p_investment_id: investment_id }
    );

    if (incrementError) {
      console.error(
        "[PROCESS-COMPLETION] Failed to increment raise:",
        incrementError
      );
    }

    // Step 2: Check if user already has holdings for this tokenization (is recurring investor)
    console.log("[PROCESS-COMPLETION] Checking if recurring investor");
    const { data: existingHoldings } = await supabase
      .from("token_holdings")
      .select("id, balance")
      .eq("user_id", investment.investor_id)
      .eq("tokenization_id", investment.tokenization_id)
      .maybeSingle();

    const isRecurringInvestor = !!existingHoldings && existingHoldings.balance > 0;
    console.log(`[PROCESS-COMPLETION] Recurring investor: ${isRecurringInvestor}`);

    // NOTE: Token holdings will be updated by distribute-tokens-to-kyc-users
    // after actual on-chain token transfer. We no longer update holdings here.
    console.log("[PROCESS-COMPLETION] Token holdings will be updated after distribution");

    // Step 3: Create or get chat room for tokenization
    console.log("[PROCESS-COMPLETION] Creating/getting chat room");
    const { data: roomId, error: roomError } = await supabase.rpc(
      "create_chat_room_for_tokenization",
      { p_tokenization_id: investment.tokenization_id }
    );

    if (roomError) {
      console.error(
        "[PROCESS-COMPLETION] Failed to create chat room:",
        roomError
      );
    } else {
      console.log("[PROCESS-COMPLETION] Chat room ID:", roomId);

      // Step 4: Calculate voting power and add user to chat room
      const { data: votingPower, error: votingError } = await supabase.rpc(
        "get_user_voting_power",
        {
          p_user_id: investment.investor_id,
          p_property_id: investment.tokenizations.property_id,
        }
      );

      if (!votingError && roomId) {
        console.log(
          "[PROCESS-COMPLETION] Adding user to chat room with voting power:",
          votingPower
        );
        const { error: participantError } = await supabase.rpc(
          "add_user_to_chat_room",
          {
            p_room_id: roomId,
            p_user_id: investment.investor_id,
            p_voting_power: votingPower || 0,
          }
        );

        if (participantError) {
          console.error(
            "[PROCESS-COMPLETION] Failed to add user to chat:",
            participantError
          );
        } else {
          // Send appropriate message based on whether this is a new or recurring investor
          console.log("[PROCESS-COMPLETION] Sending investor message to chat");
          
          const messageText = isRecurringInvestor
            ? `💰 Investor added ${investment.tokens_requested.toLocaleString()} more ${investment.tokenizations.token_symbol} tokens to their position.`
            : `🎉 New investor joined! Welcome to the ${investment.tokenizations.properties.title} investor community.`;

          const { error: messageError } = await supabase
            .from("chat_messages")
            .insert({
              room_id: roomId,
              sender_id: null, // System message
              message_type: "system",
              message_text: messageText,
              metadata: {
                event_type: isRecurringInvestor ? "additional_investment" : "user_joined",
                user_id: investment.investor_id,
                tokens_invested: investment.tokens_requested,
                amount_invested: investment.amount_ngn,
                investment_id: investment.id,
                is_recurring: isRecurringInvestor,
              },
            });

          if (messageError) {
            console.error(
              "[PROCESS-COMPLETION] Failed to send message:",
              messageError
            );
          }
        }
      }
    }

    // Step 5: Transfer Hedera tokens if available
    // if (investment.tokenizations.token_id && investment.tokenizations.token_id !== 'pending') {
    //   console.log('[PROCESS-COMPLETION] Transferring Hedera tokens');

    //   // Get user's Hedera account
    //   const { data: user, error: userError } = await supabase
    //     .from('users')
    //     .select('hedera_account_id')
    //     .eq('id', investment.investor_id)
    //     .single();

    //   if (!userError && user?.hedera_account_id) {
    //     const { error: transferError } = await supabase.functions.invoke(
    //       'transfer-hedera-tokens',
    //       {
    //         body: {
    //           tokenId: investment.tokenizations.token_id,
    //           toAccountId: user.hedera_account_id,
    //           amount: investment.tokens_requested,
    //           memo: `Investment tokens for ${investment.tokenizations.properties.title}`
    //         }
    //       }
    //     );

    //     if (transferError) {
    //       console.error('[PROCESS-COMPLETION] Token transfer failed:', transferError);
    //     } else {
    //       console.log('[PROCESS-COMPLETION] Tokens transferred successfully');
    //     }
    //   }
    // }

    

    // Step 6: Generate investment documents
    console.log("[PROCESS-COMPLETION] Generating investment documents");
    const { data: documentsResult, error: documentsError } = await supabase.functions.invoke(
      'generate-investment-documents',
      {
        body: { investment_id: investment_id }
      }
    );

    if (documentsError) {
      console.error("[PROCESS-COMPLETION] Failed to generate documents:", documentsError);
    } else {
      console.log("[PROCESS-COMPLETION] Documents generated:", documentsResult);
    }

    // Step 7: Trigger token distribution for this investor (with cooldown check)
    console.log("[PROCESS-COMPLETION] Checking distribution cooldown");
    
    // FIX 2.3: Check cooldown before triggering distribution
    const { data: tokenizationData } = await supabase
      .from('tokenizations')
      .select('last_distribution_at')
      .eq('id', investment.tokenization_id)
      .single();

    const COOLDOWN_SECONDS = 30; // 30 second cooldown for individual investments
    const now = new Date();
    const lastDistribution = tokenizationData?.last_distribution_at 
      ? new Date(tokenizationData.last_distribution_at)
      : null;

    let distributionTriggered = false;
    
    if (lastDistribution) {
      const secondsSinceLastDistribution = 
        (now.getTime() - lastDistribution.getTime()) / 1000;
      
      if (secondsSinceLastDistribution < COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(COOLDOWN_SECONDS - secondsSinceLastDistribution);
        console.log(
          `[PROCESS-COMPLETION] Skipping distribution trigger - last ran ${secondsSinceLastDistribution.toFixed(1)}s ago. Cooldown: ${waitSeconds}s remaining`
        );
      } else {
        distributionTriggered = true;
      }
    } else {
      distributionTriggered = true;
    }

    if (distributionTriggered) {
      console.log("[PROCESS-COMPLETION] Triggering token distribution");
      
      // PHASE 3: Log distribution trigger
      await supabase.from('activity_logs').insert({
        user_id: investorId,
        tokenization_id: tokenizationId,
        activity_type: 'distribution_triggered',
        activity_category: 'token_distribution',
        description: `Token distribution triggered for investment ${investmentId}`,
        metadata: {
          investment_id: investmentId,
          tokenization_id: tokenizationId,
          triggered_by: 'process_investment_completion',
          trigger_time: new Date().toISOString()
        }
      });

      const { data: distData, error: distError } = await supabase.functions.invoke('distribute-tokens-to-kyc-users', {
        body: {
          tokenization_id: tokenizationId,
          target_user_ids: [investorId]
        }
      });

      if (distError) {
        console.error("[PROCESS-COMPLETION] Distribution function error:", distError);
        
        // PHASE 3: Log distribution failure
        await supabase.from('activity_logs').insert({
          user_id: investorId,
          tokenization_id: tokenizationId,
          activity_type: 'distribution_failed',
          activity_category: 'token_distribution',
          description: `Token distribution failed for investment ${investmentId}`,
          metadata: {
            investment_id: investmentId,
            tokenization_id: tokenizationId,
            error: distError.message || 'Unknown error',
            trigger_time: new Date().toISOString()
          }
        });
      } else {
        console.log("[PROCESS-COMPLETION] Distribution triggered successfully:", distData);
        
        // PHASE 3: Log successful distribution trigger
        await supabase.from('activity_logs').insert({
          user_id: investorId,
          tokenization_id: tokenizationId,
          activity_type: 'distribution_completed',
          activity_category: 'token_distribution',
          description: `Token distribution completed for investment ${investmentId}`,
          metadata: {
            investment_id: investmentId,
            tokenization_id: tokenizationId,
            distribution_result: distData,
            trigger_time: new Date().toISOString()
          }
        });
      }
    } else {
      console.log("[PROCESS-COMPLETION] Distribution will be handled by scheduled job due to cooldown");
    }

    // Step 8: Create success notification
    console.log("[PROCESS-COMPLETION] Creating success notification");
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: investment.investor_id,
        title: "Investment Successful!",
        message: `Your investment of ₦${investment.amount_ngn.toLocaleString()} in ${
          investment.tokenizations.properties.title
        } has been confirmed. You now own ${investment.tokens_requested} ${
          investment.tokenizations.token_symbol || "tokens"
        }. Your investment documents are being generated.`,
        notification_type: "investment_success",
        priority: "high",
        action_url: `/portfolio/${investment.tokenization_id}`,
        action_data: {
          investment_id: investment.id,
          property_id: investment.tokenizations.property_id,
          tokenization_id: investment.tokenization_id,
          documents_generated: !!documentsResult?.success,
        },
      });

    if (notificationError) {
      console.error(
        "[PROCESS-COMPLETION] Failed to create notification:",
        notificationError
      );
    }

    console.log(
      "[PROCESS-COMPLETION] Investment completion processing finished"
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Investment completion processed successfully",
        chat_room_id: roomId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[PROCESS-COMPLETION] Error:", error);
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
