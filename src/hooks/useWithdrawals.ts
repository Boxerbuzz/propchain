import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const useWithdrawals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['withdrawals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('withdrawal_requests' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id,
  });

  const cancelWithdrawal = useMutation({
    mutationFn: async (withdrawalId: string) => {
      const { data, error } = await supabase.functions.invoke('cancel-withdrawal', {
        body: { withdrawal_id: withdrawalId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      toast.success('Withdrawal cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel withdrawal');
    },
  });

  return {
    withdrawals,
    isLoading,
    cancelWithdrawal: cancelWithdrawal.mutate,
    isCancelling: cancelWithdrawal.isPending,
  };
};
