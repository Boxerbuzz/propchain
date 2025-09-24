import { supabase } from "../lib/supabase";
import { InvestmentRepository } from "../data/repositories/InvestmentRepository";
import { TokenizationRepository } from "../data/repositories/TokenizationRepository";
import { PaymentGatewayService } from "../services/integrations/PaymentGatewayService";
import { HederaIntegrationService } from "../services/integrations/HederaIntegrationService";
import { InvestmentService } from "../services/InvestmentService";
import {
  InvestmentFormData,
  InvestmentFormSchema,
  Investment,
  TokenHolding,
  DividendDistribution,
  DividendPayment,
  ApiResponseSchema,
  InvestmentSchema,
  TokenHoldingSchema,
  DividendDistributionSchema,
  DividendPaymentSchema,
  GenericApiResponse,
  BooleanApiResponse,
} from "../types";
import { z } from "zod";

// Initialize repositories and services
const investmentRepository = new InvestmentRepository(supabase);
const tokenizationRepository = new TokenizationRepository(supabase);
const paymentGatewayService = new PaymentGatewayService();
const hederaIntegrationService = new HederaIntegrationService();
const investmentService = new InvestmentService(
  investmentRepository,
  tokenizationRepository,
  paymentGatewayService,
  hederaIntegrationService
);

// Define response types
const InvestmentResponseSchema = ApiResponseSchema(InvestmentSchema);
type InvestmentResponse = z.infer<typeof InvestmentResponseSchema>;

const InvestmentsListResponseSchema = ApiResponseSchema(
  z.array(InvestmentSchema)
);
type InvestmentsListResponse = z.infer<typeof InvestmentsListResponseSchema>;

const TokenHoldingsListResponseSchema = ApiResponseSchema(
  z.array(TokenHoldingSchema)
);
type TokenHoldingsListResponse = z.infer<
  typeof TokenHoldingsListResponseSchema
>;

const DividendDistributionsListResponseSchema = ApiResponseSchema(
  z.array(DividendDistributionSchema)
);
type DividendDistributionsListResponse = z.infer<
  typeof DividendDistributionsListResponseSchema
>;

const DividendPaymentResponseSchema = ApiResponseSchema(DividendPaymentSchema);
type DividendPaymentResponse = z.infer<typeof DividendPaymentResponseSchema>;

export const investmentApi = {
  async placeInvestment(
    investorId: string,
    tokenizationId: string,
    formData: any
  ): Promise<InvestmentResponse | GenericApiResponse> {
    try {
      const validatedData = InvestmentFormSchema.parse(formData);
      const investment = await investmentService.placeInvestment(
        investorId,
        tokenizationId,
        validatedData
      );
      return {
        success: true,
        data: investment,
        message: "Investment placed successfully.",
      };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors[0].message,
          message: "Validation Error",
        };
      }
      return {
        success: false,
        error: error.message,
        message: "Failed to place investment.",
      };
    }
  },

  async processInvestmentPayment(
    investmentId: string,
    paystackReference: string
  ): Promise<InvestmentResponse | GenericApiResponse> {
    try {
      const updatedInvestment =
        await investmentService.processInvestmentPayment(
          investmentId,
          paystackReference
        );
      return {
        success: true,
        data: updatedInvestment,
        message: "Investment payment processed successfully.",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: "Failed to process investment payment.",
      };
    }
  },

  async getUserInvestments(
    userId: string
  ): Promise<InvestmentsListResponse | GenericApiResponse> {
    try {
      const investments = await investmentService.getUserInvestments(userId);
      return {
        success: true,
        data: investments,
        message: "User investments retrieved successfully.",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: "Failed to retrieve user investments.",
      };
    }
  },

  async getTokenHoldings(
    userId: string
  ): Promise<TokenHoldingsListResponse | GenericApiResponse> {
    try {
      const tokenHoldings = await investmentService.getTokenHoldings(userId);
      return {
        success: true,
        data: tokenHoldings,
        message: "User token holdings retrieved successfully.",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: "Failed to retrieve user token holdings.",
      };
    }
  },

  async getDividendDistributions(
    tokenizationId?: string
  ): Promise<DividendDistributionsListResponse | GenericApiResponse> {
    try {
      const distributions = await investmentService.getDividendDistributions(
        tokenizationId
      );
      return {
        success: true,
        data: distributions,
        message: "Dividend distributions retrieved successfully.",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: "Failed to retrieve dividend distributions.",
      };
    }
  },

  async recordDividendDistribution(
    formData: any
  ): Promise<DividendPaymentResponse | GenericApiResponse> {
    try {
      // This method would typically be called by an admin or scheduled job via an internal API.
      // For now, it's a direct call to the service.
      const distribution = await investmentService.recordDividendDistribution(
        formData
      );
      return {
        success: true,
        data: distribution,
        message: "Dividend distribution recorded.",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: "Failed to record dividend distribution.",
      };
    }
  },

  async processDividendPayments(
    distributionId: string
  ): Promise<BooleanApiResponse | GenericApiResponse> {
    try {
      const success = await investmentService.processDividendPayments(
        distributionId
      );
      return {
        success,
        message: success
          ? "Dividend payments processed."
          : "Failed to process dividend payments.",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: "Failed to process dividend payments.",
      };
    }
  },
};
