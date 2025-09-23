import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "../BaseRepository";
import { TokenHolding } from "../../types";

export class TokenHoldingRepository extends BaseRepository<TokenHolding> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "token_holdings");
  }

  async findByUserId(userId: string): Promise<TokenHolding[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data as TokenHolding[];
  }

  async findByUserAndTokenization(userId: string, tokenizationId: string): Promise<TokenHolding | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .eq("tokenization_id", tokenizationId)
      .maybeSingle();
    if (error) throw error;
    return data as TokenHolding | null;
  }

  async updateBalance(id: string, newBalance: number): Promise<TokenHolding | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as TokenHolding;
  }

  async findByTokenization(tokenizationId: string): Promise<TokenHolding[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("tokenization_id", tokenizationId);
    if (error) throw error;
    return data as TokenHolding[];
  }

  async getTotalInvestedByUser(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("total_invested_ngn")
      .eq("user_id", userId);
    if (error) throw error;
    
    return data?.reduce((total, holding: any) => total + (holding.total_invested_ngn || 0), 0) || 0;
  }

  async getUserPortfolioValue(userId: string): Promise<{
    totalInvested: number;
    currentValue: number;
    totalReturns: number;
  }> {
    const holdings = await this.findByUserId(userId);
    
    const totalInvested = holdings.reduce((sum, h) => sum + ((h as any).total_invested_ngn || 0), 0);
    const unrealizedReturns = holdings.reduce((sum, h) => sum + ((h as any).unrealized_returns_ngn || 0), 0);
    const realizedReturns = holdings.reduce((sum, h) => sum + ((h as any).realized_returns_ngn || 0), 0);
    
    return {
      totalInvested,
      currentValue: totalInvested + unrealizedReturns,
      totalReturns: unrealizedReturns + realizedReturns
    };
  }
}