import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubmitWithdrawalParams {
  property_id: string;
  tokenization_id: string;
  amount_ngn: number;
  recipient: string;
  description: string;
}

interface ApproveWithdrawalParams {
  transaction_id: string;
  request_id: string;
}

interface ExecuteWithdrawalParams {
  transaction_id: string;
  request_id: string;
}

export const useTreasuryOperations = () => {
  const queryClient = useQueryClient();

  const submitWithdrawal = useMutation({
    mutationFn: async (params: SubmitWithdrawalParams) => {
      const { data, error } = await supabase.functions.invoke('submit-treasury-withdrawal', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['treasury-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['pending-withdrawals'] });
      toast.success('Withdrawal request submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit withdrawal request');
    },
  });

  const approveWithdrawal = useMutation({
    mutationFn: async (params: ApproveWithdrawalParams) => {
      const { data, error } = await supabase.functions.invoke('approve-treasury-withdrawal', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['treasury-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['pending-withdrawals'] });
      
      if (data.executed) {
        toast.success('Withdrawal approved and executed automatically');
      } else {
        toast.success(`Approval recorded (${data.approval_count}/${data.threshold})`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve withdrawal');
    },
  });

  const executeWithdrawal = useMutation({
    mutationFn: async (params: ExecuteWithdrawalParams) => {
      const { data, error } = await supabase.functions.invoke('execute-treasury-withdrawal', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasury-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['pending-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['contract-balance'] });
      toast.success('Withdrawal executed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to execute withdrawal');
    },
  });

  return {
    submitWithdrawal: submitWithdrawal.mutate,
    isSubmitting: submitWithdrawal.isPending,
    approveWithdrawal: approveWithdrawal.mutate,
    isApproving: approveWithdrawal.isPending,
    executeWithdrawal: executeWithdrawal.mutate,
    isExecuting: executeWithdrawal.isPending,
  };
};