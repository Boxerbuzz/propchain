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
    const { email, amount, reference } = await req.json();

    if (!email || !amount || !reference) {
      return new Response(JSON.stringify({ error: "Missing email, amount, or reference" }), { status: 400 });
    }

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount, // in kobo
        reference,
      }),
    });

    const data = await paystackResponse.json();

    if (!paystackResponse.ok) {
      throw new Error(data.message || "Failed to initialize payment with Paystack.");
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { authorization_url: data.data.authorization_url, reference: data.data.reference },
        message: "Paystack payment initialized successfully.",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("Error initializing Paystack payment:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message, message: "Failed to initialize Paystack payment." }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
