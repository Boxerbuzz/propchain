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
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z
    .string()
    .transform((str) => str ? new Date(str) : null)
    .nullable(),
  nationality: z.string().default("Nigeria"),
  stateOfResidence: z.string().nullable(),
  occupation: z.string().nullable(),
  annualIncome: z
    .number()
    .positive("Annual income must be positive")
    .nullable(),
  investmentExperience: z.enum(["beginner", "intermediate", "advanced"]),
  hederaAccountId: z
    .string()
    .regex(/^0\.0\.\d+$/, "Invalid Hedera account ID")
    .nullable(),
  kycStatus: z
    .enum(["pending", "verified", "rejected", "expired"])
    .default("pending"),
  kycLevel: z.enum(["tier_1", "tier_2", "tier_3"]).default("tier_1"),
  accountStatus: z.enum(["active", "suspended", "closed"]).default("active"),
  walletType: z.enum(["custodial", "external", "hybrid"]).nullable(),
  referralCode: z.string().nullable(),
  referredBy: z.string().uuid().nullable(),
  emailVerifiedAt: z.date().nullable(),
  phoneVerifiedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
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
  propertyType: z.enum([
    "residential",
    "commercial",
    "industrial",
    "land",
    "mixed_use",
  ]),
  propertySubtype: z.string().nullable(),
  landSize: z.number().positive("Land size must be positive").nullable(),
  builtUpArea: z.number().positive("Built-up area must be positive").nullable(),
  bedrooms: z.number().int().min(0, "Bedrooms cannot be negative").nullable(),
  bathrooms: z.number().int().min(0, "Bathrooms cannot be negative").nullable(),
  yearBuilt: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear(), "Invalid year")
    .nullable(),
  condition: z
    .enum(["excellent", "good", "fair", "needs_renovation"])
    .nullable(),
  amenities: z.array(z.string()).nullable(),
  estimatedValue: z.number().positive("Estimated value must be positive"),
  marketValue: z.number().positive().nullable(),
  rentalIncomeMonthly: z.number().positive().nullable(),
  rentalYield: z
    .number()
    .min(0)
    .max(100, "Yield cannot exceed 100%")
    .nullable(),
  ownerId: z.string().uuid(),
  propertyManagerId: z.string().uuid().nullable(),
  hcsTopicId: z.string().nullable(),
  hfsFileIds: z.array(z.string()).nullable(),
  approvalStatus: z
    .enum(["pending", "approved", "rejected", "suspended"])
    .default("pending"),
  approvedBy: z.string().uuid().nullable(),
  approvedAt: z.date().nullable(),
  verificationScore: z.number().int().min(0).max(100).default(0),
  listingStatus: z
    .enum(["draft", "active", "sold", "withdrawn"])
    .default("draft"),
  featured: z.boolean().default(false),
  viewsCount: z.number().int().min(0).default(0),
  favoritesCount: z.number().int().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Tokenization schemas
export const TokenizationSchema = z
  .object({
    id: z.string().uuid(),
    propertyId: z.string().uuid(),
    tokenId: z
      .string()
      .regex(/^0\.0\.\d+$/, "Invalid Hedera token ID")
      .nullable(),
    tokenName: z.string().max(50, "Token name too long").nullable(),
    tokenSymbol: z.string().max(10, "Token symbol too long").nullable(),
    totalSupply: z.number().int().positive("Total supply must be positive"),
    pricePerToken: z.number().positive("Price per token must be positive"),
    minInvestment: z.number().positive("Minimum investment must be positive"),
    maxInvestment: z.number().positive().nullable(),
    minTokensPerPurchase: z.number().int().positive().default(1),
    maxTokensPerPurchase: z.number().int().positive().nullable(),
    investmentWindowStart: z.date(),
    investmentWindowEnd: z.date(),
    minimumRaise: z.number().positive("Minimum raise must be positive"),
    targetRaise: z.number().positive().nullable(),
    currentRaise: z.number().min(0).default(0),
    tokensSold: z.number().int().min(0).default(0),
    investorCount: z.number().int().min(0).default(0),
    expectedRoiAnnual: z
      .number()
      .min(0)
      .max(100, "ROI cannot exceed 100%")
      .nullable(),
    dividendFrequency: z.enum(["monthly", "quarterly", "annually"]).nullable(),
    managementFeePercentage: z
      .number()
      .min(0)
      .max(20, "Management fee too high")
      .default(2.5),
    platformFeePercentage: z
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
    autoRefund: z.boolean().default(true),
    createdBy: z.string().uuid(),
    approvedBy: z.string().uuid().nullable(),
    approvedAt: z.date().nullable(),
    mintingTransactionId: z.string().nullable(),
    mintedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine((data) => data.investmentWindowEnd > data.investmentWindowStart, {
    message: "Investment window end must be after start",
    path: ["investmentWindowEnd"],
  })
  .refine(
    (data) => !data.maxInvestment || data.maxInvestment > data.minInvestment,
    {
      message: "Maximum investment must be greater than minimum",
      path: ["maxInvestment"],
    }
  );

// Investment schemas
export const InvestmentSchema = z.object({
  id: z.string().uuid(),
  tokenizationId: z.string().uuid(),
  investorId: z.string().uuid(),
  amountNgn: z.number().positive("Investment amount must be positive"),
  amountUsd: z.number().positive().nullable(),
  exchangeRate: z.number().positive().nullable(),
  tokensRequested: z
    .number()
    .int()
    .positive("Tokens requested must be positive"),
  tokensAllocated: z.number().int().min(0).default(0),
  percentageOwnership: z.number().min(0).max(100).nullable(),
  paystackReference: z.string().nullable(),
  paymentStatus: z
    .enum(["pending", "confirmed", "failed", "refunded"])
    .default("pending"),
  paymentMethod: z.enum(["paystack", "wallet", "bank_transfer"]).nullable(),
  paymentConfirmedAt: z.date().nullable(),
  refundProcessedAt: z.date().nullable(),
  refundAmount: z.number().positive().nullable(),
  investmentSource: z.enum(["web", "mobile", "api"]).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Chat schemas
export const ChatRoomSchema = z.object({
  id: z.string().uuid(),
  propertyId: z.string().uuid().nullable(),
  tokenizationId: z.string().uuid().nullable(),
  name: z
    .string()
    .min(1, "Room name is required")
    .max(100, "Room name too long"),
  description: z.string().max(500, "Description too long").nullable(),
  roomType: z
    .enum(["investment", "governance", "general", "support"])
    .default("investment"),
  isPublic: z.boolean().default(false),
  maxParticipants: z.number().int().positive().nullable(),
  autoJoinInvestors: z.boolean().default(true),
  aiAssistantEnabled: z.boolean().default(true),
  moderationEnabled: z.boolean().default(true),
  createdBy: z.string().uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  senderId: z.string().uuid().nullable(),
  replyToId: z.string().uuid().nullable(),
  messageText: z.string().max(2000, "Message too long").nullable(),
  messageType: z
    .enum(["text", "system", "proposal", "vote", "announcement", "ai_response"])
    .default("text"),
  metadata: z.record(z.any()).nullable(),
  attachments: z.array(z.string().url()).nullable(),
  isPinned: z.boolean().default(false),
  isEdited: z.boolean().default(false),
  editedAt: z.date().nullable(),
  reactions: z.record(z.array(z.string())).default({}),
  createdAt: z.date(),
});

// Governance schemas
export const GovernanceProposalSchema = z
  .object({
    id: z.string().uuid(),
    propertyId: z.string().uuid(),
    tokenizationId: z.string().uuid().nullable(),
    proposerId: z.string().uuid(),
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(100, "Title too long"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description too long"),
    proposalType: z.string().min(1, "Proposal type is required"),
    budgetNgn: z.number().positive().nullable(),
    budgetUsd: z.number().positive().nullable(),
    supportingDocuments: z.array(z.string().url()).nullable(),
    votingStart: z.date(),
    votingEnd: z.date(),
    quorumRequired: z
      .number()
      .min(1)
      .max(100, "Quorum cannot exceed 100%")
      .default(50),
    approvalThreshold: z
      .number()
      .min(1)
      .max(100, "Threshold cannot exceed 100%")
      .default(60),
    status: z
      .enum(["draft", "active", "passed", "rejected", "executed", "expired"])
      .default("draft"),
    totalVotesCast: z.number().int().min(0).default(0),
    votesFor: z.number().int().min(0).default(0),
    votesAgainst: z.number().int().min(0).default(0),
    votesAbstain: z.number().int().min(0).default(0),
    executionDate: z.date().nullable(),
    executionStatus: z
      .enum(["pending", "in_progress", "completed", "failed"])
      .nullable(),
    executionNotes: z.string().max(1000, "Execution notes too long").nullable(),
    hcsRecordId: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine((data) => data.votingEnd > data.votingStart, {
    message: "Voting end must be after voting start",
    path: ["votingEnd"],
  });

export const VoteSchema = z.object({
  id: z.string().uuid(),
  proposalId: z.string().uuid(),
  voterId: z.string().uuid(),
  voteChoice: z.enum(["for", "against", "abstain"]),
  votingPower: z.number().int().positive("Voting power must be positive"),
  voteWeight: z.number().min(0).nullable(),
  voteReason: z.string().max(500, "Vote reason too long").nullable(),
  voteTransactionId: z.string().nullable(),
  castAt: z.date(),
});

// Wallet schemas
export const WalletSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  walletType: z.enum(["custodial", "external", "hardware"]),
  walletName: z.string().max(50, "Wallet name too long").nullable(),
  hederaAccountId: z
    .string()
    .regex(/^0\.0\.\d+$/, "Invalid Hedera account ID")
    .nullable(),
  privateKeyEncrypted: z.string().nullable(),
  publicKey: z.string().nullable(),
  balanceHbar: z.number().min(0).default(0),
  balanceNgn: z.number().min(0).default(0),
  balanceUsd: z.number().min(0).default(0),
  isPrimary: z.boolean().default(false),
  backupCompleted: z.boolean().default(false),
  securityLevel: z.enum(["basic", "standard", "high"]).default("standard"),
  lastSyncAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// KYC schemas
export const KycRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  idType: z.enum(["nin", "drivers_license", "passport"]),
  idNumber: z.string().min(5, "ID number too short").nullable(),
  selfieUrl: z.string().url("Invalid selfie URL").nullable(),
  idDocumentUrl: z.string().url("Invalid document URL").nullable(),
  verificationStatus: z
    .enum(["pending", "verified", "rejected"])
    .default("pending"),
  hcsRecordId: z.string().nullable(),
  createdAt: z.date(),
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
  amountNgn: z.number().positive("Investment amount must be positive"),
  paymentMethod: z.enum(["paystack", "wallet"]),
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
  propertyId: z.string().uuid(),
  imageUrl: z.string().url(),
  imageType: z.string().nullable(),
  caption: z.string().nullable(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  hfsFileId: z.string().nullable(),
  createdAt: z.date(),
});

export const PropertyDocumentSchema = z.object({
  id: z.string().uuid(),
  propertyId: z.string().uuid(),
  documentType: z.string(),
  documentName: z.string(),
  fileUrl: z.string().url().nullable(),
  hfsFileId: z.string().nullable(),
  fileHash: z.string().nullable(),
  fileSize: z.number().int().positive().nullable(),
  mimeType: z.string().nullable(),
  expiryDate: z.date().nullable(),
  verificationStatus: z.enum(["pending", "verified", "rejected"]).default("pending"),
  verifiedBy: z.string().uuid().nullable(),
  verifiedAt: z.date().nullable(),
  uploadedBy: z.string().uuid().nullable(),
  uploadedAt: z.date(),
});

export const ChatParticipantSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["admin", "moderator", "member", "observer"]).default("member"),
  joinedAt: z.date(),
  lastSeenAt: z.date().nullable(),
  isMuted: z.boolean().default(false),
  notificationsEnabled: z.boolean().default(true),
  votingPower: z.number().int().min(0).default(0),
});

export const TokenHoldingSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  tokenizationId: z.string().uuid(),
  propertyId: z.string().uuid(),
  tokenId: z.string(),
  balance: z.number().int().min(0).default(0),
  lockedBalance: z.number().int().min(0).default(0),
  averagePurchasePrice: z.number().positive().nullable(),
  totalInvestedNgn: z.number().min(0).default(0),
  realizedReturnsNgn: z.number().default(0),
  unrealizedReturnsNgn: z.number().default(0),
  lastDividendReceivedAt: z.date().nullable(),
  acquisitionDate: z.date(),
  updatedAt: z.date(),
});

export const ActivityLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  propertyId: z.string().uuid().nullable(),
  tokenizationId: z.string().uuid().nullable(),
  activityType: z.string(),
  activityCategory: z.string().nullable(),
  description: z.string(),
  metadata: z.record(z.any()).nullable(),
  ipAddress: z.string().ip().nullable(),
  userAgent: z.string().nullable(),
  hcsTransactionId: z.string().nullable(),
  createdAt: z.date(),
});

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  title: z.string(),
  message: z.string(),
  notificationType: z.enum(["investment", "governance", "system", "marketing"]),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  actionUrl: z.string().url().nullable(),
  actionData: z.record(z.any()).nullable(),
  readAt: z.date().nullable(),
  sentVia: z.array(z.enum(["email", "push", "sms", "in_app"]) ).nullable(),
  deliveryStatus: z.record(z.any()).nullable(), // e.g., { email: 'sent', push: 'failed' }
  expiresAt: z.date().nullable(),
  createdAt: z.date(),
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
