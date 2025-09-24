import { GovernanceRepository } from "../data/repositories/GovernanceRepository";
import { HederaIntegrationService } from "../services/integrations/HederaIntegrationService";
import { GovernanceProposal, GovernanceProposalFormData, Vote } from "../types";

export class GovernanceService {
  private governanceRepository: GovernanceRepository;
  private hederaIntegrationService: HederaIntegrationService;

  constructor(
    governanceRepository: GovernanceRepository,
    hederaIntegrationService: HederaIntegrationService
  ) {
    this.governanceRepository = governanceRepository;
    this.hederaIntegrationService = hederaIntegrationService;
  }

  async createProposal(proposerId: string, propertyId: string, proposalData: GovernanceProposalFormData): Promise<GovernanceProposal | null> {
    // Calculate voting start and end dates based on votingPeriodDays
    const votingStart = new Date();
    const votingEnd = new Date();
    votingEnd.setDate(votingStart.getDate() + proposalData.votingPeriodDays);

    const newProposal: Partial<GovernanceProposal> = {
      proposer_id: proposerId,
      property_id: propertyId,
      title: proposalData.title,
      description: proposalData.description,
      proposal_type: proposalData.proposalType,
      budget_ngn: proposalData.budgetNgn,
      voting_start: votingStart,
      voting_end: votingEnd,
      status: "draft",
      created_at: new Date(),
      updated_at: new Date(),
    };
    return this.governanceRepository.create(newProposal);
  }

  async getProposalDetails(proposalId: string): Promise<GovernanceProposal | null> {
    return this.governanceRepository.findById(proposalId);
  }

  async listProposals(filters?: Partial<GovernanceProposal>): Promise<GovernanceProposal[]> {
    return this.governanceRepository.find(filters);
  }

  async submitVote(proposalId: string, voterId: string, vote_choice: Vote["vote_choice"], votingPower: number, voteReason?: string): Promise<Vote | null> {
    const proposal = await this.governanceRepository.findById(proposalId);
    if (!proposal) {
      throw new Error("Proposal not found.");
    }
    if (new Date() < proposal.voting_start || new Date() > proposal.voting_end) {
      throw new Error("Voting is not active for this proposal.");
    }

    // Create a vote record in the database
    const newVote: Partial<Vote> = {
      proposal_id: proposalId,
      voter_id: voterId,
      vote_choice,
      voting_power: votingPower,
      vote_reason: voteReason,
      cast_at: new Date(),
    };
    const createdVote = await this.governanceRepository.createVote(newVote);

    // Optionally, interact with Hedera for on-chain voting record
    // This would involve submitting a message to an HCS topic associated with the proposal
    try {
      const hcsMessage = JSON.stringify({ proposalId, voterId, vote_choice, votingPower });
      // Assuming proposal.hcs_record_id exists and is managed when proposal is created
      if (proposal.hcs_record_id) {
        await this.hederaIntegrationService.submitTopicMessage(proposal.hcs_record_id, hcsMessage);
        // You might update the vote record with a hcs_transaction_id
      }
    } catch (error) {
      console.error("Failed to submit vote to Hedera Consensus Service:", error);
      // Decide how to handle this: fail the vote, or just log and proceed.
    }

    // Update proposal vote counts (simplified for now)
    const updateData: Partial<GovernanceProposal> = {
      total_votes_cast: (proposal.total_votes_cast || 0) + votingPower,
      updated_at: new Date(),
    };
    if (vote_choice === "for") {
      updateData.votes_for = (proposal.votes_for || 0) + votingPower;
    } else if (vote_choice === "against") {
      updateData.votes_against = (proposal.votes_against || 0) + votingPower;
    } else if (vote_choice === "abstain") {
      updateData.votes_abstain = (proposal.votes_abstain || 0) + votingPower;
    }
    await this.governanceRepository.update(proposalId, updateData);

    return createdVote;
  }
}