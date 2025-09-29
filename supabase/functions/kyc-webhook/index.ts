import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("[KYC-WEBHOOK] 🔔 Webhook received:", req.method);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse the webhook payload
    const payload = await req.json();
    console.log("[KYC-WEBHOOK] 📦 Payload:", JSON.stringify(payload, null, 2));

    // Extract KYC record data
    const { record } = payload;
    const kycId = record.id;
    const userId = record.user_id;

    console.log(
      `[KYC-WEBHOOK] 🔄 Processing for user ${userId}, KYC ID: ${kycId}`
    );

    // Simulate ID validation process
    const validationResult = await simulateIDValidation(record);
    console.log("[KYC-WEBHOOK] ✅ Validation result:", validationResult);

    if (validationResult.isValid) {
      // Update KYC verification to approved
      const { error: kycError } = await supabaseClient
        .from("kyc_verifications")
        .update({
          status: "approved",
          kyc_level: validationResult.kycLevel,
          investment_limit_ngn: validationResult.investmentLimit,
          verified_at: new Date().toISOString(),
          verified_by: null, // Set to null since 'webhook-system' is not a valid UUID
          expires_at: validationResult.expiresAt,
          pep_check: validationResult.pepCheck,
          sanction_check: validationResult.sanctionCheck,
          adverse_media_check: validationResult.adverseMediaCheck,
          updated_at: new Date().toISOString(),
        })
        .eq("id", kycId);

      if (kycError) {
        console.error(
          "[KYC-WEBHOOK] ❌ Error updating KYC verification:",
          kycError
        );
        throw new Error(
          `Failed to update KYC verification: ${kycError.message}`
        );
      }

      // Update user table
      const { error: userError } = await supabaseClient
        .from("users")
        .update({
          kyc_status: "verified",
          kyc_level: validationResult.kycLevel,
        })
        .eq("id", userId);

      if (userError) {
        console.error("[KYC-WEBHOOK] ❌ Error updating user:", userError);
        throw new Error(`Failed to update user: ${userError.message}`);
      }

      // Create success notification
      await createNotification(supabaseClient, userId, {
        title: "KYC Verification Approved! 🎉",
        message: `Congratulations! Your KYC verification has been approved. You now have ${validationResult.kycLevel?.toUpperCase()} level access with an investment limit of ₦${validationResult?.investmentLimit?.toLocaleString()}.`,
        type: "kyc_status",
        priority: "high",
      });

      console.log(`[KYC-WEBHOOK] ✅ KYC approved for user ${userId}`);
    } else {
      // Update KYC verification to rejected
      const { error: kycError } = await supabaseClient
        .from("kyc_verifications")
        .update({
          status: "rejected",
          verified_at: new Date().toISOString(),
          verified_by: null, // Set to null since 'webhook-system' is not a valid UUID
          rejection_reason: validationResult.rejectionReason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", kycId);

      if (kycError) {
        console.error(
          "[KYC-WEBHOOK] ❌ Error updating KYC verification:",
          kycError
        );
        throw new Error(
          `Failed to update KYC verification: ${kycError.message}`
        );
      }

      // Update user table
      const { error: userError } = await supabaseClient
        .from("users")
        .update({
          kyc_status: "rejected",
        })
        .eq("id", userId);

      if (userError) {
        console.error("[KYC-WEBHOOK] ❌ Error updating user:", userError);
        throw new Error(`Failed to update user: ${userError.message}`);
      }

      // Create rejection notification
      await createNotification(supabaseClient, userId, {
        title: "KYC Verification Rejected",
        message: `Your KYC verification was rejected. ${validationResult.rejectionReason} Please resubmit your documents to continue.`,
        type: "kyc_status",
        priority: "high",
      });

      console.log(
        `[KYC-WEBHOOK] 🚫 KYC rejected for user ${userId}: ${validationResult.rejectionReason}`
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "KYC webhook processed successfully",
        kycId,
        userId,
        status: validationResult.isValid ? "approved" : "rejected",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[KYC-WEBHOOK] 💥 Webhook error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

/**
 * Simulate ID validation process
 * In a real implementation, this would call external verification services
 */
async function simulateIDValidation(record: any) {
  console.log(
    "[KYC-WEBHOOK] 🔍 Simulating ID validation for:",
    record.first_name,
    record.last_name
  );

  // Simulate processing delay
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 2000)
  );

  // Mock validation logic (85% approval rate)
  const isValid = Math.random() > 0.15;

  if (isValid) {
    // Mock KYC level determination
    const kycLevels = ["tier_1", "tier_2", "tier_3"];
    const randomLevel = kycLevels[
      Math.floor(Math.random() * kycLevels.length)
    ] as "tier_1" | "tier_2" | "tier_3";

    // Mock investment limits based on KYC level
    const investmentLimits = {
      tier_1: 1000000, // 1M NGN
      tier_2: 5000000, // 5M NGN
      tier_3: 10000000, // 10M NGN
    };

    const investmentLimit = investmentLimits[randomLevel];
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Expires in 1 year

    return {
      isValid: true,
      kycLevel: randomLevel,
      investmentLimit,
      expiresAt: expiresAt.toISOString(),
      pepCheck: Math.random() > 0.1, // 90% pass PEP check
      sanctionCheck: Math.random() > 0.05, // 95% pass sanction check
      adverseMediaCheck: Math.random() > 0.2, // 80% pass adverse media check
    };
  } else {
    // Mock rejection reasons
    const rejectionReasons = [
      "Document image quality is too low. Please ensure all text is clearly visible.",
      "Document appears to be expired or invalid.",
      "Personal information does not match the provided documents.",
      "Document type is not accepted for verification.",
      "Unable to verify document authenticity.",
    ];

    const randomReason =
      rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)];

    return {
      isValid: false,
      rejectionReason: randomReason,
    };
  }
}

/**
 * Create notification for user
 */
async function createNotification(
  supabaseClient: any,
  userId: string,
  notification: {
    title: string;
    message: string;
    type: string;
    priority: string;
  }
) {
  try {
    const { error } = await supabaseClient.from("notifications").insert({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      notification_type: notification.type,
      priority: notification.priority,
      read_at: null,
    });

    if (error) {
      console.error("[KYC-WEBHOOK] ❌ Error creating notification:", error);
    } else {
      console.log("[KYC-WEBHOOK] ✅ Notification created successfully");
    }
  } catch (error) {
    console.error("[KYC-WEBHOOK] 💥 Error creating notification:", error);
  }
}
