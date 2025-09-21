import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "../BaseRepository";
import { Wallet } from "../../types";

export class WalletRepository extends BaseRepository<Wallet> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "wallets");
  }

  async findByUserId(userId: string): Promise<Wallet[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data as Wallet[];
  }

  async findByHederaAccountId(hederaAccountId: string): Promise<Wallet | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("hedera_account_id", hederaAccountId)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data as Wallet | null;
  }
}
