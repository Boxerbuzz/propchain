import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface Transaction {
  id: string;
  hash?: string;
  type: 'investment' | 'dividend' | 'deposit' | 'withdrawal' | 'token_deposit' | 'token_withdrawal' | 'sync';
  displayType: 'send' | 'receive' | 'swap' | 'internal';
  amount: number;
  currency: string;
  amountUsd?: number;
  amountNgn?: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'rejected';
  timestamp: string;
  date: string;
  fee?: number;
  method: string;
  direction: 'incoming' | 'outgoing';
  explorerUrl?: string;
  description?: string;
  reference?: string;
  from?: string; // Account ID that sent the transaction
  to?: string;   // Account ID that received the transaction
}

export const useWalletTransactions = () => {
  const { user } = useAuth();

  // Fetch investment transactions
  const investmentsQuery = useQuery({
    queryKey: ['investment-transactions', user?.id],
    queryFn: async (): Promise<Transaction[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          tokenizations!inner(
            token_symbol,
            properties!inner(title)
          )
        `)
        .eq('investor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(investment => ({
        id: `inv-${investment.id}`,
        type: 'investment' as const,
        displayType: 'send' as const,
        amount: investment.amount_ngn,
        currency: 'NGN',
      // Status mapping: tokens_distributed = completed, confirmed = completed, failed = failed, others = pending
      status: investment.payment_status === 'tokens_distributed' ? 'completed' as const :
              investment.payment_status === 'confirmed' ? 'completed' as const : 
              investment.payment_status === 'failed' ? 'failed' as const : 'pending' as const,
        timestamp: investment.created_at,
        date: new Date(investment.created_at).toISOString().split('T')[0],
        method: investment.payment_method || 'Bank Transfer',
        direction: 'outgoing' as const,
        description: `Investment in ${investment.tokenizations.properties.title}`,
        reference: investment.paystack_reference,
      }));
    },
    enabled: !!user?.id,
  });

  // Fetch dividend payments
  const dividendsQuery = useQuery({
    queryKey: ['dividend-transactions', user?.id],
    queryFn: async (): Promise<Transaction[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('dividend_payments')
        .select(`
          *,
          dividend_distributions!inner(
            tokenizations!inner(
              token_symbol,
              properties!inner(title)
            )
          )
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(dividend => ({
        id: `div-${dividend.id}`,
        type: 'dividend' as const,
        displayType: 'receive' as const,
        amount: dividend.net_amount || dividend.amount_ngn,
        currency: 'NGN',
        status: dividend.payment_status === 'completed' ? 'completed' as const : 
                dividend.payment_status === 'failed' ? 'failed' as const : 'pending' as const,
        timestamp: dividend.paid_at || dividend.created_at,
        date: new Date(dividend.paid_at || dividend.created_at).toISOString().split('T')[0],
        method: dividend.payment_method || 'Bank Transfer',
        direction: 'incoming' as const,
        description: `Dividend from ${dividend.dividend_distributions.tokenizations.properties.title}`,
        reference: dividend.payment_reference,
      }));
    },
    enabled: !!user?.id,
  });

  // Fetch Hedera transactions
  const hederaQuery = useQuery({
    queryKey: ['hedera-transactions', user?.hedera_account_id],
    queryFn: async (): Promise<Transaction[]> => {
      if (!user?.hedera_account_id) return [];
      
      const { data, error } = await supabase.functions.invoke('get-hedera-transactions', {
        body: { hederaAccountId: user.hedera_account_id }
      });

      if (error) throw error;
      
      return data?.transactions || [];
    },
    enabled: !!user?.hedera_account_id,
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch withdrawal requests
  const withdrawalsQuery = useQuery({
    queryKey: ['withdrawal-transactions', user?.id],
    queryFn: async (): Promise<Transaction[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('withdrawal_requests' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((withdrawal: any) => ({
        id: `wdr-${withdrawal.id}`,
        type: 'withdrawal' as const,
        displayType: 'send' as const,
        amount: withdrawal.amount_ngn || withdrawal.amount_usd || 0,
        currency: withdrawal.currency?.toUpperCase() || 'NGN',
        amountNgn: withdrawal.amount_ngn,
        amountUsd: withdrawal.amount_usd,
        status: withdrawal.status === 'completed' ? 'completed' as const :
                withdrawal.status === 'cancelled' ? 'cancelled' as const :
                withdrawal.status === 'rejected' ? 'rejected' as const :
                withdrawal.status === 'approved' ? 'pending' as const : 'pending' as const,
        timestamp: withdrawal.created_at,
        date: new Date(withdrawal.created_at).toISOString().split('T')[0],
        method: `Bank Transfer to ${withdrawal.bank_name || 'Bank'}`,
        direction: 'outgoing' as const,
        description: `Withdrawal to ${withdrawal.account_number ? `****${withdrawal.account_number.slice(-4)}` : 'bank account'}`,
        reference: withdrawal.reference_number,
      }));
    },
    enabled: !!user?.id,
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const investmentChannel = supabase
      .channel('investment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'investments',
          filter: `investor_id=eq.${user.id}`,
        },
        () => {
          investmentsQuery.refetch();
        }
      )
      .subscribe();

    const dividendChannel = supabase
      .channel('dividend-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dividend_payments',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          dividendsQuery.refetch();
        }
      )
      .subscribe();

    const withdrawalChannel = supabase
      .channel('withdrawal-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'withdrawal_requests',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          withdrawalsQuery.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(investmentChannel);
      supabase.removeChannel(dividendChannel);
      supabase.removeChannel(withdrawalChannel);
    };
  }, [user?.id]);

  // Combine all transactions
  const allTransactions: Transaction[] = [
    ...(investmentsQuery.data || []),
    ...(dividendsQuery.data || []),
    ...(hederaQuery.data || []),
    ...(withdrawalsQuery.data || []),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    transactions: allTransactions,
    isLoading: investmentsQuery.isLoading || dividendsQuery.isLoading || hederaQuery.isLoading || withdrawalsQuery.isLoading,
    error: investmentsQuery.error || dividendsQuery.error || hederaQuery.error || withdrawalsQuery.error,
    refetch: () => {
      investmentsQuery.refetch();
      dividendsQuery.refetch();
      hederaQuery.refetch();
      withdrawalsQuery.refetch();
    },
  };
};