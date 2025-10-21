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
    refetchInterval: (data) => {
      if (data?.transaction_status === 'confirmed' || data?.transaction_status === 'failed') {
        setPollingEnabled(false);
        return false;
      }
      return 5000;
    },
  });

  useEffect(() => {
    if (transaction?.transaction_status === 'confirmed') {
      toast.success('Transaction confirmed');
    } else if (transaction?.transaction_status === 'failed') {
      toast.error('Transaction failed');
    }
  }, [transaction?.transaction_status]);

  return {
    transaction,
    isLoading,
    refetch,
  };
};
