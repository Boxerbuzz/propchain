export class PaymentGatewayService {
  private paystackSecretKey: string;
  private supabaseEdgeFunctionUrl: string;

  constructor() {
    const key = import.meta.env.VITE_PAYSTACK_SECRET_KEY;
    if (!key) {
      throw new Error("Paystack secret key must be set in the environment variables.");
    }
    this.paystackSecretKey = key;

    const url = import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_URL;
    if (!url) {
      throw new Error("Supabase Edge Function URL must be set in the environment variables.");
    }
    this.supabaseEdgeFunctionUrl = url;
  }

  /**
   * Initiates a payment with Paystack by calling a Supabase Edge Function.
   * @param email User's email.
   * @param amount Amount in kobo.
   * @param reference Unique transaction reference.
   * @returns A Paystack authorization URL.
   */
  async initializePayment(email: string, amount: number, reference: string): Promise<string> {
    const response = await fetch(`${this.supabaseEdgeFunctionUrl}/initialize-paystack-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        amount,
        reference,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to initialize payment via Edge Function.");
    }
    return result.data.authorization_url;
  }

  /**
   * Verifies a Paystack payment by calling a Supabase Edge Function.
   * @param reference The transaction reference from Paystack.
   * @returns Payment verification status and details.
   */
  async verifyPayment(reference: string): Promise<{ status: string; amount: number; currency: string }> {
    const response = await fetch(`${this.supabaseEdgeFunctionUrl}/verify-paystack-payment`, {
      method: "POST", // Using POST as the edge function expects a JSON body
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to verify payment via Edge Function.");
    }
    return result.data;
  }
}
