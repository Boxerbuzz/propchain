import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "../BaseRepository";
import { Investment, TokenHolding, DividendDistribution, DividendPayment } from "../../types";

export class InvestmentRepository extends BaseRepository<Investment> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "investments");
  }

  async getTokenHoldingsByUserId(userId: string): Promise<TokenHolding[]> {
    const { data, error } = await this.supabase
      .from("token_holdings")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data as TokenHolding[];
  }

  async getDividendDistributions(tokenizationId?: string): Promise<DividendDistribution[]> {
    let query = this.supabase.from("dividend_distributions").select("*");
    if (tokenizationId) {
      query = query.eq("tokenization_id", tokenizationId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as DividendDistribution[];
  }

  async getDividendPaymentsByRecipient(recipientId: string): Promise<DividendPayment[]> {
    const { data, error } = await this.supabase
      .from("dividend_payments")
      .select("*")
      .eq("recipient_id", recipientId);
    if (error) throw error;
    return data as DividendPayment[];
  }
}
