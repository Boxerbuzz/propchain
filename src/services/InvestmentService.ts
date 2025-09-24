import { InvestmentRepository } from "../data/repositories/InvestmentRepository";
import { TokenizationRepository } from "../data/repositories/TokenizationRepository";
import { TokenHoldingRepository } from "../data/repositories/TokenHoldingRepository";
import { PaymentGatewayService } from "../services/integrations/PaymentGatewayService";
import { HederaIntegrationService } from "../services/integrations/HederaIntegrationService";
import { Investment, InvestmentFormData, Tokenization, DividendDistribution, DividendPayment, TokenHolding } from "../types";
import { supabase } from "../lib/supabase";

export class InvestmentService {
  private investmentRepository: InvestmentRepository;
  private tokenizationRepository: TokenizationRepository;
  private tokenHoldingRepository: TokenHoldingRepository;
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
    this.tokenHoldingRepository = new TokenHoldingRepository(supabase);
    this.paymentGatewayService = paymentGatewayService;
    this.hederaIntegrationService = hederaIntegrationService;
  }

  async placeInvestment(investorId: string, tokenizationId: string, investmentData: InvestmentFormData): Promise<Investment | null> {
    const tokenization = await this.tokenizationRepository.findById(tokenizationId);
    if (!tokenization) {
      throw new Error("Tokenization not found.");
    }

    const amountNgn = investmentData.amount_ngn;
    const tokensRequested = Math.floor(amountNgn / tokenization.price_per_token);

    if (tokensRequested < tokenization.min_tokens_per_purchase) {
      throw new Error(`Minimum purchase is ${tokenization.min_tokens_per_purchase} tokens.`);
    }
    if (tokenization.max_tokens_per_purchase && tokensRequested > tokenization.max_tokens_per_purchase) {
      throw new Error(`Maximum purchase is ${tokenization.max_tokens_per_purchase} tokens.`);
    }

    const newInvestment: Partial<Investment> = {
      investor_id: investorId,
      tokenization_id: tokenizationId,
      amount_ngn: amountNgn,
      tokens_requested: tokensRequested,
      payment_method: investmentData.payment_method,
      payment_status: "pending",
      created_at: new Date(),
      updated_at: new Date(),
    };

    // If payment method is paystack, initialize payment
    if (investmentData.payment_method === "paystack") {
      // Use email from investment form data
      const userEmail = investmentData.email;
      const reference = `INV-${investorId}-${Date.now()}`;
      const authorizationUrl = await this.paymentGatewayService.initializePayment(
        userEmail,
        amountNgn * 100, // Paystack amount in kobo
        reference
      );
      newInvestment.paystack_reference = reference;
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
    if (investment.paystack_reference !== paystackReference) {
      throw new Error("Invalid Paystack reference for this investment.");
    }

    const verificationResult = await this.paymentGatewayService.verifyPayment(paystackReference);

    if (verificationResult.status === "success") {
      // Update investment status
      const updatedInvestment = await this.investmentRepository.update(investmentId, {
        payment_status: "confirmed",
        payment_confirmed_at: new Date(),
        tokens_allocated: investment.tokens_requested, // For simplicity, allocate all requested tokens
        updated_at: new Date(),
      });

      // Update tokenization totals
      await this.tokenizationRepository.update(investment.tokenization_id!, {
        current_raise: (investment.amount_ngn || 0) + (investment.amount_ngn || 0), // Assuming amount_ngn is already number
        tokens_sold: (investment.tokens_requested || 0) + (investment.tokens_requested || 0),
        investor_count: (await this.investmentRepository.find({ tokenization_id: investment.tokenization_id, payment_status: "confirmed" })).length,
        updated_at: new Date(),
      });

      // Update or create token holding for the investor
      const existingHolding = await this.tokenHoldingRepository.findByUserAndTokenization(
        investment.investor_id!,
        investment.tokenization_id!
      );

      if (existingHolding) {
        // Update existing token holding
        await this.tokenHoldingRepository.updateBalance(
          existingHolding.id,
          existingHolding.balance + (investment.tokens_allocated || 0)
        );
      } else {
        // Create new token holding
        const tokenization = await this.tokenizationRepository.findById(investment.tokenization_id!);
        await this.tokenHoldingRepository.create({
          user_id: investment.investor_id!,
          tokenization_id: investment.tokenization_id!,
          property_id: tokenization?.property_id,
          token_id: tokenization?.token_id || '',
          balance: investment.tokens_allocated || 0,
          total_invested_ngn: investment.amount_ngn || 0,
          average_purchase_price: tokenization?.price_per_token || 0,
          acquisition_date: new Date(),
        });
      }

      return updatedInvestment;
    }
    throw new Error("Payment verification failed.");
  }

  async getUserInvestments(userId: string): Promise<Investment[]> {
    return this.investmentRepository.find({ investor_id: userId });
  }

  async getTokenHoldings(userId: string): Promise<TokenHolding[]> {
    return this.investmentRepository.getTokenHoldingsByUserId(userId);
  }

  async getDividendDistributions(tokenizationId?: string): Promise<DividendDistribution[]> {
    return this.investmentRepository.getDividendDistributions(tokenizationId);
  }

  async recordDividendDistribution(data: Partial<DividendDistribution>): Promise<DividendDistribution | null> {
    // This method would be called by an admin or scheduled job
    return this.investmentRepository.createDividendDistribution(data);
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
