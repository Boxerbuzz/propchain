// types/kyc.ts
export type KYCLevel = "tier_1" | "tier_2" | "tier_3";
export type KYCStatus =
  | "not_started"
  | "pending"
  | "approved"
  | "rejected"
  | "expired";

export const KYC_LEVELS = {
  none: {
    maxInvestment: 0,
    requirements: [],
  },
  basic: {
    maxInvestment: 1_000_000, // ₦1M
    requirements: ["BVN", "Phone verification"],
  },
  intermediate: {
    maxInvestment: 10_000_000, // ₦10M
    requirements: ["NIN/Drivers License", "Selfie", "Proof of address"],
  },
  advanced: {
    maxInvestment: 100_000_000, // ₦100M
    requirements: [
      "Passport/Voters card",
      "Bank statement",
      "Utility bill",
      "Enhanced due diligence",
    ],
  },
} as const;
