import { supabase } from "../lib/supabase";
import { TokenizationRepository } from "../data/repositories/TokenizationRepository";
import { HederaIntegrationService } from "../services/integrations/HederaIntegrationService";
import { TokenizationService } from "../services/TokenizationService";
import { TokenizationFormSchema, Tokenization, ApiResponseSchema, TokenizationSchema, GenericApiResponse } from "../types";
import { z } from "zod";
import { PrivateKey } from "@hashgraph/sdk";

// Initialize repositories and services
const tokenizationRepository = new TokenizationRepository(supabase);
const hederaIntegrationService = new HederaIntegrationService();
const tokenizationService = new TokenizationService(tokenizationRepository, hederaIntegrationService);

// Define response types
const TokenizationResponseSchema = ApiResponseSchema(TokenizationSchema);
type TokenizationResponse = z.infer<typeof TokenizationResponseSchema>;

const TokenizationsListResponseSchema = ApiResponseSchema(z.array(TokenizationSchema));
type TokenizationsListResponse = z.infer<typeof TokenizationsListResponseSchema>;

export const tokenizationApi = {
  async createTokenizationProposal(createdBy: string, propertyId: string, formData: any): Promise<TokenizationResponse | GenericApiResponse> {
    try {
      const validatedData = TokenizationFormSchema.parse(formData);
      const tokenization = await tokenizationService.createTokenizationProposal(createdBy, propertyId, validatedData);
      return { success: true, data: tokenization, message: "Tokenization proposal created successfully." };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0].message, message: "Validation Error" };
      }
      return { success: false, error: error.message, message: "Failed to create tokenization proposal." };
    }
  },

  async getTokenizationDetails(tokenizationId: string): Promise<TokenizationResponse | GenericApiResponse> {
    try {
      const tokenization = await tokenizationService.getTokenizationDetails(tokenizationId);
      if (!tokenization) {
        return { success: false, message: "Tokenization not found." };
      }
      return { success: true, data: tokenization, message: "Tokenization details retrieved successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to retrieve tokenization details." };
    }
  },

  async listTokenizations(filters?: any): Promise<TokenizationsListResponse | GenericApiResponse> {
    try {
      const tokenizations = await tokenizationService.listTokenizations(filters);
      return { success: true, data: tokenizations, message: "Tokenizations listed successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to list tokenizations." };
    }
  },

  async updateTokenizationStatus(tokenizationId: string, status: Tokenization["status"]): Promise<TokenizationResponse | GenericApiResponse> {
    try {
      const updatedTokenization = await tokenizationService.updateTokenizationStatus(tokenizationId, status);
      if (!updatedTokenization) {
        return { success: false, message: "Tokenization not found or update failed." };
      }
      return { success: true, data: updatedTokenization, message: "Tokenization status updated successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to update tokenization status." };
    }
  },

  // Note: Minting tokens usually involves sensitive private keys and should be handled securely on a backend server.
  // This client-side API is for demonstration purposes. In a real app, this would be an API call to your backend.
  async mintPropertyTokens(tokenizationId: string, supplyKeyString: string): Promise<TokenizationResponse | GenericApiResponse> {
    try {
      const supplyKey = PrivateKey.fromStringECDSA(supplyKeyString); // Assuming ECDSA for Hedera
      const updatedTokenization = await tokenizationService.mintPropertyTokens(tokenizationId, supplyKey);
      if (!updatedTokenization) {
        return { success: false, message: "Tokenization not found or minting failed." };
      }
      return { success: true, data: updatedTokenization, message: "Property tokens minted successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to mint property tokens." };
    }
  },
};
