import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const useSmartContractTransaction = (transactionHash?: string) => {
  const [pollingEnabled, setPollingEnabled] = useState(true);

  const { data: transaction, isLoading, refetch } = useQuery({
    queryKey: ['smart-contract-transaction', transactionHash],
    queryFn: async () => {
      if (!transactionHash) return null;

      const { data, error } = await supabase
        .from('smart_contract_transactions' as any)
        .select('*')
        .eq('transaction_hash', transactionHash)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!transactionHash && pollingEnabled,
    refetchInterval: 5000,
  });

  // Stop polling when transaction is finalized
  useEffect(() => {
    if (transaction) {
      const status = (transaction as any).transaction_status;
      if (status === 'confirmed' || status === 'failed') {
        setPollingEnabled(false);
      }
    }
  }, [transaction]);

  // Show toast notifications on status changes
  useEffect(() => {
    if (transaction) {
      const status = (transaction as any).transaction_status;
      if (status === 'confirmed') {
        toast.success('Transaction confirmed');
      } else if (status === 'failed') {
        toast.error('Transaction failed');
      }
    }
  }, [(transaction as any)?.transaction_status]);

  return {
    transaction,
    isLoading,
    refetch,
  };
};
