import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      from_user_id,
      to_user_id,
      tokenization_id,
      tokens_transferred,
      transfer_price_per_token,
      transfer_type = 'sale',
      notes
    } = await req.json();

    if (!from_user_id || !to_user_id || !tokenization_id || !tokens_transferred) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("[TRANSFER] Processing token transfer:", {
      from_user_id,
      to_user_id,
      tokens_transferred
    });

    // Step 1: Verify sender has enough tokens
    const { data: senderHoldings, error: senderError } = await supabase
      .from("token_holdings")
      .select("balance")
      .eq("user_id", from_user_id)
      .eq("tokenization_id", tokenization_id)
      .single();

    if (senderError || !senderHoldings) {
      return new Response(
        JSON.stringify({ error: "Sender token holdings not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (senderHoldings.balance < tokens_transferred) {
      return new Response(
        JSON.stringify({ error: "Insufficient token balance" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Get tokenization details
    const { data: tokenization, error: tokenError } = await supabase
      .from("tokenizations")
      .select("id, property_id, token_id, token_name, token_symbol, total_supply")
      .eq("id", tokenization_id)
      .single();

    if (tokenError || !tokenization) {
      return new Response(
        JSON.stringify({ error: "Tokenization not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Create transfer record
    const total_transfer_value = transfer_price_per_token 
      ? tokens_transferred * transfer_price_per_token 
      : null;

    const { data: transfer, error: transferError } = await supabase
      .from("token_transfers")
      .insert({
        from_user_id,
        to_user_id,
        tokenization_id,
        tokens_transferred,
        transfer_price_per_token,
        total_transfer_value,
        transfer_type,
        notes,
        status: 'pending',
        metadata: {
          token_symbol: tokenization.token_symbol,
          property_id: tokenization.property_id,
        }
      })
      .select()
      .single();

    if (transferError || !transfer) {
      console.error("[TRANSFER] Failed to create transfer record:", transferError);
      return new Response(
        JSON.stringify({ error: "Failed to create transfer" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[TRANSFER] Transfer record created:", transfer.id);

    // Step 4: Execute Hedera token transfer (if token_id exists)
    let hederaTxId = null;
    if (tokenization.token_id && tokenization.token_id !== 'pending') {
      console.log("[TRANSFER] Executing Hedera transfer");
      
      // Get user Hedera accounts
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, hedera_account_id")
        .in("id", [from_user_id, to_user_id]);

      if (!usersError && users?.length === 2) {
        const sender = users.find(u => u.id === from_user_id);
        const recipient = users.find(u => u.id === to_user_id);

        if (sender?.hedera_account_id && recipient?.hedera_account_id) {
          try {
            // This would call the transfer-hedera-tokens function
            // For now, we'll mark as completed without Hedera transfer
            console.log("[TRANSFER] Hedera accounts found, transfer would be executed");
            hederaTxId = `SIMULATED-${Date.now()}`;
          } catch (err) {
            console.error("[TRANSFER] Hedera transfer failed:", err);
          }
        }
      }
    }

    // Step 5: Update token holdings
    console.log("[TRANSFER] Updating token holdings");

    // Reduce sender's balance
    const { error: senderUpdateError } = await supabase
      .from("token_holdings")
      .update({
        balance: senderHoldings.balance - tokens_transferred,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", from_user_id)
      .eq("tokenization_id", tokenization_id);

    if (senderUpdateError) {
      console.error("[TRANSFER] Failed to update sender holdings:", senderUpdateError);
      throw new Error("Failed to update sender holdings");
    }

    // Add to recipient's balance (upsert)
    const { data: recipientHoldings } = await supabase
      .from("token_holdings")
      .select("balance")
      .eq("user_id", to_user_id)
      .eq("tokenization_id", tokenization_id)
      .single();

    if (recipientHoldings) {
      // Update existing holdings
      const { error: recipientUpdateError } = await supabase
        .from("token_holdings")
        .update({
          balance: recipientHoldings.balance + tokens_transferred,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", to_user_id)
        .eq("tokenization_id", tokenization_id);

      if (recipientUpdateError) throw new Error("Failed to update recipient holdings");
    } else {
      // Create new holdings
      const { error: recipientInsertError } = await supabase
        .from("token_holdings")
        .insert({
          user_id: to_user_id,
          tokenization_id,
          property_id: tokenization.property_id,
          token_id: tokenization.token_id || 'pending',
          balance: tokens_transferred,
          total_invested_ngn: 0, // Secondary market purchase
        });

      if (recipientInsertError) throw new Error("Failed to create recipient holdings");
    }

    // Step 6: Update transfer status
    await supabase
      .from("token_transfers")
      .update({
        status: 'completed',
        hedera_transaction_id: hederaTxId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transfer.id);

    console.log("[TRANSFER] Token holdings updated successfully");

    // Step 7: Generate new documents for recipient
    console.log("[TRANSFER] Generating transfer documents for recipient");

    // Get recipient's investment record (or create one for secondary market)
    const { data: recipientInvestment } = await supabase
      .from("investments")
      .select("id")
      .eq("investor_id", to_user_id)
      .eq("tokenization_id", tokenization_id)
      .single();

    // Note: Document generation for transfers would require custom logic
    // For now, we'll just notify users

    // Step 8: Send notifications
    console.log("[TRANSFER] Sending notifications");

    await supabase.from("notifications").insert([
      {
        user_id: from_user_id,
        title: "Tokens Transferred",
        message: `You have successfully transferred ${tokens_transferred} ${tokenization.token_symbol} tokens.`,
        notification_type: "transfer_completed",
        priority: "normal",
        action_url: `/portfolio/${tokenization_id}`,
        action_data: {
          transfer_id: transfer.id,
          tokens_transferred,
          transfer_type,
        },
      },
      {
        user_id: to_user_id,
        title: "Tokens Received",
        message: `You have received ${tokens_transferred} ${tokenization.token_symbol} tokens.`,
        notification_type: "transfer_received",
        priority: "high",
        action_url: `/portfolio/${tokenization_id}`,
        action_data: {
          transfer_id: transfer.id,
          tokens_transferred,
          transfer_type,
        },
      },
    ]);

    console.log("[TRANSFER] Transfer completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        transfer_id: transfer.id,
        hedera_transaction_id: hederaTxId,
        tokens_transferred,
        message: "Token transfer completed successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[TRANSFER] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Transfer failed",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
