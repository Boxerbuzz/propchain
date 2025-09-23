import { SupabaseClient } from "@supabase/supabase-js";
import { WalletRepository } from "../data/repositories/WalletRepository";
import { Wallet } from "../types";

export class WalletSyncService {
  private supabase: SupabaseClient;
  private walletRepository: WalletRepository;

  constructor(supabase: SupabaseClient, walletRepository: WalletRepository) {
    this.supabase = supabase;
    this.walletRepository = walletRepository;
  }

  async syncWalletBalance(walletId: string): Promise<Wallet | null> {
    try {
      const wallet = await this.walletRepository.findById(walletId);
      if (!wallet || !wallet.hederaAccountId) {
        throw new Error("Wallet not found or missing Hedera account ID");
      }

      // Call the sync-wallet-balance edge function
      const { data, error } = await this.supabase.functions.invoke('sync-wallet-balance', {
        body: { hederaAccountId: wallet.hederaAccountId }
      });

      if (error) throw error;

      if (data) {
        // Update wallet with new balance information
        const updatedWallet = await this.walletRepository.update(walletId, {
          balanceHbar: data.balanceHbar,
          balanceUsd: data.balanceUsd,
          balanceNgn: data.balanceNgn,
          lastSyncAt: new Date(data.lastSyncAt),
        });

        console.log(`Synced wallet ${walletId} balance: ${data.balanceHbar} HBAR`);
        return updatedWallet;
      }

      return null;
    } catch (error: any) {
      console.error(`Failed to sync wallet ${walletId}:`, error.message);
      throw error;
    }
  }

  async syncUserWallets(userId: string): Promise<Wallet[]> {
    try {
      const wallets = await this.walletRepository.findByUserId(userId);
      const syncedWallets: Wallet[] = [];

      for (const wallet of wallets) {
        if (wallet.hederaAccountId) {
          try {
            const syncedWallet = await this.syncWalletBalance(wallet.id);
            if (syncedWallet) {
              syncedWallets.push(syncedWallet);
            }
          } catch (error: any) {
            console.warn(`Failed to sync wallet ${wallet.id}:`, error.message);
            // Continue with other wallets even if one fails
            syncedWallets.push(wallet);
          }
        } else {
          syncedWallets.push(wallet);
        }
      }

      return syncedWallets;
    } catch (error: any) {
      console.error(`Failed to sync wallets for user ${userId}:`, error.message);
      throw error;
    }
  }

  async syncAllWallets(): Promise<{ synced: number; failed: number }> {
    try {
      // Get all wallets with Hedera account IDs
      const { data: wallets, error } = await this.supabase
        .from('wallets')
        .select('*')
        .not('hedera_account_id', 'is', null);

      if (error) throw error;

      let synced = 0;
      let failed = 0;

      for (const wallet of wallets || []) {
        try {
          await this.syncWalletBalance(wallet.id);
          synced++;
        } catch (error) {
          console.warn(`Failed to sync wallet ${wallet.id}`);
          failed++;
        }
      }

      console.log(`Wallet sync completed: ${synced} synced, ${failed} failed`);
      return { synced, failed };
    } catch (error: any) {
      console.error("Failed to sync all wallets:", error.message);
      throw error;
    }
  }
}