// schemas/index.ts
import { z } from "zod";

// Base schemas
export const LocationSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
  landmarks: z.array(z.string()).optional(),
});

// User schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email("Invalid email format"),
  phone: z.string().nullable(), // More flexible phone validation
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z
    .string()
    .transform((str) => str ? new Date(str) : null)
    .nullable(),
  nationality: z.string().default("Nigeria"),
  state_of_residence: z.string().nullable(),
  occupation: z.string().nullable(),
  annual_income: z
    .number()
    .positive("Annual income must be positive")
    .nullable(),
  investment_experience: z.enum(["beginner", "intermediate", "advanced"]),
  hedera_account_id: z
    .string()
    .regex(/^0\.0\.\d+$/, "Invalid Hedera account ID")
    .nullable(),
  kyc_status: z
    .enum(["pending", "verified", "rejected", "expired"])
    .default("pending"),
  kyc_level: z.enum(["tier_1", "tier_2", "tier_3"]).default("tier_1"),
  account_status: z.enum(["active", "suspended", "closed"]).default("active"),
  wallet_type: z.enum(["custodial", "external", "hybrid"]).nullable(),
  referral_code: z.string().nullable(),
  referred_by: z.string().uuid().nullable(),
  email_verified_at: z.date().nullable(),
  phone_verified_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Property schemas
export const PropertySchema = z.object({
  id: z.string().uuid(),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title too long"),
  description: z.string().max(2000, "Description too long").nullable(),
  location: LocationSchema,
  property_type: z.enum([
    "residential",
    "commercial",
    "industrial",
    "land",
    "mixed_use",
  ]),
  property_subtype: z.string().nullable(),
  land_size: z.number().positive("Land size must be positive").nullable(),
  built_up_area: z.number().positive("Built-up area must be positive").nullable(),
  bedrooms: z.number().int().min(0, "Bedrooms cannot be negative").nullable(),
  bathrooms: z.number().int().min(0, "Bathrooms cannot be negative").nullable(),
  year_built: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear(), "Invalid year")
    .nullable(),
  condition: z
    .enum(["excellent", "good", "fair", "needs_renovation"])
    .nullable(),
  amenities: z.array(z.string()).nullable(),
  estimated_value: z.number().positive("Estimated value must be positive"),
  market_value: z.number().positive().nullable(),
  rental_income_monthly: z.number().positive().nullable(),
  rental_yield: z
    .number()
    .min(0)
    .max(100, "Yield cannot exceed 100%")
    .nullable(),
  owner_id: z.string().uuid(),
  property_manager_id: z.string().uuid().nullable(),
  hcs_topic_id: z.string().nullable(),
  hfs_file_ids: z.array(z.string()).nullable(),
  approval_status: z
    .enum(["pending", "approved", "rejected", "suspended"])
    .default("pending"),
  approved_by: z.string().uuid().nullable(),
  approved_at: z.date().nullable(),
  verification_score: z.number().int().min(0).max(100).default(0),
  listing_status: z
    .enum(["draft", "active", "sold", "withdrawn"])
    .default("draft"),
  featured: z.boolean().default(false),
  views_count: z.number().int().min(0).default(0),
  favorites_count: z.number().int().min(0).default(0),
  created_at: z.date(),
  updated_at: z.date(),
});

// Tokenization schemas
export const TokenizationSchema = z
  .object({
    id: z.string().uuid(),
    property_id: z.string().uuid(),
    token_id: z
      .string()
      .regex(/^0\.0\.\d+$/, "Invalid Hedera token ID")
      .nullable(),
    token_name: z.string().max(50, "Token name too long").nullable(),
    token_symbol: z.string().max(10, "Token symbol too long").nullable(),
    total_supply: z.number().int().positive("Total supply must be positive"),
    price_per_token: z.number().positive("Price per token must be positive"),
    min_investment: z.number().positive("Minimum investment must be positive"),
    max_investment: z.number().positive().nullable(),
    min_tokens_per_purchase: z.number().int().positive().default(1),
    max_tokens_per_purchase: z.number().int().positive().nullable(),
    investment_window_start: z.date(),
    investment_window_end: z.date(),
    minimum_raise: z.number().positive("Minimum raise must be positive"),
    target_raise: z.number().positive().nullable(),
    current_raise: z.number().min(0).default(0),
    tokens_sold: z.number().int().min(0).default(0),
    investor_count: z.number().int().min(0).default(0),
    expected_roi_annual: z
      .number()
      .min(0)
      .max(100, "ROI cannot exceed 100%")
      .nullable(),
    dividend_frequency: z.enum(["monthly", "quarterly", "annually"]).nullable(),
    management_fee_percentage: z
      .number()
      .min(0)
      .max(20, "Management fee too high")
      .default(2.5),
    platform_fee_percentage: z
      .number()
      .min(0)
      .max(10, "Platform fee too high")
      .default(1.0),
    status: z
      .enum([
        "draft",
        "upcoming",
        "active",
        "closed",
        "minting",
        "completed",
        "failed",
      ])
      .default("draft"),
    auto_refund: z.boolean().default(true),
    created_by: z.string().uuid(),
    approved_by: z.string().uuid().nullable(),
    approved_at: z.date().nullable(),
    minting_transaction_id: z.string().nullable(),
    minted_at: z.date().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
  })
  .refine((data) => data.investment_window_end > data.investment_window_start, {
    message: "Investment window end must be after start",
    path: ["investment_window_end"],
  })
  .refine(
    (data) => !data.max_investment || data.max_investment > data.min_investment,
    {
      message: "Maximum investment must be greater than minimum",
      path: ["max_investment"],
    }
  );

// Investment schemas
export const InvestmentSchema = z.object({
  id: z.string().uuid(),
  tokenization_id: z.string().uuid(),
  investor_id: z.string().uuid(),
  amount_ngn: z.number().positive("Investment amount must be positive"),
  amount_usd: z.number().positive().nullable(),
  exchange_rate: z.number().positive().nullable(),
  tokens_requested: z
    .number()
    .int()
    .positive("Tokens requested must be positive"),
  tokens_allocated: z.number().int().min(0).default(0),
  percentage_ownership: z.number().min(0).max(100).nullable(),
  paystack_reference: z.string().nullable(),
  payment_status: z
    .enum(["pending", "confirmed", "failed", "refunded"])
    .default("pending"),
  payment_method: z.enum(["paystack", "wallet", "bank_transfer"]).nullable(),
  payment_confirmed_at: z.date().nullable(),
  refund_processed_at: z.date().nullable(),
  refund_amount: z.number().positive().nullable(),
  investment_source: z.enum(["web", "mobile", "api"]).nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Chat schemas
export const ChatRoomSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid().nullable(),
  tokenization_id: z.string().uuid().nullable(),
  name: z
    .string()
    .min(1, "Room name is required")
    .max(100, "Room name too long"),
  description: z.string().max(500, "Description too long").nullable(),
  room_type: z
    .enum(["investment", "governance", "general", "support"])
    .default("investment"),
  is_public: z.boolean().default(false),
  max_participants: z.number().int().positive().nullable(),
  auto_join_investors: z.boolean().default(true),
  ai_assistant_enabled: z.boolean().default(true),
  moderation_enabled: z.boolean().default(true),
  created_by: z.string().uuid().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  room_id: z.string().uuid(),
  sender_id: z.string().uuid().nullable(),
  reply_to_id: z.string().uuid().nullable(),
  message_text: z.string().max(2000, "Message too long").nullable(),
  message_type: z
    .enum(["text", "system", "proposal", "vote", "announcement", "ai_response"])
    .default("text"),
  metadata: z.record(z.any()).nullable(),
  attachments: z.array(z.string().url()).nullable(),
  is_pinned: z.boolean().default(false),
  is_edited: z.boolean().default(false),
  edited_at: z.date().nullable(),
  reactions: z.record(z.array(z.string())).default({}),
  created_at: z.date(),
});

// Governance schemas
export const GovernanceProposalSchema = z
  .object({
    id: z.string().uuid(),
    property_id: z.string().uuid(),
    tokenization_id: z.string().uuid().nullable(),
    proposer_id: z.string().uuid(),
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(100, "Title too long"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description too long"),
    proposal_type: z.string().min(1, "Proposal type is required"),
    budget_ngn: z.number().positive().nullable(),
    budget_usd: z.number().positive().nullable(),
    supporting_documents: z.array(z.string().url()).nullable(),
    voting_start: z.date(),
    voting_end: z.date(),
    quorum_required: z
      .number()
      .min(1)
      .max(100, "Quorum cannot exceed 100%")
      .default(50),
    approval_threshold: z
      .number()
      .min(1)
      .max(100, "Threshold cannot exceed 100%")
      .default(60),
    status: z
      .enum(["draft", "active", "passed", "rejected", "executed", "expired"])
      .default("draft"),
    total_votes_cast: z.number().int().min(0).default(0),
    votes_for: z.number().int().min(0).default(0),
    votes_against: z.number().int().min(0).default(0),
    votes_abstain: z.number().int().min(0).default(0),
    execution_date: z.date().nullable(),
    execution_status: z
      .enum(["pending", "in_progress", "completed", "failed"])
      .nullable(),
    execution_notes: z.string().max(1000, "Execution notes too long").nullable(),
    hcs_record_id: z.string().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
  })
  .refine((data) => data.voting_end > data.voting_start, {
    message: "Voting end must be after voting start",
    path: ["voting_end"],
  });

export const VoteSchema = z.object({
  id: z.string().uuid(),
  proposal_id: z.string().uuid(),
  voter_id: z.string().uuid(),
  vote_choice: z.enum(["for", "against", "abstain"]),
  voting_power: z.number().int().positive("Voting power must be positive"),
  vote_weight: z.number().min(0).nullable(),
  vote_reason: z.string().max(500, "Vote reason too long").nullable(),
  vote_transaction_id: z.string().nullable(),
  cast_at: z.date(),
});

// Wallet schemas
export const WalletSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  wallet_type: z.enum(["custodial", "external", "hardware"]),
  wallet_name: z.string().max(50, "Wallet name too long").nullable(),
  hedera_account_id: z
    .string()
    .regex(/^0\.0\.\d+$/, "Invalid Hedera account ID")
    .nullable(),
  private_key_encrypted: z.string().nullable(),
  public_key: z.string().nullable(),
  balance_hbar: z.number().min(0).default(0),
  balance_ngn: z.number().min(0).default(0),
  balance_usd: z.number().min(0).default(0),
  is_primary: z.boolean().default(false),
  backup_completed: z.boolean().default(false),
  security_level: z.enum(["basic", "standard", "high"]).default("standard"),
  last_sync_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

// KYC schemas
export const KycRecordSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  id_type: z.enum(["nin", "drivers_license", "passport"]),
  id_number: z.string().min(5, "ID number too short").nullable(),
  selfie_url: z.string().url("Invalid selfie URL").nullable(),
  id_document_url: z.string().url("Invalid document URL").nullable(),
  verification_status: z
    .enum(["pending", "verified", "rejected"])
    .default("pending"),
  hcs_record_id: z.string().nullable(),
  created_at: z.date(),
});

// Form validation schemas
// Simplified SignUp Form - Better UX
export const SignUpFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(1, "Phone number is required"), // More flexible validation
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, { message: "You must agree to the terms" }),
    marketing: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const LoginFormSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const PropertyFormSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title too long"),
  description: z.string().max(2000, "Description too long").optional(),
  location: z.object({
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
  }),
  propertyType: z.enum([
    "residential",
    "commercial",
    "industrial",
    "land",
    "mixed_use",
  ]),
  propertySubtype: z.string().optional(),
  landSize: z.number().positive("Land size must be positive").optional(),
  builtUpArea: z.number().positive("Built-up area must be positive").optional(),
  bedrooms: z.number().int().min(0, "Bedrooms cannot be negative").optional(),
  bathrooms: z.number().int().min(0, "Bathrooms cannot be negative").optional(),
  yearBuilt: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),
  condition: z
    .enum(["excellent", "good", "fair", "needs_renovation"])
    .optional(),
  amenities: z.array(z.string()).optional(),
  estimatedValue: z.number().positive("Estimated value must be positive"),
  rentalIncomeMonthly: z.number().positive().optional(),
});

export const TokenizationFormSchema = z
  .object({
    totalSupply: z.number().int().positive("Total supply must be positive"),
    pricePerToken: z.number().positive("Price per token must be positive"),
    minInvestment: z.number().positive("Minimum investment must be positive"),
    maxInvestment: z.number().positive().optional(),
    investmentWindowStart: z
      .date()
      .min(new Date(), "Start date cannot be in past"),
    investmentWindowEnd: z.date(),
    minimumRaise: z.number().positive("Minimum raise must be positive"),
    targetRaise: z.number().positive().optional(),
    expectedRoiAnnual: z.number().min(0).max(100).optional(),
    dividendFrequency: z.enum(["monthly", "quarterly", "annually"]).optional(),
  })
  .refine((data) => data.investmentWindowEnd > data.investmentWindowStart, {
    message: "End date must be after start date",
    path: ["investmentWindowEnd"],
  })
  .refine(
    (data) => !data.maxInvestment || data.maxInvestment > data.minInvestment,
    {
      message: "Maximum investment must be greater than minimum",
      path: ["maxInvestment"],
    }
  );

// Simplified Investment Form - Less restrictive
export const InvestmentFormSchema = z.object({
  amount_ngn: z.number().positive("Investment amount must be positive"),
  payment_method: z.enum(["paystack", "wallet"]),
  email: z.string().email("Valid email is required"),
});

export const KycFormSchema = z.object({
  idType: z.enum(["nin", "drivers_license", "passport"]),
  idNumber: z.string().min(5, "ID number too short"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  selfieFile: z.instanceof(File),
  idDocumentFile: z.instanceof(File),
});

export const GovernanceProposalFormSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title too long"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description too long"),
  proposalType: z.string().min(1, "Proposal type is required"),
  budgetNgn: z.number().positive().optional(),
  votingPeriodDays: z
    .number()
    .int()
    .min(1, "Voting period must be at least 1 day")
    .max(30, "Voting period cannot exceed 30 days"),
});

// API Response schemas
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

export const GenericApiResponseSchema = ApiResponseSchema(z.any());
export type GenericApiResponse = z.infer<typeof GenericApiResponseSchema>;

export const BooleanApiResponseSchema = ApiResponseSchema(z.boolean());
export type BooleanApiResponse = z.infer<typeof BooleanApiResponseSchema>;

export const PaginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(0),
    }),
  });

// Type inference
export type User = z.infer<typeof UserSchema>;
export type Property = z.infer<typeof PropertySchema>;
export type Tokenization = z.infer<typeof TokenizationSchema>;
export type Investment = z.infer<typeof InvestmentSchema>;
export type ChatRoom = z.infer<typeof ChatRoomSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type GovernanceProposal = z.infer<typeof GovernanceProposalSchema>;
export type Vote = z.infer<typeof VoteSchema>;
export type Wallet = z.infer<typeof WalletSchema>;
export type KycRecord = z.infer<typeof KycRecordSchema>;

// New types based on schema.sql
export const PropertyImageSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  image_url: z.string().url(),
  image_type: z.string().nullable(),
  caption: z.string().nullable(),
  is_primary: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
  hfs_file_id: z.string().nullable(),
  created_at: z.date(),
});

export const PropertyDocumentSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  document_type: z.string(),
  document_name: z.string(),
  file_url: z.string().url().nullable(),
  hfs_file_id: z.string().nullable(),
  file_hash: z.string().nullable(),
  file_size: z.number().int().positive().nullable(),
  mime_type: z.string().nullable(),
  expiry_date: z.date().nullable(),
  verification_status: z.enum(["pending", "verified", "rejected"]).default("pending"),
  verified_by: z.string().uuid().nullable(),
  verified_at: z.date().nullable(),
  uploaded_by: z.string().uuid().nullable(),
  uploaded_at: z.date(),
});

export const ChatParticipantSchema = z.object({
  id: z.string().uuid(),
  room_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(["admin", "moderator", "member", "observer"]).default("member"),
  joined_at: z.date(),
  last_seen_at: z.date().nullable(),
  is_muted: z.boolean().default(false),
  notifications_enabled: z.boolean().default(true),
  voting_power: z.number().int().min(0).default(0),
});

export const TokenHoldingSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  tokenization_id: z.string().uuid(),
  property_id: z.string().uuid(),
  token_id: z.string(),
  balance: z.number().int().min(0).default(0),
  locked_balance: z.number().int().min(0).default(0),
  average_purchase_price: z.number().positive().nullable(),
  total_invested_ngn: z.number().min(0).default(0),
  realized_returns_ngn: z.number().default(0),
  unrealized_returns_ngn: z.number().default(0),
  last_dividend_received_at: z.date().nullable(),
  acquisition_date: z.date(),
  updated_at: z.date(),
});

export const ActivityLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  property_id: z.string().uuid().nullable(),
  tokenization_id: z.string().uuid().nullable(),
  activity_type: z.string(),
  activity_category: z.string().nullable(),
  description: z.string(),
  metadata: z.record(z.any()).nullable(),
  ip_address: z.string().ip().nullable(),
  user_agent: z.string().nullable(),
  hcs_transaction_id: z.string().nullable(),
  created_at: z.date(),
});

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  title: z.string(),
  message: z.string(),
  notification_type: z.enum(["investment", "governance", "system", "marketing"]),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  action_url: z.string().url().nullable(),
  action_data: z.record(z.any()).nullable(),
  read_at: z.date().nullable(),
  sent_via: z.array(z.enum(["email", "push", "sms", "in_app"]) ).nullable(),
  delivery_status: z.record(z.any()).nullable(), // e.g., { email: 'sent', push: 'failed' }
  expires_at: z.date().nullable(),
  created_at: z.date(),
});

export const UserFavoriteSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  propertyId: z.string().uuid(),
  createdAt: z.date(),
});

export const DividendDistributionSchema = z.object({
  id: z.string().uuid(),
  propertyId: z.string().uuid(),
  tokenizationId: z.string().uuid(),
  distributionPeriod: z.string().nullable(),
  totalAmountNgn: z.number().positive(),
  totalAmountUsd: z.number().positive().nullable(),
  perTokenAmount: z.number().positive(),
  distributionDate: z.date(),
  paymentStatus: z.enum(["pending", "processing", "completed", "failed"]).default("pending"),
  totalRecipients: z.number().int().min(0).nullable(),
  successfulPayments: z.number().int().min(0).default(0),
  failedPayments: z.number().int().min(0).default(0),
  hcsRecordId: z.string().nullable(),
  createdBy: z.string().uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const DividendPaymentSchema = z.object({
  id: z.string().uuid(),
  distributionId: z.string().uuid(),
  recipientId: z.string().uuid(),
  tokenizationId: z.string().uuid(),
  tokensHeld: z.number().int().positive(),
  amountNgn: z.number().positive(),
  amountUsd: z.number().positive().nullable(),
  paymentMethod: z.enum(["wallet", "bank_transfer"]).nullable(),
  paymentReference: z.string().nullable(),
  paymentStatus: z.enum(["pending", "sent", "received", "failed"]).default("pending"),
  taxWithheld: z.number().min(0).default(0),
  netAmount: z.number().positive().nullable(),
  paidAt: z.date().nullable(),
  createdAt: z.date(),
});

export const SystemSettingSchema = z.object({
  id: z.string().uuid(),
  settingKey: z.string(),
  settingValue: z.record(z.any()), // JSONB type
  settingType: z.string().nullable(),
  description: z.string().nullable(),
  isPublic: z.boolean().default(false),
  updatedBy: z.string().uuid().nullable(),
  updatedAt: z.date(),
});

// Type inference for new schemas
export type PropertyImage = z.infer<typeof PropertyImageSchema>;
export type PropertyDocument = z.infer<typeof PropertyDocumentSchema>;
export type ChatParticipant = z.infer<typeof ChatParticipantSchema>;
export type TokenHolding = z.infer<typeof TokenHoldingSchema>;
export type ActivityLog = z.infer<typeof ActivityLogSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type UserFavorite = z.infer<typeof UserFavoriteSchema>;
export type DividendDistribution = z.infer<typeof DividendDistributionSchema>;
export type DividendPayment = z.infer<typeof DividendPaymentSchema>;
export type SystemSetting = z.infer<typeof SystemSettingSchema>;

// Form types
export type SignUpFormData = z.infer<typeof SignUpFormSchema>;
export type LoginFormData = z.infer<typeof LoginFormSchema>;
export type PropertyFormData = z.infer<typeof PropertyFormSchema>;
export type TokenizationFormData = z.infer<typeof TokenizationFormSchema>;
export type InvestmentFormData = z.infer<typeof InvestmentFormSchema>;
export type KycFormData = z.infer<typeof KycFormSchema>;
export type GovernanceProposalFormData = z.infer<
  typeof GovernanceProposalFormSchema
>;
