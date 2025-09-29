import { supabase } from "@/integrations/supabase/client";
import { KYC_LEVELS, KYCLevel } from "@/types/kyc";

// services/kycGuard.ts
export async function checkKYCRequirement(
  userId: string,
  investmentAmount: number
): Promise<{
  allowed: boolean;
  requiredLevel: KYCLevel;
  currentLevel: KYCLevel;
  message: string;
}> {
  const { data: kyc } = await supabase
    .from("kyc_verifications")
    .select("status, kyc_level, investment_limit_ngn, expires_at")
    .eq("user_id", userId)
    .single();

  // No KYC at all
  if (!kyc || kyc.status !== "approved") {
    return {
      allowed: false,
      requiredLevel: "tier_1",
      currentLevel: "tier_1",
      message: "Please complete KYC verification to invest",
    };
  }

  // KYC expired
  if (kyc.expires_at && new Date(kyc.expires_at) < new Date()) {
    return {
      allowed: false,
      requiredLevel: kyc.kyc_level as KYCLevel,
      currentLevel: "tier_1",
      message: "Your KYC verification has expired. Please reverify",
    };
  }

  // Check investment limit
  if (investmentAmount > (kyc.investment_limit_ngn || 0)) {
    const requiredLevel = getRequiredKYCLevel(investmentAmount);
    return {
      allowed: false,
      requiredLevel,
      currentLevel: kyc.kyc_level as KYCLevel,
      message: `This investment requires ${requiredLevel} KYC. Your current limit is ₦${kyc.investment_limit_ngn?.toLocaleString()}`,
    };
  }

  return {
    allowed: true,
    requiredLevel: kyc.kyc_level as KYCLevel,
    currentLevel: kyc.kyc_level as KYCLevel,
    message: "KYC verified",
  };
}

function getRequiredKYCLevel(amount: number): KYCLevel {
  if (amount <= KYC_LEVELS.basic.maxInvestment) return "tier_1";
  if (amount <= KYC_LEVELS.intermediate.maxInvestment) return "tier_2";
  return "tier_3";
}
