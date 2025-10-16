import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log(`[TOKENIZATION-APPROVED] Request received: ${req.method}`);

  if (req.method === "OPTIONS") {
    console.log(`[TOKENIZATION-APPROVED] CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.error(`[TOKENIZATION-APPROVED] Invalid method: ${req.method}`);
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { record, old_record } = await req.json();
    console.log(`[TOKENIZATION-APPROVED] Processing tokenization approval:`, {
      tokenizationId: record?.id,
      oldStatus: old_record?.status,
      newStatus: record?.status,
    });

    if (!record.id) {
      console.error(
        `[TOKENIZATION-APPROVED] ❌ Missing tokenizationId in request`
      );
      return new Response(JSON.stringify({ error: "Missing tokenizationId" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Only proceed if status actually changed from non-approved to approved
    if (
      old_record &&
      old_record.status == "draft" &&
      record &&
      record.status === "active"
    ) {
      console.log(
        `[TOKENIZATION-APPROVED] ✅ Status change to approved detected, proceeding with workflow`
      );

      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Get tokenization details with property HCS topic
      const { data: tokenization, error: tokenError } = await supabaseClient
        .from("tokenizations")
        .select(
          `
          *,
          properties!inner (
            id,
            title,
            owner_id,
            hcs_topic_id
          )
        `
        )
        .eq("id", record.id)
        .single();

      if (tokenError || !tokenization) {
        console.error(
          `[TOKENIZATION-APPROVED] ❌ Error fetching tokenization:`,
          tokenError
        );
        return new Response(
          JSON.stringify({ error: "Tokenization not found" }),
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }

      console.log(`[TOKENIZATION-APPROVED] 📋 Tokenization details:`, {
        id: tokenization.id,
        tokenName: tokenization.token_name,
        tokenSymbol: tokenization.token_symbol,
        totalSupply: tokenization.total_supply,
        propertyId: tokenization.property_id,
        hcsTopicId: tokenization.properties?.hcs_topic_id,
      });

      // Create metadata for token creation
      const tokenMetadata = {
        property_id: tokenization.property_id,
        tokenization_id: tokenization.id,
      };

      console.log(`[TOKENIZATION-APPROVED] 📝 Token metadata:`, tokenMetadata);

      // Call create-hedera-token edge function
      console.log(`[TOKENIZATION-APPROVED] 🔗 Creating Hedera token...`);
      const tokenResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/create-hedera-token`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get(
              "SUPABASE_SERVICE_ROLE_KEY"
            )}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tokenName: tokenization.token_name,
            tokenSymbol: tokenization.token_symbol,
            totalSupply: tokenization.total_supply,
            decimals: 0,
            metadata: tokenMetadata,
          }),
        }
      );

      const tokenResult = await tokenResponse.json();
      console.log(
        `[TOKENIZATION-APPROVED] 📤 Token creation response:`,
        tokenResult
      );

      if (!tokenResult.success) {
        console.error(
          `[TOKENIZATION-APPROVED] ❌ Error creating Hedera token:`,
          tokenResult.error
        );
        return new Response(
          JSON.stringify({ error: "Failed to create token" }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }

      console.log(`[TOKENIZATION-APPROVED] ✅ Token created successfully:`, {
        tokenId: tokenResult.data.tokenId,
        transactionId: tokenResult.data.transactionId,
      });

      // Update tokenization with Hedera token details
      // Note: minted_at will be set later when tokens are actually minted (after investment window closes)
      console.log(
        `[TOKENIZATION-APPROVED] 📝 Updating tokenization with Hedera token details...`
      );
      const { error: updateError } = await supabaseClient
        .from("tokenizations")
        .update({
          token_id: tokenResult.data.tokenId,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", record.id);

      if (updateError) {
        console.error(
          `[TOKENIZATION-APPROVED] ❌ Error updating tokenization:`,
          updateError
        );
        return new Response(
          JSON.stringify({ error: "Failed to update tokenization" }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }

      console.log(
        `[TOKENIZATION-APPROVED] ✅ Tokenization updated successfully`
      );

      // Log token creation to property's HCS topic
      if (tokenization.properties?.hcs_topic_id) {
        console.log(
          `[TOKENIZATION-APPROVED] 📝 Logging token creation to HCS topic: ${tokenization.properties.hcs_topic_id}`
        );

        const hcsMessage = {
          event: "token_created",
          tokenization_id: tokenization.id,
          property_id: tokenization.property_id,
          token_id: tokenResult.data.tokenId,
          transaction_id: tokenResult.data.transactionId,
          token_name: tokenization.token_name,
          token_symbol: tokenization.token_symbol,
          total_supply: tokenization.total_supply,
          price_per_token: tokenization.price_per_token,
          expected_roi_annual: tokenization.expected_roi_annual,
          dividend_frequency: tokenization.dividend_frequency,
          management_fee_percentage: tokenization.management_fee_percentage,
          platform_fee_percentage: tokenization.platform_fee_percentage,
          investment_window_start: tokenization.investment_window_start,
          investment_window_end: tokenization.investment_window_end,
          minimum_raise: tokenization.minimum_raise,
          target_raise: tokenization.target_raise,
          created_by: tokenization.created_by,
          approved_by: tokenization.approved_by,
          created_at: new Date().toISOString(),
          token_memo: tokenResult.data.memo,
          token_metadata: tokenResult.data.metadata,
        };

        try {
          const hcsResponse = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/submit-to-hcs`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${Deno.env.get(
                  "SUPABASE_SERVICE_ROLE_KEY"
                )}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                topicId: tokenization.properties.hcs_topic_id,
                message: hcsMessage,
              }),
            }
          );

          const hcsResult = await hcsResponse.json();
          console.log(
            `[TOKENIZATION-APPROVED] 📤 HCS message response:`,
            hcsResult
          );

          if (hcsResult.success) {
            console.log(
              `[TOKENIZATION-APPROVED] ✅ Token creation logged to HCS topic successfully`
            );
          } else {
            console.error(
              `[TOKENIZATION-APPROVED] ❌ Failed to log to HCS topic:`,
              hcsResult.error
            );
          }
        } catch (hcsError) {
          console.error(
            `[TOKENIZATION-APPROVED] ❌ Error logging to HCS topic:`,
            hcsError
          );
        }
      } else {
        console.log(
          `[TOKENIZATION-APPROVED] ⚠️ Property has no HCS topic ID, skipping HCS logging`
        );
      }

      // Create notification for property owner
      console.log(
        `[TOKENIZATION-APPROVED] 📬 Creating notification for property owner...`
      );
      await supabaseClient.from("notifications").insert({
        user_id: tokenization.properties.owner_id,
        notification_type: "tokenization_approved",
        title: "Tokenization Approved & Active",
        message: `Your property "${tokenization.properties.title}" has been successfully tokenized. Token ID: ${tokenResult.data.tokenId}`,
        action_url: `/property/${tokenization.properties.id}/view`,
      });

      console.log(
        `[TOKENIZATION-APPROVED] ✅ Tokenization ${record.id} successfully activated with token ID: ${tokenResult.data.tokenId}`
      );

      // Create property treasury account
      console.log(`[TOKENIZATION-APPROVED] 🏦 Creating property treasury account...`);
      try {
        const treasuryResponse = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/create-property-treasury`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tokenization_id: record.id,
            }),
          }
        );

        const treasuryResult = await treasuryResponse.json();
        console.log(`[TOKENIZATION-APPROVED] 📤 Treasury creation response:`, treasuryResult);

        if (treasuryResult.success) {
          console.log(
            `[TOKENIZATION-APPROVED] ✅ Treasury account created: ${treasuryResult.data.treasury_account_id}`
          );
        } else {
          console.error(
            `[TOKENIZATION-APPROVED] ⚠️ Treasury creation failed (non-critical):`,
            treasuryResult.error
          );
        }
      } catch (treasuryError) {
        console.error(
          `[TOKENIZATION-APPROVED] ⚠️ Treasury creation error (non-critical):`,
          treasuryError
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            tokenId: tokenResult.data.tokenId,
            transactionId: tokenResult.data.transactionId,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    console.log(
      `[TOKENIZATION-APPROVED] ⏭️ No status change to approved detected, skipping processing`
    );
    return new Response(
      JSON.stringify({
        success: true,
        message: "No status change to approved detected, skipping processing",
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    console.error(
      `[TOKENIZATION-APPROVED] ❌ Error in tokenization-approved:`,
      error
    );
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
