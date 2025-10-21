import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface FundWalletParams {
  amount_ngn: number;
  target_token: 'HBAR' | 'USDC';
  email: string;
}

export const useWalletFunding = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fundWallet = useMutation({
    mutationFn: async (params: FundWalletParams) => {
      const { data, error } = await supabase.functions.invoke('fund-wallet-paystack', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Redirect to Paystack payment page
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to initiate funding');
    },
  });

  return {
    fundWallet: fundWallet.mutate,
    isFunding: fundWallet.isPending,
  };
};
