import { TokenizationRepository } from "../data/repositories/TokenizationRepository";
import { HederaIntegrationService } from "../services/integrations/HederaIntegrationService";
import { Tokenization, TokenizationFormData, Property } from "../types";
import { PrivateKey } from "@hashgraph/sdk";

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
      property_id: propertyId,
      created_by: createdBy,
      token_name: `Property-${propertyId}-Token`, // Example dynamic naming
      token_symbol: `PRP-${propertyId.substring(0, 3).toUpperCase()}`, // Example dynamic symbol
      total_supply: tokenizationData.totalSupply,
      price_per_token: tokenizationData.pricePerToken,
      min_investment: tokenizationData.minInvestment,
      max_investment: tokenizationData.maxInvestment,
      investment_window_start: tokenizationData.investmentWindowStart,
      investment_window_end: tokenizationData.investmentWindowEnd,
      minimum_raise: tokenizationData.minimumRaise,
      target_raise: tokenizationData.targetRaise,
      expected_roi_annual: tokenizationData.expectedRoiAnnual,
      dividend_frequency: tokenizationData.dividendFrequency,
      status: "draft", // Initial status
      created_at: new Date(),
      updated_at: new Date(),
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
    return this.tokenizationRepository.update(tokenizationId, { status, updated_at: new Date() });
  }

  async mintPropertyTokens(tokenizationId: string, supplyKey: PrivateKey): Promise<Tokenization | null> {
    const tokenization = await this.tokenizationRepository.findById(tokenizationId);
    if (!tokenization || !tokenization.token_id) {
      throw new Error("Tokenization not found or token ID not set.");
    }

    // Call Hedera Integration Service to mint tokens
    const transactionId = await this.hederaIntegrationService.mintTokens(
      tokenization.token_id,
      tokenization.total_supply,
      supplyKey
    );

    return this.tokenizationRepository.update(tokenizationId, {
      status: "minting",
      minting_transaction_id: transactionId,
      minted_at: new Date(),
      updated_at: new Date(),
    });
  }
}
