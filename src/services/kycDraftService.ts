import { supabase } from "@/integrations/supabase/client";

export interface KYCDraftData {
  documentType?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  documentNumber?: string;
}

export interface KYCDraft {
  id: string;
  user_id: string;
  current_step: string;
  completed_steps: string[];
  form_data: KYCDraftData;
  document_image_url?: string;
  selfie_url?: string;
  proof_of_address_url?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

class KYCDraftService {
  /**
   * Get or create a KYC draft for a user
   */
  async getOrCreateDraft(userId: string): Promise<KYCDraft | null> {
    try {
      // Try to get existing draft
      const { data: existingDraft, error: fetchError } = await supabase
        .from("kyc_drafts")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (existingDraft && !fetchError) {
        console.log("📄 Found existing KYC draft:", existingDraft.id);
        return existingDraft as KYCDraft;
      }

      // Create new draft if none exists
      const { data: newDraft, error: createError } = await supabase
        .from("kyc_drafts")
        .insert({
          user_id: userId,
          current_step: "document_type",
          completed_steps: [],
          form_data: {},
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ Error creating KYC draft:", createError);
        return null;
      }

      console.log("✅ Created new KYC draft:", newDraft.id);
      return newDraft as KYCDraft;
    } catch (error) {
      console.error("💥 Error in getOrCreateDraft:", error);
      return null;
    }
  }

  /**
   * Update draft form data
   */
  async updateDraftFormData(
    userId: string,
    formData: Partial<KYCDraftData>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("kyc_drafts")
        .update({
          form_data: formData,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error("❌ Error updating draft form data:", error);
        return false;
      }

      console.log("✅ Updated draft form data");
      return true;
    } catch (error) {
      console.error("💥 Error updating draft form data:", error);
      return false;
    }
  }

  /**
   * Update draft step progress
   */
  async updateDraftStep(
    userId: string,
    currentStep: string,
    completedSteps: string[]
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("kyc_drafts")
        .update({
          current_step: currentStep,
          completed_steps: completedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error("❌ Error updating draft step:", error);
        return false;
      }

      console.log("✅ Updated draft step:", currentStep);
      return true;
    } catch (error) {
      console.error("💥 Error updating draft step:", error);
      return false;
    }
  }

  /**
   * Update draft file URLs
   */
  async updateDraftFileUrls(
    userId: string,
    fileUrls: {
      document_image_url?: string;
      selfie_url?: string;
      proof_of_address_url?: string;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("kyc_drafts")
        .update({
          ...fileUrls,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error("❌ Error updating draft file URLs:", error);
        return false;
      }

      console.log("✅ Updated draft file URLs");
      return true;
    } catch (error) {
      console.error("💥 Error updating draft file URLs:", error);
      return false;
    }
  }

  /**
   * Complete a step and move to next
   */
  async completeStep(
    userId: string,
    stepName: string,
    nextStep: string,
    stepData?: Partial<KYCDraftData>,
    fileUrl?: { key: string; url: string }
  ): Promise<boolean> {
    try {
      // Get current draft
      const draft = await this.getOrCreateDraft(userId);
      if (!draft) return false;

      // Update completed steps
      const completedSteps = [...draft.completed_steps];
      if (!completedSteps.includes(stepName)) {
        completedSteps.push(stepName);
      }

      // Prepare update data
      const updateData: any = {
        current_step: nextStep,
        completed_steps: completedSteps,
        updated_at: new Date().toISOString(),
      };

      // Add form data if provided
      if (stepData) {
        updateData.form_data = { ...draft.form_data, ...stepData };
      }

      // Add file URL if provided
      if (fileUrl) {
        updateData[fileUrl.key] = fileUrl.url;
      }

      const { error } = await supabase
        .from("kyc_drafts")
        .update(updateData)
        .eq("user_id", userId);

      if (error) {
        console.error("❌ Error completing step:", error);
        return false;
      }

      console.log(`✅ Completed step: ${stepName} → ${nextStep}`);
      return true;
    } catch (error) {
      console.error("💥 Error completing step:", error);
      return false;
    }
  }

  /**
   * Get draft by user ID
   */
  async getDraft(userId: string): Promise<KYCDraft | null> {
    try {
      const { data, error } = await supabase
        .from("kyc_drafts")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("❌ Error fetching draft:", error);
        return null;
      }

      return data as KYCDraft;
    } catch (error) {
      console.error("💥 Error fetching draft:", error);
      return null;
    }
  }

  /**
   * Delete draft after successful KYC submission
   */
  async deleteDraft(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("kyc_drafts")
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error("❌ Error deleting draft:", error);
        return false;
      }

      console.log("✅ Deleted KYC draft");
      return true;
    } catch (error) {
      console.error("💥 Error deleting draft:", error);
      return false;
    }
  }

  /**
   * Check if user has a draft in progress
   */
  async hasDraftInProgress(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("kyc_drafts")
        .select("id")
        .eq("user_id", userId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }
}

export const kycDraftService = new KYCDraftService();
