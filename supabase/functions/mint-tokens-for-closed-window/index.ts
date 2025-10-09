import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`[MINT-TOKENS] Request received: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    console.log(`[MINT-TOKENS] CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[MINT-TOKENS] Initializing Supabase client`);
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Query for all tokenizations ready for minting
    console.log(`[MINT-TOKENS] Querying for tokenizations with status 'minting_ready'`);
    const { data: tokenizations, error: queryError } = await supabaseClient
      .from('tokenizations')
      .select(`
        *,
        properties!inner (
          id,
          title,
          owner_id
        )
      `)
      .eq('status', 'minting_ready');

    if (queryError) {
      console.error(`[MINT-TOKENS] ❌ Error querying tokenizations:`, queryError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: queryError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!tokenizations || tokenizations.length === 0) {
      console.log(`[MINT-TOKENS] ℹ️ No tokenizations found with status 'minting_ready'`);
      return new Response(JSON.stringify({ 
        success: true,
        message: 'No tokenizations ready for minting',
        processed: 0,
        succeeded: 0,
        failed: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[MINT-TOKENS] 📋 Found ${tokenizations.length} tokenization(s) ready for minting`);

    let processedCount = 0;
    let succeededCount = 0;
    let failedCount = 0;
    const results: any[] = [];

    // Process each tokenization
    for (const tokenization of tokenizations) {
      processedCount++;
      console.log(`[MINT-TOKENS] 🔄 Processing tokenization ${processedCount}/${tokenizations.length}: ${tokenization.id}`);
      console.log(`[MINT-TOKENS] Token: ${tokenization.token_name} (${tokenization.token_symbol})`);
      console.log(`[MINT-TOKENS] Tokens to mint: ${tokenization.tokens_sold}`);

      try {
        // Validate token_id exists
        if (!tokenization.token_id) {
          console.error(`[MINT-TOKENS] ❌ Tokenization ${tokenization.id} has no token_id, skipping`);
          failedCount++;
          results.push({
            tokenization_id: tokenization.id,
            success: false,
            error: 'Missing token_id - token must be created first'
          });
          continue;
        }

        // Validate tokens_sold
        if (!tokenization.tokens_sold || tokenization.tokens_sold <= 0) {
          console.error(`[MINT-TOKENS] ❌ Tokenization ${tokenization.id} has no tokens sold, skipping`);
          failedCount++;
          results.push({
            tokenization_id: tokenization.id,
            success: false,
            error: 'No tokens sold - nothing to mint'
          });
          continue;
        }

        // Update status to 'minting' to prevent duplicate processing
        console.log(`[MINT-TOKENS] 📝 Updating tokenization ${tokenization.id} status to 'minting'`);
        const { error: updateMintingError } = await supabaseClient
          .from('tokenizations')
          .update({
            status: 'minting',
            updated_at: new Date().toISOString(),
          })
          .eq('id', tokenization.id);

        if (updateMintingError) {
          console.error(`[MINT-TOKENS] ❌ Failed to update status to 'minting':`, updateMintingError);
          failedCount++;
          results.push({
            tokenization_id: tokenization.id,
            success: false,
            error: updateMintingError.message
          });
          continue;
        }

        // Call mint-hedera-tokens function
        console.log(`[MINT-TOKENS] 🔗 Calling mint-hedera-tokens for ${tokenization.tokens_sold} tokens`);
        const mintResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/mint-hedera-tokens`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tokenId: tokenization.token_id,
            amount: tokenization.tokens_sold,
          }),
        });

        const mintResult = await mintResponse.json();
        console.log(`[MINT-TOKENS] 📤 Mint response:`, mintResult);

        if (!mintResult.success) {
          console.error(`[MINT-TOKENS] ❌ Token minting failed:`, mintResult.error);
          
          // Revert status back to 'minting_ready' for retry
          await supabaseClient
            .from('tokenizations')
            .update({
              status: 'minting_ready',
              updated_at: new Date().toISOString(),
            })
            .eq('id', tokenization.id);

          failedCount++;
          results.push({
            tokenization_id: tokenization.id,
            success: false,
            error: mintResult.error
          });
          continue;
        }

        console.log(`[MINT-TOKENS] ✅ Tokens minted successfully. Transaction ID: ${mintResult.data.transactionId}`);

        // Update tokenization to 'minted' status
        console.log(`[MINT-TOKENS] 📝 Updating tokenization ${tokenization.id} to 'minted' status`);
        const { error: updateError } = await supabaseClient
          .from('tokenizations')
          .update({
            minting_transaction_id: mintResult.data.transactionId,
            status: 'minted',
            minted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', tokenization.id);

        if (updateError) {
          console.error(`[MINT-TOKENS] ❌ Failed to update tokenization status:`, updateError);
          failedCount++;
          results.push({
            tokenization_id: tokenization.id,
            success: false,
            error: updateError.message
          });
          continue;
        }

        // Create notification for property owner
        console.log(`[MINT-TOKENS] 📬 Creating notification for property owner`);
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: tokenization.properties.owner_id,
            notification_type: 'tokens_minted',
            title: 'Tokens Minted Successfully',
            message: `${tokenization.tokens_sold} tokens have been minted for "${tokenization.properties.title}". Distribution to investors will begin shortly.`,
            action_url: `/property/${tokenization.properties.id}/view`,
          });

        // Log activity
        console.log(`[MINT-TOKENS] 📝 Logging token minting activity`);
        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: tokenization.properties.owner_id,
            property_id: tokenization.properties.id,
            tokenization_id: tokenization.id,
            activity_type: 'tokens_minted',
            description: `Minted ${tokenization.tokens_sold} tokens for ${tokenization.token_name} (${tokenization.token_symbol})`,
            metadata: {
              token_id: tokenization.token_id,
              tokens_minted: tokenization.tokens_sold,
              transaction_id: mintResult.data.transactionId,
            },
          });

        // Get associated chat room for this tokenization
        const { data: chatRoom } = await supabaseClient
          .from('chat_rooms')
          .select('id')
          .eq('tokenization_id', tokenization.id)
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
              message_text: `🎉 Tokens have been minted! ${tokenization.tokens_sold.toLocaleString()} tokens of ${tokenization.token_symbol} created successfully. Distribution to verified investors will begin shortly.`,
              message_type: 'system',
              metadata: {
                event_type: 'tokens_minted',
                tokenization_id: tokenization.id,
                token_id: tokenization.token_id,
                tokens_minted: tokenization.tokens_sold,
                transaction_id: mintResult.data.transactionId
              }
            }),
          });
        }

        // Trigger token distribution
        console.log(`[MINT-TOKENS] 🔗 Triggering token distribution to KYC users`);
        const distributionResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/distribute-tokens-to-kyc-users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tokenization_id: tokenization.id,
          }),
        });

        const distributionResult = await distributionResponse.json();
        console.log(`[MINT-TOKENS] 📤 Distribution response:`, distributionResult);

        succeededCount++;
        results.push({
          tokenization_id: tokenization.id,
          success: true,
          tokens_minted: tokenization.tokens_sold,
          transaction_id: mintResult.data.transactionId,
          distribution_initiated: distributionResult.success || false
        });

        console.log(`[MINT-TOKENS] ✅ Successfully processed tokenization ${tokenization.id}`);

      } catch (error: any) {
        console.error(`[MINT-TOKENS] ❌ Error processing tokenization ${tokenization.id}:`, error);
        failedCount++;
        results.push({
          tokenization_id: tokenization.id,
          success: false,
          error: error.message
        });

        // Try to revert status
        try {
          await supabaseClient
            .from('tokenizations')
            .update({
              status: 'minting_ready',
              updated_at: new Date().toISOString(),
            })
            .eq('id', tokenization.id);
        } catch (revertError) {
          console.error(`[MINT-TOKENS] ❌ Failed to revert status:`, revertError);
        }
      }
    }

    console.log(`[MINT-TOKENS] 📊 Summary: Processed ${processedCount}, Succeeded ${succeededCount}, Failed ${failedCount}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${processedCount} tokenization(s)`,
      processed: processedCount,
      succeeded: succeededCount,
      failed: failedCount,
      results: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error(`[MINT-TOKENS] ❌ Unexpected error:`, error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});