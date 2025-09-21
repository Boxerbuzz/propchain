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
      proposerId,
      propertyId,
      title: proposalData.title,
      description: proposalData.description,
      proposalType: proposalData.proposalType,
      budgetNgn: proposalData.budgetNgn,
      votingStart,
      votingEnd,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.governanceRepository.create(newProposal);
  }

  async getProposalDetails(proposalId: string): Promise<GovernanceProposal | null> {
    return this.governanceRepository.findById(proposalId);
  }

  async listProposals(filters?: Partial<GovernanceProposal>): Promise<GovernanceProposal[]> {
    return this.governanceRepository.find(filters);
  }

  async submitVote(proposalId: string, voterId: string, voteChoice: Vote["voteChoice"], votingPower: number, voteReason?: string): Promise<Vote | null> {
    const proposal = await this.governanceRepository.findById(proposalId);
    if (!proposal) {
      throw new Error("Proposal not found.");
    }
    if (new Date() < proposal.votingStart || new Date() > proposal.votingEnd) {
      throw new Error("Voting is not active for this proposal.");
    }

    // Create a vote record in the database
    const newVote: Partial<Vote> = {
      proposalId,
      voterId,
      voteChoice,
      votingPower,
      voteReason,
      castAt: new Date(),
    };
    const createdVote = await this.governanceRepository.createVote(newVote);

    // Optionally, interact with Hedera for on-chain voting record
    // This would involve submitting a message to an HCS topic associated with the proposal
    try {
      const hcsMessage = JSON.stringify({ proposalId, voterId, voteChoice, votingPower });
      // Assuming proposal.hcsTopicId exists and is managed when proposal is created
      if (proposal.hcsTopicId) {
        await this.hederaIntegrationService.submitTopicMessage(proposal.hcsTopicId, hcsMessage);
        // You might update the vote record with a hcs_transaction_id
      }
    } catch (error) {
      console.error("Failed to submit vote to Hedera Consensus Service:", error);
      // Decide how to handle this: fail the vote, or just log and proceed.
    }

    // Update proposal vote counts (simplified for now)
    const updateData: Partial<GovernanceProposal> = {
      totalVotesCast: (proposal.totalVotesCast || 0) + votingPower,
      updatedAt: new Date(),
    };
    if (voteChoice === "for") {
      updateData.votesFor = (proposal.votesFor || 0) + votingPower;
    } else if (voteChoice === "against") {
      updateData.votesAgainst = (proposal.votesAgainst || 0) + votingPower;
    } else if (voteChoice === "abstain") {
      updateData.votesAbstain = (proposal.votesAbstain || 0) + votingPower;
    }
    await this.governanceRepository.update(proposalId, updateData);

    return createdVote;
  }
}
