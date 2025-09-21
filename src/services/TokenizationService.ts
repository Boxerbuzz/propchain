import { TokenizationRepository } from "../data/repositories/TokenizationRepository";
import { HederaIntegrationService } from "../services/integrations/HederaIntegrationService";
import { Tokenization, TokenizationFormData, Property } from "../types";

export class TokenizationService {
  private tokenizationRepository: TokenizationRepository;
  private hederaIntegrationService: HederaIntegrationService;

  constructor(
    tokenizationRepository: TokenizationRepository,
    hederaIntegrationService: HederaIntegrationService
  ) {
    this.tokenizationRepository = tokenizationRepository;
    this.hederaIntegrationService = hederaIntegrationService;
  }

  async createTokenizationProposal(createdBy: string, propertyId: string, tokenizationData: TokenizationFormData): Promise<Tokenization | null> {
    // In a real scenario, this would involve more complex validation and potentially a governance proposal
    const newTokenization: Partial<Tokenization> = {
      propertyId,
      createdBy,
      tokenName: `Property-${propertyId}-Token`, // Example dynamic naming
      tokenSymbol: `PRP-${propertyId.substring(0, 3).toUpperCase()}`, // Example dynamic symbol
      totalSupply: tokenizationData.totalSupply,
      pricePerToken: tokenizationData.pricePerToken,
      minInvestment: tokenizationData.minInvestment,
      maxInvestment: tokenizationData.maxInvestment,
      investmentWindowStart: tokenizationData.investmentWindowStart,
      investmentWindowEnd: tokenizationData.investmentWindowEnd,
      minimumRaise: tokenizationData.minimumRaise,
      targetRaise: tokenizationData.targetRaise,
      expectedRoiAnnual: tokenizationData.expectedRoiAnnual,
      dividendFrequency: tokenizationData.dividendFrequency,
      status: "draft", // Initial status
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.tokenizationRepository.create(newTokenization);
  }

  async getTokenizationDetails(tokenizationId: string): Promise<Tokenization | null> {
    return this.tokenizationRepository.findById(tokenizationId);
  }

  async listTokenizations(filters?: Partial<Tokenization>): Promise<Tokenization[]> {
    return this.tokenizationRepository.find(filters);
  }

  async updateTokenizationStatus(tokenizationId: string, status: Tokenization["status"]): Promise<Tokenization | null> {
    return this.tokenizationRepository.update(tokenizationId, { status, updatedAt: new Date() });
  }

  async mintPropertyTokens(tokenizationId: string, supplyKey: PrivateKey): Promise<Tokenization | null> {
    const tokenization = await this.tokenizationRepository.findById(tokenizationId);
    if (!tokenization || !tokenization.tokenId) {
      throw new Error("Tokenization not found or token ID not set.");
    }

    // Call Hedera Integration Service to mint tokens
    const transactionId = await this.hederaIntegrationService.mintTokens(
      tokenization.tokenId,
      tokenization.totalSupply,
      supplyKey
    );

    return this.tokenizationRepository.update(tokenizationId, {
      status: "minting",
      mintingTransactionId: transactionId,
      mintedAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
