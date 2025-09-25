import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/std@0.178.0/dotenv/load.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("Paystack secret key must be set in Supabase secrets.");
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "No signature found in headers." }), { status: 400 });
    }

    const rawBody = await req.text();

    // Verify the webhook signature
    const crypto = await import("node:crypto");
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");

    if (hash !== signature) {
      console.warn("Paystack Webhook: Invalid signature.");
      return new Response(JSON.stringify({ error: "Invalid signature." }), { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log("Paystack Webhook Event:", event.event);

    // Initialize Supabase client for database interactions
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle different Paystack events
    switch (event.event) {
      case "charge.success":
        const transactionReference = event.data.reference;
        const amount = event.data.amount / 100; // Convert kobo to actual currency unit
        const currency = event.data.currency;
        const status = event.data.status;
        const paidAt = event.data.paid_at;
        const customerEmail = event.data.customer.email;

        console.log(`Charge successful for reference: ${transactionReference}, amount: ${amount} ${currency}`);

        // Update the investment record in your Supabase database
        // You'll need to find the investment by the transactionReference
        const { data: investment, error: fetchError } = await supabaseClient
          .from("investments")
          .select("id, tokens_requested, investor_id, tokenization_id, amount_ngn")
          .eq("paystack_reference", transactionReference)
          .single();

        if (fetchError || !investment) {
          console.error("Error fetching investment or investment not found:", fetchError?.message);
          return new Response(JSON.stringify({ error: "Investment not found or database error." }), { status: 404 });
        }

        const { error: updateError } = await supabaseClient
          .from("investments")
          .update({
            payment_status: "confirmed",
            payment_confirmed_at: paidAt,
            tokens_allocated: investment.tokens_requested, // Allocate tokens as per request
            // You might want to update amount_usd, exchange_rate if applicable
            updated_at: new Date().toISOString(),
          })
          .eq("id", investment.id);

        if (updateError) {
          console.error("Error updating investment status:", updateError.message);
          return new Response(JSON.stringify({ error: "Failed to update investment status." }), { status: 500 });
        }

        console.log(`Investment ${investment.id} confirmed and updated.`);

        // Update tokenization statistics
        await supabaseClient.rpc('increment_tokenization_raise', {
          p_investment_id: investment.id
        });

        // Create or update token holdings
        const { data: tokenization } = await supabaseClient
          .from('tokenizations')
          .select('property_id, token_id')
          .eq('id', investment.tokenization_id)
          .single();

        if (tokenization) {
          await supabaseClient.rpc('upsert_token_holdings', {
            p_user_id: investment.investor_id,
            p_tokenization_id: investment.tokenization_id,
            p_property_id: tokenization.property_id,
            p_token_id: tokenization.token_id || 'pending',
            p_tokens_to_add: investment.tokens_requested,
            p_amount_invested: investment.amount_ngn
          });

          // Transfer tokens if Hedera token exists and investor has account
          if (tokenization.token_id && tokenization.token_id !== 'pending') {
            const { data: investor } = await supabaseClient
              .from('users')
              .select('hedera_account_id')
              .eq('id', investment.investor_id)
              .single();

            if (investor?.hedera_account_id) {
              try {
                const transferResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/transfer-hedera-tokens`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    senderAccountId: Deno.env.get("HEDERA_OPERATOR_ID"),
                    recipientAccountId: investor.hedera_account_id,
                    tokenId: tokenization.token_id,
                    amount: investment.tokens_requested,
                    senderPrivateKey: Deno.env.get("HEDERA_OPERATOR_PRIVATE_KEY"),
                  }),
                });

                const transferResult = await transferResponse.json();
                
                if (transferResult.success) {
                  console.log(`Tokens transferred to investor: ${transferResult.data.transactionId}`);
                  
                  // Update token holdings with transaction ID
                  await supabaseClient
                    .from('token_holdings')
                    .update({ 
                      token_id: `${tokenization.token_id}:${transferResult.data.transactionId}`,
                      updated_at: new Date().toISOString()
                    })
                    .eq('user_id', investment.investor_id)
                    .eq('tokenization_id', investment.tokenization_id);
                }
              } catch (error) {
                console.error('Token transfer failed:', error);
              }
            }
          }

          // Auto-create chat room if it doesn't exist and add investor
          const { data: chatRoomId } = await supabaseClient.rpc('create_chat_room_for_tokenization', {
            p_tokenization_id: investment.tokenization_id
          });

          if (chatRoomId) {
            // Add investor to chat room with voting power based on tokens
            await supabaseClient.rpc('add_user_to_chat_room', {
              p_room_id: chatRoomId,
              p_user_id: investment.investor_id,
              p_voting_power: investment.tokens_requested
            });

            // Create chat room invitation notification
            await supabaseClient
              .from('notifications')
              .insert({
                user_id: investment.investor_id,
                notification_type: 'chat_room_invitation',
                title: 'Join Investor Chat',
                message: `You've been added to the investor chat room. Connect with other investors and participate in governance decisions.`,
                action_url: `/chat/${chatRoomId}`,
              });
          }

          // Create notification for successful investment
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: investment.investor_id,
              notification_type: 'investment_confirmed',
              title: 'Investment Confirmed',
              message: `Your investment of ₦${amount.toLocaleString()} has been confirmed. You received ${investment.tokens_requested.toLocaleString()} tokens.`,
              action_url: `/portfolio`,
            });
        }

        break;
      case "transfer.success":
        console.log("Transfer successful:", event.data);
        // Handle transfer success (e.g., update wallet balances)
        break;
      case "refund.successful":
        console.log("Refund successful:", event.data);
        // Handle refund success
        break;
      // Add other event handlers as needed
      default:
        console.log(`Unhandled Paystack event type: ${event.event}`);
        break;
    }

    return new Response(JSON.stringify({ success: true, message: "Webhook processed." }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error processing Paystack webhook:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message, message: "Failed to process webhook." }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
