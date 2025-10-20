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
    const currentStatus = record.status;

    console.log(
      `[KYC-WEBHOOK] 🔄 Processing for user ${userId}, KYC ID: ${kycId}, Status: ${currentStatus}`
    );

    // Only process records that are in "pending" status
    if (currentStatus !== "pending") {
      console.log(
        `[KYC-WEBHOOK] ⏭️ Skipping processing - KYC record ${kycId} is not in pending status (current: ${currentStatus})`
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: `KYC record ${kycId} skipped - not in pending status`,
          kycId,
          userId,
          status: currentStatus,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Simulate ID validation process
    const validationResult = await simulateIDValidation(record);
    console.log("[KYC-WEBHOOK] ✅ Validation result:", JSON.stringify(validationResult, null, 2));
    console.log("[KYC-WEBHOOK] 🔍 isValid flag:", validationResult.isValid);

    if (validationResult.isValid) {
      console.log("[KYC-WEBHOOK] ✅ Proceeding with APPROVAL");

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

          // Add provider and verification details
          provider: validationResult.provider,
          provider_reference_id: validationResult.providerReferenceId,
          provider_response: validationResult.providerResponse,

          // Set ID expiry date if ID type is provided
          id_expiry_date: record.id_type ? generateRandomExpiryDate() : null,

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

      // Update user table with KYC verification results
      const { error: userError } = await supabaseClient
        .from("users")
        .update({
          kyc_status: "verified",
          kyc_level: validationResult.kycLevel,
          // Copy personal information from KYC verification
          date_of_birth: record.date_of_birth || generateRandomDateOfBirth(),
          nationality: record.nationality || "Nigeria",
          state_of_residence: record.state || null,
          email_verified_at: new Date().toISOString(),
          phone_verified_at: new Date().toISOString(),
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
      console.log("[KYC-WEBHOOK] ❌ Proceeding with REJECTION");
      console.log("[KYC-WEBHOOK] ❌ Rejection reason:", validationResult.rejectionReason);
      
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

  // Mock validation logic (100% approval rate for testing)
  const isValid = true; // Always approve for testing

  if (isValid) {
    // Mock KYC level determination
    const kycLevels = ["tier_1", "tier_2", "tier_3"];
    const randomLevel = kycLevels[
      Math.floor(Math.random() * kycLevels.length)
    ] as "tier_1" | "tier_2" | "tier_3";

    // Mock investment limits based on KYC level
    const investmentLimits = {
      tier_1: 1000000, // 1M NGN
      tier_2: 10000000, // 10M NGN
      tier_3: 100000000, // 100M NGN
    };

    const investmentLimit = investmentLimits[randomLevel];
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Expires in 1 year

    // Randomly select verification provider
    const providers = [
      "dojah",
      "smile_id",
      "youverify",
      "identity_pass",
      "seamfix",
    ];
    const selectedProvider =
      providers[Math.floor(Math.random() * providers.length)];
    const providerReferenceId = generateProviderReferenceId(selectedProvider);

    return {
      isValid: true,
      kycLevel: randomLevel,
      investmentLimit,
      expiresAt: expiresAt.toISOString(),
      pepCheck: true, // 100% pass PEP check for testing
      sanctionCheck: true, // 100% pass sanction check for testing
      adverseMediaCheck: true, // 100% pass adverse media check for testing
      provider: selectedProvider,
      providerReferenceId: providerReferenceId,
      providerResponse: {
        verification_id: providerReferenceId,
        status: "verified",
        confidence_score: Math.floor(Math.random() * 20) + 80, // 80-100%
        document_type: record.id_type || "unknown",
        document_number: record.id_number || "N/A",
        verification_timestamp: new Date().toISOString(),
        provider: selectedProvider,
        checks_performed: [
          "document_authenticity",
          "face_match",
          "data_extraction",
        ],
        risk_score: Math.floor(Math.random() * 10) + 1, // 1-10 (low risk)
      },
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

/**
 * Generate a random date of birth (age between 18-65)
 */
function generateRandomDateOfBirth(): string {
  const currentYear = new Date().getFullYear();
  const minAge = 18;
  const maxAge = 65;

  const randomAge = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  const birthYear = currentYear - randomAge;

  // Random month (1-12)
  const month = Math.floor(Math.random() * 12) + 1;

  // Random day (1-28 to avoid month-specific issues)
  const day = Math.floor(Math.random() * 28) + 1;

  const dateOfBirth = new Date(birthYear, month - 1, day);
  return dateOfBirth.toISOString().split("T")[0]; // Return YYYY-MM-DD format
}

/**
 * Generate a provider-specific reference ID
 */
function generateProviderReferenceId(provider: string): string {
  const randomNumber = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");

  switch (provider) {
    case "dojah":
      return `DJH-${randomNumber}`;
    case "smile_id":
      return `SMI-${randomNumber}`;
    case "youverify":
      return `YV-${randomNumber}`;
    case "identity_pass":
      return `IDP-${randomNumber}`;
    case "seamfix":
      return `SFX-${randomNumber}`;
    default:
      return `MOCK-${randomNumber}`;
  }
}

/**
 * Generate a random ID expiry date (1-10 years from now)
 */
function generateRandomExpiryDate(): string {
  const currentDate = new Date();
  const yearsToAdd = Math.floor(Math.random() * 10) + 1; // 1-10 years
  const expiryDate = new Date(
    currentDate.getFullYear() + yearsToAdd,
    currentDate.getMonth(),
    currentDate.getDate()
  );
  return expiryDate.toISOString().split("T")[0]; // Return YYYY-MM-DD format
}
