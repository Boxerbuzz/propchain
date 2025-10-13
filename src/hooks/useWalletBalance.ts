import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "@supabase/supabase-js";

interface WalletBalance {
  hederaAccountId: string;
  balanceHbar: number;
  balanceUsd: number;
  balanceNgn: number;
  lastSyncAt: string;
  tokens?: Record<string, number>;
  usdcAssociated?: boolean;
  usdcBalance?: number;
  associatedTokens?: Array<{
    tokenId: string;
    tokenName: string;
    tokenSymbol: string;
    balance: number;
  }>;
}

export const useWalletBalance = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: balance,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["wallet-balance", user?.hedera_account_id],
    queryFn: async (): Promise<WalletBalance | null> => {
      if (!user?.hedera_account_id) return null;

      const { data, error } = await supabase.functions.invoke(
        "sync-wallet-balance",
        {
          body: { hederaAccountId: user.hedera_account_id },
        }
      );

      if (error) throw error;
      return data;
    },
    enabled: !!user?.hedera_account_id,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  const syncBalance = useMutation({
    mutationFn: async () => {
      if (!user?.hedera_account_id) {
        throw new Error("No Hedera account found");
      }

      const { data, error } = await supabase.functions.invoke(
        "sync-wallet-balance",
        {
          body: { hederaAccountId: user.hedera_account_id },
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["wallet-balance", user?.hedera_account_id],
        data
      );
      toast.success("Wallet balance synced successfully!");
    },
    onError: (error: any) => {
      // Extract user-friendly error message
      let errorMessage = 'Failed to sync wallet balance';
      
      if (error.message) {
        try {
          const parsedError = JSON.parse(error.message);
          errorMessage = parsedError.error || parsedError.details || errorMessage;
        } catch {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    },
  });

  const associateUsdc = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('associate-usdc-token');
      
      if (error) {
        // Handle FunctionsHttpError (edge function returned non-2xx status)
        if (error instanceof FunctionsHttpError) {
          const errorData = await error.context.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || 'Failed to associate USDC');
        }
        
        // Handle network/relay errors
        if (error instanceof FunctionsRelayError || error instanceof FunctionsFetchError) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        
        // Generic error
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance', user?.hedera_account_id] });
      
      if (data?.already_associated) {
        toast.success('USDC is already associated with your account');
      } else {
        toast.success('USDC associated successfully!');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to associate USDC');
    },
  });

  return {
    balance,
    isLoading,
    syncBalance: syncBalance.mutate,
    isSyncing: syncBalance.isPending,
    associateUsdc: associateUsdc.mutate,
    isAssociatingUsdc: associateUsdc.isPending,
    refetch,
  };
};
