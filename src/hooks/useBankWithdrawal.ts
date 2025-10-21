import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface WithdrawToBankParams {
  amount_ngn: number;
  bank_account: string;
  account_number: string;
  bank_code: string;
}

export const useBankWithdrawal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const withdrawToBank = useMutation({
    mutationFn: async (params: WithdrawToBankParams) => {
      const { data, error } = await supabase.functions.invoke('withdraw-to-bank', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      toast.success('Withdrawal initiated successfully. Funds will be transferred to your bank account.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process withdrawal');
    },
  });

  return {
    withdrawToBank: withdrawToBank.mutate,
    isWithdrawing: withdrawToBank.isPending,
  };
};
