import { supabase } from "@/integrations/supabase/client";
import { KYC_LEVELS, KYCLevel } from "@/types/kyc";

export interface KYCSubmissionData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nationality?: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  documentType: "national_id" | "passport" | "drivers_license";
  documentNumber: string;
  documentImages: string[]; // Array of image URLs
  selfieImage: string; // Selfie image URL
  proofOfAddressUrl?: string; // Proof of address document URL
}

export interface KYCVerificationResult {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  kyc_level: KYCLevel;
  investment_limit_ngn: number;
  expires_at: string | null;
  created_at: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string | null;
  date_of_birth: string;
  address: string;
  city: string;
  id_document_front_url: string;
  id_document_back_url: string;
  selfie_url: string;
  verified_by: string | null;
  rejection_reason: string | null;
  adverse_media_check: boolean;
}

class KYCService {
  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(
    file: File,
    userId: string,
    fileName: string
  ): Promise<string> {
    try {
      console.log(`📤 Uploading file ${fileName} for user ${userId}`);

      // Create file path: {userId}/{fileName} (no bucket prefix needed)
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("kyc-documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true, // Overwrite if file exists
        });

      if (error) {
        console.error("❌ File upload error:", error);
        throw new Error(`File upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("kyc-documents")
        .getPublicUrl(filePath);

      console.log("✅ File uploaded successfully:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error: any) {
      console.error("💥 File upload failed:", error);
      throw error;
    }
  }

  /**
   * Upload multiple files for KYC verification
   */
  async uploadKYCFiles(
    files: { file: File; type: "id_front" | "id_back" | "selfie" }[],
    userId: string
  ): Promise<{ [key: string]: string }> {
    try {
      console.log(`📤 Uploading ${files.length} files for user ${userId}`);

      const uploadPromises = files.map(async ({ file, type }) => {
        const timestamp = Date.now();
        const fileExtension = file.name.split(".").pop();
        const fileName = `${type}-${timestamp}.${fileExtension}`;

        const url = await this.uploadFile(file, userId, fileName);
        return { type, url };
      });

      const results = await Promise.all(uploadPromises);

      // Convert array to object
      const fileUrls: { [key: string]: string } = {};
      results.forEach(({ type, url }) => {
        fileUrls[type] = url;
      });

      console.log("✅ All files uploaded successfully:", fileUrls);
      return fileUrls;
    } catch (error: any) {
      console.error("💥 Multiple file upload failed:", error);
      throw error;
    }
  }

  /**
   * Submit KYC verification with mock processing
   */
  async submitKYCVerification(data: KYCSubmissionData): Promise<{
    success: boolean;
    verificationId?: string;
    error?: string;
  }> {
    try {
      console.log("🚀 Starting KYC submission for user:", data.userId);

      // Check for existing rejected records and clean them up
      const { data: existingRejected, error: fetchError } = await supabase
        .from('kyc_verifications')
        .select('id, rejection_reason, created_at')
        .eq('user_id', data.userId)
        .eq('status', 'rejected')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error("❌ Error checking existing records:", fetchError);
      }

      if (existingRejected) {
        console.log("🧹 Cleaning up old rejected record:", existingRejected.id);

        // Delete old rejected record
        const { error: deleteError } = await supabase
          .from('kyc_verifications')
          .delete()
          .eq('id', existingRejected.id);

        if (deleteError) {
          console.error("❌ Error deleting old record:", deleteError);
        } else {
          console.log("✅ Old rejected record deleted");
        }

        // Delete draft data if exists
        const { error: draftDeleteError } = await supabase
          .from('kyc_drafts')
          .delete()
          .eq('user_id', data.userId);

        if (draftDeleteError) {
          console.error("❌ Error deleting draft:", draftDeleteError);
        }

        // Log to activity_logs
        const { error: logError } = await supabase
          .from('activity_logs')
          .insert({
            user_id: data.userId,
            activity_type: 'kyc_resubmission',
            activity_category: 'kyc',
            description: `User resubmitted KYC after rejection: ${existingRejected.rejection_reason || 'No reason provided'}`,
            metadata: {
              previous_rejection_reason: existingRejected.rejection_reason,
              previous_submission_date: existingRejected.created_at,
              resubmission_date: new Date().toISOString(),
              previous_kyc_id: existingRejected.id,
            },
          });

        if (logError) {
          console.error("❌ Error logging resubmission:", logError);
        } else {
          console.log("✅ Resubmission logged to activity_logs");
        }
      }

      // Create KYC verification record using actual schema columns
      const kycData = {
        user_id: data.userId,
        status: "pending" as const,
        kyc_level: "tier_1", // Default to tier_1, will be updated after processing
        investment_limit_ngn: KYC_LEVELS.basic.maxInvestment, // Default 1M NGN, will be updated after processing
        expires_at: null, // Will be set after approval

        // Personal information (from signup via AuthContext)
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phone || null,
        nationality: data.nationality || "Nigeria",
        date_of_birth: null,
        address: data.address.street,
        city: data.address.city,
        state: data.address.state,
        postal_code: data.address.postalCode,

        // Document information (using actual column names)
        id_type: data.documentType,
        id_number: data.documentNumber,
        id_document_front_url: data.documentImages[0] || null,
        id_document_back_url: null, // Will be added later if needed
        selfie_url: data.selfieImage || null,
        proof_of_address_url: data.proofOfAddressUrl || null,

        // Verification details
        verified_at: null,
        verified_by: null,
        rejection_reason: null,

        // Compliance checks (default to false)
        pep_check: false,
        sanction_check: false,
        adverse_media_check: false,
      };

      const { data: kycRecord, error: kycError } = await supabase
        .from("kyc_verifications")
        .insert(kycData)
        .select()
        .single();

      if (kycError) {
        console.error("❌ Error creating KYC record:", kycError);
        return { success: false, error: kycError.message };
      }

      console.log("✅ KYC record created:", kycRecord.id);

      // Update user table with KYC status and missing personal data
      const { error: userError } = await supabase
        .from("users")
        .update({
          kyc_status: "pending",
          date_of_birth: data.dateOfBirth,
          nationality: data.nationality || "Nigeria",
          state_of_residence: data.address.state,
        })
        .eq("id", data.userId);

      if (userError) {
        console.error("❌ Error updating user record:", userError);
        return { success: false, error: userError.message };
      }

      console.log("✅ User record updated");

      // Mock processing - simulate approval/rejection after a delay
      this.simulateKYCProcessing(kycRecord.id, data);

      return { success: true, verificationId: kycRecord.id };
    } catch (error: any) {
      console.error("💥 KYC submission failed:", error);
      return {
        success: false,
        error: error.message || "KYC submission failed",
      };
    }
  }

  /**
   * Simulate KYC processing with mock data
   */
  private async simulateKYCProcessing(
    kycId: string,
    submissionData: KYCSubmissionData
  ) {
    // Simulate processing delay (2-5 seconds)
    const delay = Math.random() * 3000 + 2000;

    setTimeout(async () => {
      try {
        console.log("🔄 Processing KYC verification:", kycId);

        // Mock approval/rejection logic (80% approval rate)
        const isApproved = Math.random() > 0.2;

        if (isApproved) {
          await this.approveKYC(kycId, submissionData);
        } else {
          await this.rejectKYC(kycId, submissionData);
        }
      } catch (error) {
        console.error("❌ Error in KYC processing simulation:", error);
      }
    }, delay);
  }

  /**
   * Approve KYC verification with mock data
   */
  private async approveKYC(kycId: string, submissionData: KYCSubmissionData) {
    try {
      console.log("✅ Approving KYC:", kycId);

      // Mock KYC level determination based on random factors
      const kycLevels: KYCLevel[] = ["tier_1", "tier_2", "tier_3"];
      const randomLevel =
        kycLevels[Math.floor(Math.random() * kycLevels.length)];

      // Mock investment limits based on KYC level
      const investmentLimits = {
        tier_1: 1000000, // 1M NGN
        tier_2: 5000000, // 5M NGN
        tier_3: 10000000, // 10M NGN
      };

      const investmentLimit = investmentLimits[randomLevel];
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Expires in 1 year

      // Update KYC verification
      const { error: kycError } = await supabase
        .from("kyc_verifications")
        .update({
          status: "approved",
          kyc_level: randomLevel,
          investment_limit_ngn: investmentLimit,
          expires_at: expiresAt.toISOString(),
          verified_at: new Date().toISOString(),
          verified_by: null, // Set to null since 'system' is not a valid UUID
          rejection_reason: null,
        })
        .eq("id", kycId);

      if (kycError) {
        console.error("❌ Error approving KYC:", kycError);
        return;
      }

      // Update user table
      const { error: userError } = await supabase
        .from("users")
        .update({
          kyc_status: "verified",
          kyc_level: randomLevel,
        })
        .eq("id", submissionData.userId);

      if (userError) {
        console.error("❌ Error updating user after approval:", userError);
        return;
      }

      console.log(
        `🎉 KYC approved for user ${submissionData.userId} with level ${randomLevel}`
      );

      // Create notification for user
      await this.createKYCNotification(
        submissionData.userId,
        "approved",
        randomLevel,
        investmentLimit
      );
    } catch (error) {
      console.error("💥 Error in KYC approval:", error);
    }
  }

  /**
   * Reject KYC verification with mock reasons
   */
  private async rejectKYC(kycId: string, submissionData: KYCSubmissionData) {
    try {
      console.log("❌ Rejecting KYC:", kycId);

      const rejectionReasons = [
        "Document image quality is too low. Please resubmit with clearer photos.",
        "Document information does not match personal details provided.",
        "Selfie verification failed. Please ensure your face is clearly visible.",
        "Document appears to be expired or invalid.",
        "Address verification failed. Please provide a valid residential address.",
      ];

      const randomReason =
        rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)];

      // Update KYC verification
      const { error: kycError } = await supabase
        .from("kyc_verifications")
        .update({
          status: "rejected",
          verified_at: new Date().toISOString(),
          verified_by: null, // Set to null since 'system' is not a valid UUID
          rejection_reason: randomReason,
        })
        .eq("id", kycId);

      if (kycError) {
        console.error("❌ Error rejecting KYC:", kycError);
        return;
      }

      // Update user table
      const { error: userError } = await supabase
        .from("users")
        .update({
          kyc_status: "rejected",
        })
        .eq("id", submissionData.userId);

      if (userError) {
        console.error("❌ Error updating user after rejection:", userError);
        return;
      }

      console.log(
        `🚫 KYC rejected for user ${submissionData.userId}: ${randomReason}`
      );

      // Create notification for user
      await this.createKYCNotification(
        submissionData.userId,
        "rejected",
        null,
        null,
        randomReason
      );
    } catch (error) {
      console.error("💥 Error in KYC rejection:", error);
    }
  }

  /**
   * Create notification for KYC status change
   */
  private async createKYCNotification(
    userId: string,
    status: "approved" | "rejected",
    kycLevel?: KYCLevel | null,
    investmentLimit?: number | null,
    rejectionReason?: string | null
  ) {
    try {
      let title: string;
      let message: string;

      if (status === "approved") {
        title = "KYC Verification Approved! 🎉";
        message = `Congratulations! Your KYC verification has been approved. You now have ${kycLevel?.toUpperCase()} level access with an investment limit of ₦${investmentLimit?.toLocaleString()}.`;
      } else {
        title = "KYC Verification Rejected";
        message = `Your KYC verification was rejected. ${rejectionReason} Please resubmit your documents to continue.`;
      }

      const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        title,
        message,
        notification_type: "kyc_status",
        priority: "high",
        read_at: null,
      });

      if (error) {
        console.error("❌ Error creating KYC notification:", error);
      } else {
        console.log("✅ KYC notification created");
      }
    } catch (error) {
      console.error("💥 Error creating notification:", error);
    }
  }

  /**
   * Get KYC verification status for a user
   */
  async getKYCStatus(userId: string): Promise<KYCVerificationResult | null> {
    try {
      const { data, error } = await supabase
        .from("kyc_verifications")
        .select("*")
        .eq("user_id", userId)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching KYC status:", error);
        return null;
      }

      return data as KYCVerificationResult | null;
    } catch (error) {
      console.error("Error in getKYCStatus:", error);
      return null;
    }
  }

  /**
   * Manually approve/reject KYC verification (admin function)
   */
  async reviewKYC(
    kycId: string,
    decision: "approved" | "rejected",
    reviewerId: string,
    rejectionReason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the KYC record first
      const { data: kycRecord, error: fetchError } = await supabase
        .from("kyc_verifications")
        .select("*")
        .eq("id", kycId)
        .single();

      if (fetchError || !kycRecord) {
        return { success: false, error: "KYC record not found" };
      }

      const updateData: any = {
        status: decision,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
      };

      if (decision === "approved") {
        // Mock KYC level determination
        const kycLevels: KYCLevel[] = ["tier_1", "tier_2", "tier_3"];
        const randomLevel =
          kycLevels[Math.floor(Math.random() * kycLevels.length)];

        const investmentLimits = {
          tier_1: 1000000,
          tier_2: 5000000,
          tier_3: 10000000,
        };

        updateData.kyc_level = randomLevel;
        updateData.investment_limit_ngn = investmentLimits[randomLevel];
        updateData.expires_at = new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(); // 1 year
        updateData.rejection_reason = null;
      } else {
        updateData.rejection_reason =
          rejectionReason || "Manual rejection by admin";
      }

      // Update KYC verification
      const { error: kycError } = await supabase
        .from("kyc_verifications")
        .update(updateData)
        .eq("id", kycId);

      if (kycError) {
        return { success: false, error: kycError.message };
      }

      // Update user table
      const userUpdateData: any = {
        kyc_status: decision === "approved" ? "verified" : "rejected",
      };

      if (decision === "approved") {
        userUpdateData.kyc_level = updateData.kyc_level;
      }

      const { error: userError } = await supabase
        .from("users")
        .update(userUpdateData)
        .eq("id", kycRecord.user_id);

      if (userError) {
        return { success: false, error: userError.message };
      }

      // Create notification
      await this.createKYCNotification(
        kycRecord.user_id,
        decision,
        updateData.kyc_level,
        updateData.investment_limit_ngn,
        updateData.rejection_reason
      );

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const kycService = new KYCService();
