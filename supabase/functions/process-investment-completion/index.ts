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

    // Step 2: Update token holdings using database function
    console.log("[PROCESS-COMPLETION] Upserting token holdings");
    const { error: holdingsError } = await supabase.rpc(
      "upsert_token_holdings",
      {
        p_user_id: investment.investor_id,
        p_tokenization_id: investment.tokenization_id,
        p_property_id: investment.tokenizations.property_id,
        p_token_id: investment.tokenizations.token_id || "pending",
        p_tokens_to_add: investment.tokens_requested,
        p_amount_invested: investment.amount_ngn,
      }
    );

    if (holdingsError) {
      console.error(
        "[PROCESS-COMPLETION] Failed to update holdings:",
        holdingsError
      );
    }

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

    

    // Step 6: Create success notification
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
        }.`,
        notification_type: "investment_success",
        action_url: `/portfolio`,
        action_data: {
          investment_id: investment.id,
          property_id: investment.tokenizations.property_id,
          tokenization_id: investment.tokenization_id,
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
