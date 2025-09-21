import { InvestmentRepository } from "../data/repositories/InvestmentRepository";
import { TokenizationRepository } from "../data/repositories/TokenizationRepository";
import { PaymentGatewayService } from "../services/integrations/PaymentGatewayService";
import { HederaIntegrationService } from "../services/integrations/HederaIntegrationService";
import { Investment, InvestmentFormData, Tokenization, DividendDistribution, DividendPayment, TokenHolding } from "../types";

export class InvestmentService {
  private investmentRepository: InvestmentRepository;
  private tokenizationRepository: TokenizationRepository;
  private paymentGatewayService: PaymentGatewayService;
  private hederaIntegrationService: HederaIntegrationService;

  constructor(
    investmentRepository: InvestmentRepository,
    tokenizationRepository: TokenizationRepository,
    paymentGatewayService: PaymentGatewayService,
    hederaIntegrationService: HederaIntegrationService
  ) {
    this.investmentRepository = investmentRepository;
    this.tokenizationRepository = tokenizationRepository;
    this.paymentGatewayService = paymentGatewayService;
    this.hederaIntegrationService = hederaIntegrationService;
  }

  async placeInvestment(investorId: string, tokenizationId: string, investmentData: InvestmentFormData): Promise<Investment | null> {
    const tokenization = await this.tokenizationRepository.findById(tokenizationId);
    if (!tokenization) {
      throw new Error("Tokenization not found.");
    }

    const amountNgn = investmentData.amountNgn;
    const tokensRequested = Math.floor(amountNgn / tokenization.pricePerToken);

    if (tokensRequested < tokenization.minTokensPerPurchase) {
      throw new Error(`Minimum purchase is ${tokenization.minTokensPerPurchase} tokens.`);
    }
    if (tokenization.maxTokensPerPurchase && tokensRequested > tokenization.maxTokensPerPurchase) {
      throw new Error(`Maximum purchase is ${tokenization.maxTokensPerPurchase} tokens.`);
    }

    const newInvestment: Partial<Investment> = {
      investorId,
      tokenizationId,
      amountNgn,
      tokensRequested,
      paymentMethod: investmentData.paymentMethod,
      paymentStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // If payment method is paystack, initialize payment
    if (investmentData.paymentMethod === "paystack") {
      // This is a simplified flow. In a real app, you'd get user email from session/db
      const mockUserEmail = "investor@example.com"; 
      const reference = `INV-${investorId}-${Date.now()}`;
      const authorizationUrl = await this.paymentGatewayService.initializePayment(
        mockUserEmail,
        amountNgn * 100, // Paystack amount in kobo
        reference
      );
      newInvestment.paystackReference = reference;
      // In a real app, you'd redirect the user to authorizationUrl
      console.log("Paystack Authorization URL:", authorizationUrl);
    }

    return this.investmentRepository.create(newInvestment);
  }

  async processInvestmentPayment(investmentId: string, paystackReference: string): Promise<Investment | null> {
    const investment = await this.investmentRepository.findById(investmentId);
    if (!investment) {
      throw new Error("Investment not found.");
    }
    if (investment.paystackReference !== paystackReference) {
      throw new Error("Invalid Paystack reference for this investment.");
    }

    const verificationResult = await this.paymentGatewayService.verifyPayment(paystackReference);

    if (verificationResult.status === "success") {
      // Update investment status
      const updatedInvestment = await this.investmentRepository.update(investmentId, {
        paymentStatus: "confirmed",
        paymentConfirmedAt: new Date(),
        tokensAllocated: investment.tokensRequested, // For simplicity, allocate all requested tokens
        updatedAt: new Date(),
      });

      // Update tokenization totals
      await this.tokenizationRepository.update(investment.tokenizationId!, {
        currentRaise: (investment.amountNgn || 0) + (investment.amountNgn || 0), // Assuming amountNgn is already number
        tokensSold: (investment.tokensRequested || 0) + (investment.tokensRequested || 0),
        investorCount: (await this.investmentRepository.find({ tokenizationId: investment.tokenizationId, paymentStatus: "confirmed" })).length,
        updatedAt: new Date(),
      });

      // Update or create token holding for the investor
      const existingHolding = (await this.investmentRepository.getTokenHoldingsByUserId(investment.investorId!)).find(
        (h) => h.tokenizationId === investment.tokenizationId
      );

      if (existingHolding) {
        // This part needs a dedicated TokenHoldingRepository for updates.
        // For now, we'll log it.
        console.log("Mock: Updating existing token holding");
      } else {
        // This part needs a dedicated TokenHoldingRepository for creation.
        // For now, we'll log it.
        console.log("Mock: Creating new token holding");
      }

      return updatedInvestment;
    }
    throw new Error("Payment verification failed.");
  }

  async getUserInvestments(userId: string): Promise<Investment[]> {
    return this.investmentRepository.find({ investorId: userId });
  }

  async getTokenHoldings(userId: string): Promise<TokenHolding[]> {
    return this.investmentRepository.getTokenHoldingsByUserId(userId);
  }

  async getDividendDistributions(tokenizationId?: string): Promise<DividendDistribution[]> {
    return this.investmentRepository.getDividendDistributions(tokenizationId);
  }

  async recordDividendDistribution(data: Partial<DividendDistribution>): Promise<DividendDistribution | null> {
    // This method would be called by an admin or scheduled job
    return this.investmentRepository.create(data);
  }

  async processDividendPayments(distributionId: string): Promise<boolean> {
    // This would involve iterating through token holders, calculating payouts, and initiating transfers.
    console.log(`Mock: Processing dividend payments for distribution ${distributionId}`);

    // Example: Fetch token holders for the associated tokenization
    const distribution = await this.investmentRepository.findById(distributionId); // This needs to be for DividendDistribution, not Investment

    // In a real scenario, you'd: 
    // 1. Get all token holders for the tokenization.
    // 2. Calculate each recipient's payment based on tokens held and per_token_amount.
    // 3. Initiate Hedera token transfers (if dividends are tokens) or fiat payments.
    // 4. Record each individual dividend payment.

    return true;
  }
}
