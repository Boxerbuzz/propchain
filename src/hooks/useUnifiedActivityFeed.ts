import { useMemo } from 'react';
import { useActivityFeed } from './useActivityFeed';
import { useWalletTransactions } from './useWalletTransactions';

export interface UnifiedActivity {
  id: string;
  type: 'investment' | 'dividend' | 'deposit' | 'withdrawal' | 'token_deposit' | 'token_withdrawal' | 'sync' | 'property_event' | 'status_change';
  title: string;
  description: string;
  amount?: number;
  currency?: string;
  status: 'pending' | 'completed' | 'failed' | 'success' | 'info';
  timestamp: string;
  icon?: string;
  metadata?: any;
}

export const useUnifiedActivityFeed = (limit = 20) => {
  const { activities: activityLogs, isLoading: activityLoading, error: activityError, refetch: refetchActivities } = useActivityFeed(limit);
  const { transactions, isLoading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useWalletTransactions();

  const unifiedActivities: UnifiedActivity[] = useMemo(() => {
    const combined: UnifiedActivity[] = [];

    // Add activity logs
    activityLogs.forEach((activity: any) => {
      combined.push({
        id: `activity-${activity.id}`,
        type: activity.activity_type?.includes('investment') ? 'investment' : 'property_event',
        title: activity.activity_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Activity',
        description: activity.description || '',
        status: 'info',
        timestamp: activity.created_at,
        metadata: activity.metadata,
      });
    });

    // Add transactions
    transactions.forEach((transaction: any) => {
      combined.push({
        id: `transaction-${transaction.id}`,
        type: transaction.type,
        title: transaction.type === 'investment' ? 'Investment Made' :
               transaction.type === 'dividend' ? 'Dividend Received' :
               transaction.type === 'deposit' ? 'Wallet Deposit' :
               transaction.type === 'withdrawal' ? 'Wallet Withdrawal' :
               transaction.type === 'token_deposit' ? 'Token Deposit' :
               transaction.type === 'token_withdrawal' ? 'Token Withdrawal' :
               'Transaction',
        description: transaction.description || `${transaction.direction === 'incoming' ? 'Received' : 'Sent'} ${transaction.amount} ${transaction.currency}`,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        timestamp: transaction.timestamp,
        metadata: {
          method: transaction.method,
          direction: transaction.direction,
          reference: transaction.reference,
          hash: transaction.hash,
          explorerUrl: transaction.explorerUrl,
        },
      });
    });

    // Sort by timestamp descending
    return combined
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }, [activityLogs, transactions, limit]);

  return {
    activities: unifiedActivities,
    isLoading: activityLoading || transactionsLoading,
    error: activityError || transactionsError,
    refetch: () => {
      refetchActivities();
      refetchTransactions();
    },
  };
};
