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

        // TODO: Update tokenization table (current_raise, tokens_sold, investor_count)
        // TODO: Update or create token_holdings for the investor
        // TODO: Potentially trigger notifications to the user

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
