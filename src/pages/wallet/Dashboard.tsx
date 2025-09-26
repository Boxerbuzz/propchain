import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  CreditCard,
  ArrowUpDown,
  Plus,
  Download,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  TrendingUp,
  History,
  Settings,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { useDashboard } from "@/hooks/useDashboard";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useWalletTransactions, type Transaction } from "@/hooks/useWalletTransactions";
import { useAuth } from "@/context/AuthContext";
import { TransactionFilters, type FilterOptions } from "@/components/TransactionFilters";

const WalletDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  const {
    connectedWallets,
    disconnectExternalWallet,
    getActiveWallet,
    hasExternalWallet,
    hasCustodialWallet,
  } = useWalletConnect();

  const { stats, wallets, isLoading: dashboardLoading } = useDashboard();
  const { balance: hederaBalance, syncBalance, isSyncing } = useWalletBalance();
  const { transactions: allTransactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useWalletTransactions();

  // Calculate transaction summaries
  const transactionSummary = allTransactions.reduce((acc, tx) => {
    if (tx.type === 'deposit' || tx.type === 'dividend') {
      acc.totalDeposited += tx.amount;
    } else if (tx.type === 'withdrawal' || tx.type === 'investment') {
      acc.totalWithdrawn += tx.amount;
    }
    return acc;
  }, { totalDeposited: 0, totalWithdrawn: 0 });

  // Real wallet data from user's account
  const walletData = {
    balance: stats.walletBalance,
    balanceHbar: hederaBalance?.balanceHbar || 0,
    balanceUsd: hederaBalance?.balanceUsd || 0,
    pendingDeposits: allTransactions.filter(tx => tx.status === 'pending' && (tx.type === 'deposit' || tx.type === 'dividend')).length,
    totalDeposited: transactionSummary.totalDeposited,
    totalWithdrawn: transactionSummary.totalWithdrawn,
    walletAddress: user?.hedera_account_id || "No wallet connected",
    lastSyncAt: hederaBalance?.lastSyncAt,
  };

  // Filter transactions based on criteria
  const filterTransactions = (filters: FilterOptions) => {
    let filtered = allTransactions;

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.description?.toLowerCase().includes(searchTerm) ||
        tx.method.toLowerCase().includes(searchTerm) ||
        tx.reference?.toLowerCase().includes(searchTerm) ||
        tx.hash?.toLowerCase().includes(searchTerm)
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(tx => tx.type === filters.type);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(tx => tx.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(tx => new Date(tx.timestamp) >= filterDate);
    }

    setFilteredTransactions(filtered);
  };

  // Initialize filtered transactions
  useEffect(() => {
    setFilteredTransactions(allTransactions);
  }, [allTransactions]);

  const paymentMethods = [
    {
      id: "card1",
      type: "card",
      name: "•••• •••• •••• 4242",
      brand: "Visa",
      expiry: "12/27",
      isDefault: true,
    },
    {
      id: "bank1",
      type: "bank",
      name: "Chase Bank ••••5678",
      brand: "Chase",
      isDefault: false,
    },
  ];

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Deposit Initiated",
      description: `Deposit of $${depositAmount} has been initiated`,
    });
    setDepositAmount("");
  };

  const handleWithdrawal = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(withdrawAmount) > walletData.balance) {
      toast({
        title: "Insufficient Balance",
        description: "Withdrawal amount exceeds available balance",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Withdrawal Initiated",
      description: `Withdrawal of $${withdrawAmount} has been initiated`,
    });
    setWithdrawAmount("");
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletData.walletAddress);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const handleSyncBalance = () => {
    if (user?.hedera_account_id) {
      syncBalance();
    } else {
      toast({
        title: "No Wallet Found",
        description: "Please create a Hedera wallet first",
        variant: "destructive",
      });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
      case "token_deposit":
        return <ArrowUpDown className="h-4 w-4 text-green-600 rotate-180" />;
      case "withdrawal":
      case "token_withdrawal":
        return <ArrowUpDown className="h-4 w-4 text-red-600" />;
      case "investment":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "dividend":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "sync":
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "completed":
          return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
        case "pending":
          return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
        case "failed":
          return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      }
    };

  return (
    <div className="min-h-screen bg-background py-4 md:py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Wallet</h1>
            <p className="text-muted-foreground">
              Manage your funds and payment methods
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleSyncBalance();
                refetchTransactions();
              }}
              disabled={isSyncing || transactionsLoading || !user?.hedera_account_id}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isSyncing || transactionsLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {isSyncing || transactionsLoading ? "Syncing..." : "Sync All"}
              </span>
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Total Balance</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {showBalance
                  ? `₦${walletData.balance.toLocaleString()}`
                  : "••••••"}
              </div>
              <p className="text-sm text-muted-foreground">
                Available for investments
              </p>
              {walletData.balanceHbar > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-blue-600">
                    {walletData.balanceHbar.toFixed(4)} HBAR
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${walletData.balanceUsd.toFixed(2)} USD
                  </p>
                </div>
              )}
              {walletData.lastSyncAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last synced:{" "}
                  {new Date(walletData.lastSyncAt).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Deposited
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{walletData.totalDeposited.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Lifetime deposits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Withdrawn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{walletData.totalWithdrawn.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Lifetime withdrawals
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="transactions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="methods">Payment Methods</TabsTrigger>
                <TabsTrigger value="wallets">Connected Wallets</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Recent Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <TransactionFilters
                      onFilter={filterTransactions}
                      totalCount={allTransactions.length}
                      filteredCount={filteredTransactions.length}
                    />
                    
                    <div className="space-y-4">
                      {transactionsLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                          <p>Loading transactions...</p>
                        </div>
                      ) : filteredTransactions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No transactions found</p>
                          <p className="text-sm">
                            {allTransactions.length > 0 ? 'Try adjusting your filters' : 'Your wallet activity will appear here'}
                          </p>
                        </div>
                      ) : (
                        filteredTransactions.slice(0, 50).map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {getTransactionIcon(transaction.type)}
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium capitalize">
                                    {transaction.type.replace('_', ' ')}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className={getStatusColor(transaction.status)}
                                  >
                                    {transaction.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {transaction.description || transaction.method}
                                </p>
                                {transaction.reference && (
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {transaction.reference}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-semibold ${
                                  transaction.direction === 'incoming'
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {transaction.direction === 'incoming' ? '+' : '-'}
                                {transaction.currency === 'HBAR' 
                                  ? `${transaction.amount.toFixed(4)} HBAR`
                                  : transaction.currency === 'NGN'
                                  ? `₦${transaction.amount.toLocaleString()}`
                                  : `${transaction.amount} ${transaction.currency}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.timestamp).toLocaleDateString()}
                              </p>
                              {transaction.explorerUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 p-1"
                                  onClick={() => window.open(transaction.explorerUrl, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                              {transaction.fee && (
                                <p className="text-xs text-muted-foreground">
                                  Fee: {transaction.fee.toFixed(6)} HBAR
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                      {filteredTransactions.length > 50 && (
                        <div className="text-center py-4">
                          <Button variant="outline" size="sm">
                            Load More Transactions
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="methods" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Payment Methods</CardTitle>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Method
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{method.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">
                                  {method.brand}
                                </p>
                                {method.expiry && (
                                  <span className="text-sm text-muted-foreground">
                                    • Expires {method.expiry}
                                  </span>
                                )}
                                {method.isDefault && (
                                   <Badge
                                     variant="secondary"
                                     className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-300"
                                   >
                                     Default
                                   </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="wallets" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Connected Wallets</CardTitle>
                    <CardDescription>
                      Connect crypto wallets for seamless transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {connectedWallets.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center border border-blue-200 dark:border-blue-700 shadow-lg">
                            <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="mb-4">No wallets connected</p>
                          <Button onClick={() => window.location.href = '/wallet/setup'}>
                            Connect Wallet
                          </Button>
                        </div>
                      ) : (
                        connectedWallets.map((wallet, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center border border-blue-200 dark:border-blue-700 shadow-lg">
                                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{wallet.name}</p>
                                  <Badge
                                    variant="secondary"
                                    className={
                                      wallet.type === "custodial"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-purple-100 text-purple-800"
                                    }
                                  >
                                    {wallet.type === "custodial"
                                      ? "Custodial"
                                      : "External"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground font-mono">
                                  {wallet.address.length > 20
                                    ? `${wallet.address.substring(
                                        0,
                                        10
                                      )}...${wallet.address.substring(
                                        wallet.address.length - 10
                                      )}`
                                    : wallet.address}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-300"
                              >
                                Connected
                              </Badge>
                              {wallet.type === "external" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => disconnectExternalWallet()}
                                >
                                  Disconnect
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deposit">Deposit Amount</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="deposit"
                      type="number"
                      placeholder="Enter amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                    <Button onClick={handleDeposit}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="withdraw">Withdraw Amount</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="withdraw"
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                    <Button onClick={handleWithdrawal} variant="outline">
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Address */}
            <Card>
              <CardHeader>
                <CardTitle>Your Wallet Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-mono break-all">
                      {walletData.walletAddress}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={copyAddress}
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Address
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;
