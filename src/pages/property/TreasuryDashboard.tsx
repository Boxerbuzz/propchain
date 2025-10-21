import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Wallet, Users, History, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useContractBalance } from '@/hooks/useContractBalance';
import { MultiSigWithdrawalCard } from '@/components/treasury/MultiSigWithdrawalCard';
import { format } from 'date-fns';

export default function TreasuryDashboard() {
  const { propertyId } = useParams();

  // Fetch tokenization with treasury details
  const { data: tokenization, isLoading: loadingTokenization } = useQuery({
    queryKey: ['tokenization-treasury', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tokenizations')
        .select('*')
        .eq('property_id', propertyId)
        .single();

      if (error) throw error;
      return data as any;
    },
    enabled: !!propertyId,
  });

  // Fetch contract balance
  const { data: balance } = useContractBalance(tokenization?.multisig_treasury_address as string);

  // Fetch pending withdrawals
  const { data: pendingWithdrawals, isLoading: loadingWithdrawals } = useQuery({
    queryKey: ['pending-withdrawals', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_treasury_transactions' as any)
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!propertyId,
  });

  // Fetch transaction history
  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ['treasury-transactions', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_treasury_transactions' as any)
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as any[];
    },
    enabled: !!propertyId,
  });

  if (loadingTokenization) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tokenization?.multisig_treasury_address) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Treasury Not Available</CardTitle>
            <CardDescription>
              This property doesn't have a multi-signature treasury set up yet.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Property Treasury</h1>
        <p className="text-muted-foreground">
          Secure multi-signature treasury for property funds
        </p>
      </div>

      {/* Treasury Balance */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Treasury Balance
              </CardTitle>
              <Badge variant="outline">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">HBAR</p>
              <p className="text-3xl font-bold">{balance?.balance_hbar.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">USDC</p>
              <p className="text-3xl font-bold">${balance?.balance_usdc.toFixed(2) || '0.00'}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Last synced: {balance ? format(new Date(balance.last_synced), 'PPp') : 'Never'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Signers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Required Approvals</span>
              <Badge>{tokenization.treasury_threshold} of {tokenization.treasury_signers?.length || 0}</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Authorized Signers:</p>
              <div className="space-y-1">
                {tokenization.treasury_signers?.map((signer: string, index: number) => (
                  <div key={signer} className="text-sm flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {index === 0 ? '👤 Owner' : index === 1 ? '🏢 Admin' : '👥 Rep'}
                    </Badge>
                    <span className="text-muted-foreground font-mono text-xs truncate">
                      {signer.substring(0, 8)}...{signer.substring(signer.length - 6)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Withdrawals
            {pendingWithdrawals && pendingWithdrawals.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingWithdrawals.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {loadingWithdrawals ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : pendingWithdrawals && pendingWithdrawals.length > 0 ? (
            pendingWithdrawals.map((withdrawal: any) => (
              <MultiSigWithdrawalCard
                key={withdrawal.id}
                amount={withdrawal.amount_ngn}
                description={withdrawal.description || 'No description'}
                approvalsCount={withdrawal.metadata?.approvals_count || 0}
                approvalsRequired={withdrawal.metadata?.approvals_required || 2}
                status={withdrawal.status}
                createdAt={withdrawal.created_at}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No pending withdrawals</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          {loadingTransactions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions && transactions.length > 0 ? (
                    transactions.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium">{tx.description || tx.transaction_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(tx.created_at), 'PPp')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {tx.transaction_type === 'deposit' ? '+' : '-'}
                            ₦{Number(tx.amount_ngn).toLocaleString()}
                          </p>
                          <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No transactions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Treasury Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
