import { supabase } from "../lib/supabase";
import { GovernanceRepository } from "../data/repositories/GovernanceRepository";
import { HederaIntegrationService } from "../services/integrations/HederaIntegrationService";
import { GovernanceService } from "../services/GovernanceService";
import {
  GovernanceProposalFormSchema,
  Vote,
  ApiResponseSchema,
  GovernanceProposalSchema,
  VoteSchema,
  GenericApiResponse,
} from "../types";
import { z } from "zod";

// Initialize repositories and services
const governanceRepository = new GovernanceRepository(supabase);
const hederaIntegrationService = new HederaIntegrationService();
const governanceService = new GovernanceService(
  governanceRepository,
  hederaIntegrationService
);

// Define response types
const GovernanceProposalResponseSchema = ApiResponseSchema(
  GovernanceProposalSchema
);
type GovernanceProposalResponse = z.infer<
  typeof GovernanceProposalResponseSchema
>;

const GovernanceProposalsListResponseSchema = ApiResponseSchema(
  z.array(GovernanceProposalSchema)
);
type GovernanceProposalsListResponse = z.infer<
  typeof GovernanceProposalsListResponseSchema
>;

const VoteResponseSchema = ApiResponseSchema(VoteSchema);
type VoteResponse = z.infer<typeof VoteResponseSchema>;

const VotesListResponseSchema = ApiResponseSchema(z.array(VoteSchema));
type VotesListResponse = z.infer<typeof VotesListResponseSchema>;

export const governanceApi = {
  async createProposal(
    proposerId: string,
    propertyId: string,
    formData: any
  ): Promise<GovernanceProposalResponse | GenericApiResponse> {
    try {
      const validatedData = GovernanceProposalFormSchema.parse(formData);
      const proposal = await governanceService.createProposal(
        proposerId,
        propertyId,
        validatedData
      );
      return {
        success: true,
        data: proposal,
        message: "Governance proposal created successfully.",
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
        message: "Failed to create governance proposal.",
      };
    }
  },

  async getProposalDetails(
    proposalId: string
  ): Promise<GovernanceProposalResponse | GenericApiResponse> {
    try {
      const proposal = await governanceService.getProposalDetails(proposalId);
      if (!proposal) {
        return { success: false, message: "Governance proposal not found." };
      }
      return {
        success: true,
        data: proposal,
        message: "Governance proposal details retrieved successfully.",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: "Failed to retrieve governance proposal details.",
      };
    }
  },

  async listProposals(
    filters?: any
  ): Promise<GovernanceProposalsListResponse | GenericApiResponse> {
    try {
      const proposals = await governanceService.listProposals(filters);
      return {
        success: true,
        data: proposals,
        message: "Governance proposals listed successfully.",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: "Failed to list governance proposals.",
      };
    }
  },

  async submitVote(
    proposalId: string,
    voterId: string,
    voteChoice: Vote["vote_choice"],
    votingPower: number,
    voteReason?: string
  ): Promise<VoteResponse | GenericApiResponse> {
    try {
      const vote = await governanceService.submitVote(
        proposalId,
        voterId,
        voteChoice,
        votingPower,
        voteReason
      );
      return {
        success: true,
        data: vote,
        message: "Vote submitted successfully.",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: "Failed to submit vote.",
      };
    }
  },

  async getVotesByProposalId(
    proposalId: string
  ): Promise<VotesListResponse | GenericApiResponse> {
    try {
      const votes = await governanceRepository.getVotesByProposalId(proposalId);
      return {
        success: true,
        data: votes,
        message: "Votes retrieved successfully.",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: "Failed to retrieve votes.",
      };
    }
  },
};
