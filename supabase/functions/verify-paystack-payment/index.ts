import { serve } from "https://deno.land/std@0.178.0/http/server.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("Paystack secret key must be set in Supabase secrets.");
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { reference } = await req.json();

    if (!reference) {
      return new Response(JSON.stringify({ error: "Missing reference" }), { status: 400 });
    }

    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await paystackResponse.json();

    if (!paystackResponse.ok) {
      throw new Error(data.message || "Failed to verify payment with Paystack.");
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          status: data.data.status,
          amount: data.data.amount, // in kobo
          currency: data.data.currency,
        },
        message: "Paystack payment verified successfully.",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("Error verifying Paystack payment:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message, message: "Failed to verify Paystack payment." }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
