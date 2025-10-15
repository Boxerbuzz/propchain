import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Wallet,
  CreditCard,
  ArrowUpDown,
  Plus,
  Download,
  Eye,
  EyeOff,
  Copy,
  TrendingUp,
  History,
  Settings,
  RefreshCw,
  Hash,
  Pencil,
  Trash,
  MoreVertical,
  ArrowLeftRight,
  Upload,
  Check,
  Clock,
  X,
  AlertCircle,
  Wallet2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { useDashboard } from "@/hooks/useDashboard";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import {
  useWalletTransactions,
  type Transaction,
} from "@/hooks/useWalletTransactions";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  TransactionFilters,
  type FilterOptions,
} from "@/components/TransactionFilters";
import { useWithdrawals } from "@/hooks/useWithdrawals";
import { useNavigate } from "react-router-dom";
import FundHbarModal from "@/components/FundHbarModal";
import { WalletFundingInfo } from "@/components/WalletFundingInfo";
import { CurrencyToggle } from "@/components/CurrencyToggle";

const WalletDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currency, formatAmount, getCurrencySymbol } = useCurrency();
  const [showBalance, setShowBalance] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [showFundModal, setShowFundModal] = useState(false);

  const { connectedWallets, disconnectExternalWallet } = useWalletConnect();

  const { stats } = useDashboard();
  const { balance: hederaBalance, syncBalance, isSyncing } = useWalletBalance();
  const {
    transactions: allTransactions,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useWalletTransactions();
  
  const {
    withdrawals,
    isLoading: withdrawalsLoading,
    cancelWithdrawal,
  } = useWithdrawals();

  // Calculate transaction summaries with proper NGN conversion
  const transactionSummary = (allTransactions || []).reduce(
    (acc, tx) => {
      let amountInNGN = tx.amount || 0;

      // Convert HBAR to NGN if it's a HBAR transaction
      if (
        tx.currency === "HBAR" &&
        hederaBalance?.balanceNgn &&
        hederaBalance?.balanceHbar &&
        hederaBalance.balanceHbar > 0
      ) {
        const hbarToNgnRate =
          hederaBalance.balanceNgn / hederaBalance.balanceHbar;
        amountInNGN = (tx.amount || 0) * hbarToNgnRate;
      }

      if (tx.type === "deposit" || tx.type === "dividend") {
        acc.totalDeposited += amountInNGN;
      } else if (tx.type === "withdrawal" || tx.type === "investment") {
        acc.totalWithdrawn += amountInNGN;
      }
      return acc;
    },
    { totalDeposited: 0, totalWithdrawn: 0 }
  );

  // Real wallet data from user's account
  const walletData = {
    balance: stats.walletBalance,
    balanceHbar: hederaBalance?.balanceHbar || 0,
    balanceUsd: hederaBalance?.balanceUsd || 0,
    pendingDeposits: (allTransactions || []).filter(
      (tx) =>
        tx.status === "pending" &&
        (tx.type === "deposit" || tx.type === "dividend")
    ).length,
    totalDeposited: transactionSummary.totalDeposited,
    totalWithdrawn: transactionSummary.totalWithdrawn,
    walletAddress: user?.hedera_account_id || "No wallet connected",
    lastSyncAt: hederaBalance?.lastSyncAt,
  };

  // Calculate total portfolio value based on selected currency
  const totalPortfolioValue =
    currency === "NGN"
      ? (hederaBalance?.balanceNgn || 0) + (hederaBalance?.usdcBalanceNgn || 0)
      : (hederaBalance?.balanceUsd || 0) + (hederaBalance?.usdcBalanceUsd || 0);

  // Breakdown text for third card
  const portfolioBreakdown = `${(hederaBalance?.balanceHbar || 0).toFixed(
    2
  )} ℏ + ${(hederaBalance?.usdcBalance || 0).toFixed(2)} USDC`;

  // Currency cards configuration
  const currencyCards = [
    {
      id: "hbar",
      name: "Hedera",
      symbol: "HBAR",
      icon: "/hedera.svg",
      balance: walletData.balanceHbar,
      displayBalance: `${walletData.balanceHbar.toFixed(4)} ℏ`,
      gradient: "from-purple-500 to-indigo-600",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      // No secondary info - shows only HBAR balance
    },
    {
      id: "usdc",
      name: "USD Coin",
      symbol: "USDC",
      icon: "/usdc.svg",
      balance: hederaBalance?.usdcBalance || 0,
      displayBalance: `${(hederaBalance?.usdcBalance || 0).toFixed(2)} USDC`,
      gradient: "from-blue-500 to-cyan-600",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      // No secondary info - shows only USDC balance
    },
    {
      id: currency === "NGN" ? "ngn" : "usd",
      name: "Total Value",
      symbol: currency === "NGN" ? "NGN" : "USD",
      icon: currency === "NGN" ? "/ngn.svg" : "/usd.svg",
      balance: totalPortfolioValue,
      displayBalance:
        currency === "NGN"
          ? `₦${totalPortfolioValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : `$${totalPortfolioValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
      gradient:
        currency === "NGN"
          ? "from-green-500 to-emerald-600"
          : "from-blue-600 to-indigo-700",
      iconBg:
        currency === "NGN"
          ? "bg-green-100 dark:bg-green-900/30"
          : "bg-blue-100 dark:bg-blue-900/30",
      secondaryInfo: portfolioBreakdown,
    },
  ];

  const handleNextCard = () => {
    setActiveCardIndex((prev) => (prev + 1) % currencyCards.length);
  };

  const handlePrevCard = () => {
    setActiveCardIndex(
      (prev) => (prev - 1 + currencyCards.length) % currencyCards.length
    );
  };

  const handleDragEnd = (
    event: any,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const swipeThreshold = 50;
    const swipeVelocityThreshold = 500;

    if (
      info.offset.x > swipeThreshold ||
      info.velocity.x > swipeVelocityThreshold
    ) {
      handlePrevCard();
    } else if (
      info.offset.x < -swipeThreshold ||
      info.velocity.x < -swipeVelocityThreshold
    ) {
      handleNextCard();
    }
  };

  // Filter transactions based on criteria
  const filterTransactions = (filters: FilterOptions) => {
    let filtered = allTransactions;

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.description?.toLowerCase().includes(searchTerm) ||
          tx.method.toLowerCase().includes(searchTerm) ||
          tx.reference?.toLowerCase().includes(searchTerm) ||
          tx.hash?.toLowerCase().includes(searchTerm)
      );
    }

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter((tx) => tx.type === filters.type);
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((tx) => tx.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((tx) => new Date(tx.timestamp) >= filterDate);
    }

    setFilteredTransactions(filtered);
  };

  // Initialize filtered transactions
  useEffect(() => {
    setFilteredTransactions(allTransactions || []);
  }, [allTransactions?.length]); // Only depend on the length, not the entire array

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

  const getStatusIconBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <div className="w-4 h-4 rounded-full bg-green-900 flex items-center justify-center border border-green-500 dark:border-green-600">
            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
          </div>
        );
      case "pending":
        return (
          <div className="w-4 h-4 rounded-full bg-yellow-900 flex items-center justify-center border border-yellow-500 dark:border-yellow-600">
            <Clock className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
          </div>
        );
      case "failed":
        return (
          <div className="w-4 h-4 rounded-full bg-red-900 flex items-center justify-center border border-red-500 dark:border-red-600">
            <X className="h-3 w-3 text-red-600 dark:text-red-400" />
          </div>
        );
      default:
        return null;
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
            <CurrencyToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleSyncBalance();
                refetchTransactions();
              }}
              disabled={
                isSyncing || transactionsLoading || !user?.hedera_account_id
              }
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isSyncing || transactionsLoading ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">
                {isSyncing || transactionsLoading ? "Syncing..." : "Sync All"}
              </span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowFundModal(true)}
              disabled={!user?.hedera_account_id}
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Fund HBAR</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/wallet/withdraw")}
              disabled={!user?.hedera_account_id || stats.walletBalance <= 0}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Withdraw</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/wallet/settings")}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </div>

        {/* Wallet Funding Warning */}
        <WalletFundingInfo />

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Animated Currency Card Stack - Natural order: HBAR, USDC, Total Value */}
          <div className="md:col-span-2 relative">
            <div className="relative h-[180px] perspective-1000">
              {currencyCards.map((card, displayIndex) => {
                // Use natural order for cards
                const originalIndex = displayIndex;
                const offset = originalIndex - activeCardIndex;
                const isActive = originalIndex === activeCardIndex;
                const isVisible = Math.abs(offset) <= 1;

                return (
                  <motion.div
                    key={card.id}
                    initial={false}
                    animate={{
                      x: offset * 28,
                      y: offset * -12,
                      scale: isActive ? 1 : 0.95 - Math.abs(offset) * 0.05,
                      opacity: isActive ? 1 : 0.7,
                      zIndex: 10 - Math.abs(offset),
                      rotateY: offset * -6,
                    }}
                    drag={isActive ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.5}
                    onDragEnd={isActive ? handleDragEnd : undefined}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                    className="absolute top-0 left-0 w-full cursor-grab active:cursor-grabbing"
                    style={{
                      pointerEvents: isActive ? "auto" : "none",
                      display: isVisible ? "block" : "none",
                    }}
                  >
                    <Card
                      className={`h-[180px] overflow-hidden bg-gradient-to-br ${card.gradient} text-white border-0 shadow-lg hover:shadow-xl transition-shadow`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div
                                className={`w-12 h-12 rounded-full ${card.iconBg} flex items-center justify-center`}
                              >
                                <img
                                  src={card.icon}
                                  alt={card.symbol}
                                  className="w-7 h-7 object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.parentElement!.innerHTML = `<span class="text-xl font-bold">${card.symbol[0]}</span>`;
                                  }}
                                />
                              </div>
                              {/* Hedera badge for USDC to show it's HUSDC */}
                              {card.id === "usdc" && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white bg-gray-800 flex items-center justify-center border-2 border-blue-500 shadow-sm">
                                  <img
                                    src="/hedera.svg"
                                    alt="Hedera"
                                    className="w-3 h-3 object-contain"
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-sm font-medium text-white/90">
                                {card.name}
                              </CardTitle>
                              <p className="text-xs text-white/70">
                                {card.symbol}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowBalance(!showBalance);
                            }}
                            className="text-white hover:bg-white/20"
                          >
                            {showBalance ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-3xl font-bold mb-1">
                          {showBalance ? card.displayBalance : "••••••"}
                        </div>
                        {card.secondaryInfo && (
                          <p className="text-sm text-white/80">
                            {showBalance ? card.secondaryInfo : "••••"}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation Indicators */}
            <div className="flex justify-center gap-2 mt-0 hidden">
              {currencyCards.map((card, index) => (
                <button
                  type="button"
                  key={card.id}
                  onClick={() => setActiveCardIndex(index)}
                  aria-label={`Show ${card.name} card`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeCardIndex
                      ? "bg-primary w-8"
                      : "bg-muted-foreground/30 w-2"
                  }`}
                />
              ))}
            </div>
          </div>

          <motion.div whileHover="hover" className="cursor-pointer">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col items-start gap-2">
                  <motion.div
                    variants={{
                      hover: {
                        y: -8,
                        transition: { duration: 0.3 },
                      },
                    }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full w-10 h-10 flex items-center justify-center border border-green-200 dark:border-green-700"
                  >
                    <ArrowUpDown className="h-4 w-4 text-green-600 rotate-180" />
                  </motion.div>
                  <CardTitle className="text-sm font-medium">
                    Total Deposited
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatAmount(
                    walletData.totalDeposited,
                    walletData.totalDeposited /
                      (hederaBalance?.exchangeRates?.usdToNgn || 1500)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Lifetime deposits
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover="hover" className="cursor-pointer">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col items-start gap-2">
                  <motion.div
                    variants={{
                      hover: {
                        y: 8,
                        transition: { duration: 0.3 },
                      },
                    }}
                    className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-full w-10 h-10 flex items-center justify-center border border-red-200 dark:border-red-700"
                  >
                    <ArrowUpDown className="h-4 w-4 text-red-600" />
                  </motion.div>
                  <CardTitle className="text-sm font-medium">
                    Total Withdrawn
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatAmount(
                    walletData.totalWithdrawn,
                    walletData.totalWithdrawn /
                      (hederaBalance?.exchangeRates?.usdToNgn || 1500)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Lifetime withdrawals
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="transactions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="transactions" className="gap-2">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">Transactions</span>
                </TabsTrigger>
                <TabsTrigger value="withdrawals" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Withdrawals</span>
                </TabsTrigger>
                <TabsTrigger value="methods" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Payment Methods</span>
                </TabsTrigger>
                <TabsTrigger value="wallets" className="gap-2">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">Wallets</span>
                </TabsTrigger>
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

                    <div className="space-y-4 overflow-x-hidden">
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
                            {allTransactions.length > 0
                              ? "Try adjusting your filters"
                              : "Your wallet activity will appear here"}
                          </p>
                        </div>
                      ) : (
                        filteredTransactions.slice(0, 50).map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 sm:p-4 border rounded-lg transition-colors group cursor-pointer gap-2 sm:gap-3 overflow-hidden"
                            onClick={() => {
                              window.open(transaction.explorerUrl, "_blank");
                            }}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
                              <div className="relative flex-shrink-0">
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full w-10 h-10 flex items-center justify-center border border-blue-200 dark:border-blue-700">
                                  {getTransactionIcon(transaction.type)}
                                </div>
                                {/* Status icon badge */}
                                <div className="absolute -bottom-0 -right-1">
                                  {getStatusIconBadge(transaction.status)}
                                </div>
                              </div>

                              <div className="min-w-0 flex-1 overflow-hidden">
                                <p className="font-medium capitalize text-sm sm:text-base truncate">
                                  {transaction.type.replace("_", " ")}
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                  {transaction.description ||
                                    transaction.method}
                                </p>
                                {transaction.reference && (
                                  <p className="text-xs text-muted-foreground font-mono flex items-center gap-1 mt-1 hidden sm:flex overflow-hidden">
                                    <Hash className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {transaction.reference.length >= 36
                                        ? `${transaction.reference.substring(
                                            0,
                                            8
                                          )}...${transaction.reference.substring(
                                            transaction.reference.length - 4
                                          )}`
                                        : transaction.reference}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end text-right flex-shrink-0 min-w-0 max-w-[140px] sm:max-w-none">
                              <p
                                className={`font-semibold text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis ${
                                  transaction.direction === "incoming"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {transaction.direction === "incoming"
                                  ? "+"
                                  : "-"}
                                {transaction.currency === "HBAR"
                                  ? `${transaction.amount.toFixed(4)} ℏ`
                                  : transaction.currency === "USDC"
                                  ? `${transaction.amount.toFixed(2)} USDC`
                                  : transaction.currency === "NGN"
                                  ? `₦${transaction.amount.toLocaleString()}`
                                  : `${transaction.amount} ${transaction.currency}`}
                              </p>
                              {/* Show converted amount in user's preferred currency */}
                              {transaction.currency === "HBAR" &&
                                hederaBalance?.exchangeRates && (
                                  <p className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                                    ≈{" "}
                                    {formatAmount(
                                      transaction.amount *
                                        hederaBalance.exchangeRates.hbarToUsd *
                                        hederaBalance.exchangeRates.usdToNgn,
                                      transaction.amount *
                                        hederaBalance.exchangeRates.hbarToUsd
                                    )}
                                  </p>
                                )}
                              {transaction.currency === "USDC" &&
                                hederaBalance?.exchangeRates && (
                                  <p className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                                    ≈{" "}
                                    {formatAmount(
                                      transaction.amount *
                                        hederaBalance.exchangeRates.usdToNgn,
                                      transaction.amount
                                    )}
                                  </p>
                                )}
                              {transaction.currency === "NGN" &&
                                currency === "USD" &&
                                hederaBalance?.exchangeRates && (
                                  <p className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                                    ≈ $
                                    {(
                                      transaction.amount /
                                      hederaBalance.exchangeRates.usdToNgn
                                    ).toFixed(2)}
                                  </p>
                                )}
                              <p className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block overflow-hidden text-ellipsis">
                                {(() => {
                                  const date = new Date(transaction.timestamp);
                                  return isNaN(date.getTime())
                                    ? "—"
                                    : date.toLocaleString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      });
                                })()}
                              </p>
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

              <TabsContent value="withdrawals" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Withdrawal Requests</CardTitle>
                    <CardDescription>
                      View and manage your withdrawal requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {withdrawalsLoading ? (
                      <div className="text-center py-8">
                        <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                        <p className="text-muted-foreground">
                          Loading withdrawals...
                        </p>
                      </div>
                    ) : !withdrawals || withdrawals.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No withdrawal requests yet</p>
                        <Button
                          className="mt-4"
                          onClick={() => navigate("/wallet/withdraw")}
                          disabled={
                            !user?.hedera_account_id || stats.walletBalance <= 0
                          }
                        >
                          Create Withdrawal Request
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {withdrawals.map((withdrawal: any) => (
                          <div
                            key={withdrawal.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">
                                  ₦
                                  {Number(
                                    withdrawal.amount_ngn
                                  ).toLocaleString()}
                                </p>
                                <Badge
                                  variant="secondary"
                                  className={
                                    withdrawal.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : withdrawal.status === "failed"
                                      ? "bg-red-100 text-red-800"
                                      : withdrawal.status === "cancelled"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {withdrawal.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {withdrawal.withdrawal_method.replace("_", " ")}{" "}
                                •{" "}
                                {new Date(
                                  withdrawal.created_at
                                ).toLocaleDateString()}
                              </p>
                              {withdrawal.failure_reason && (
                                <p className="text-xs text-red-600 mt-1">
                                  {withdrawal.failure_reason}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {withdrawal.status === "pending" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    cancelWithdrawal(withdrawal.id)
                                  }
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                            <div className="flex items-center justify-center w-[48px] h-[48px] rounded-full bg-muted">
                              <CreditCard className="h-5 w-5 text-muted-foreground" />
                            </div>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                          <Button
                            onClick={() =>
                              (window.location.href = "/wallet/setup")
                            }
                          >
                            Connect Wallet
                          </Button>
                        </div>
                      ) : (
                        connectedWallets.map((wallet, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3"
                          >
                            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center border border-blue-200 dark:border-blue-700">
                                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium text-sm sm:text-base">
                                    {wallet.name}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                      wallet.type === "custodial"
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                        : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                    }`}
                                  >
                                    {wallet.type === "custodial"
                                      ? "Custodial"
                                      : "External"}
                                  </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground font-mono truncate">
                                  {wallet.address.length > 20
                                    ? `${wallet.address.substring(
                                        0,
                                        window.innerWidth >= 640 ? 10 : 6
                                      )}...${wallet.address.substring(
                                        wallet.address.length -
                                          (window.innerWidth >= 640 ? 10 : 6)
                                      )}`
                                    : wallet.address}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 justify-end sm:justify-start flex-shrink-0">
                              <Badge
                                variant="secondary"
                                className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-300 text-xs"
                              >
                                Connected
                              </Badge>
                              {wallet.type === "external" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => disconnectExternalWallet()}
                                  className="text-xs sm:text-sm"
                                >
                                  <span className="hidden sm:inline">
                                    Disconnect
                                  </span>
                                  <span className="sm:hidden">DC</span>
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
              <CardContent>
                <div className="flex justify-around gap-4">
                  <button
                    type="button"
                    className="flex flex-col items-center gap-2"
                    onClick={() => {
                      toast({
                        title: "Swap",
                        description: "Swap functionality coming soon",
                      });
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                      <ArrowLeftRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-medium">Swap</span>
                  </button>

                  <button
                    type="button"
                    className="flex flex-col items-center gap-2"
                    onClick={() => navigate("/wallet/withdraw")}
                    disabled={
                      !user?.hedera_account_id || stats.walletBalance <= 0
                    }
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-700 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                      <Download className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-xs font-medium">Withdraw</span>
                  </button>

                  <button
                    type="button"
                    className="flex flex-col items-center gap-2"
                    onClick={() => setShowFundModal(true)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                      <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-xs font-medium">Fund</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Your Wallet Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                    <Wallet2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-mono break-all flex items-center gap-2 justify-between">
                      <span>{walletData.walletAddress}</span>

                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <AlertCircle className="h-4 w-4 text-amber-500 cursor-pointer" />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                              Important Warning
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Only send{" "}
                              <span className="font-semibold text-foreground">
                                HBAR
                              </span>{" "}
                              and{" "}
                              <span className="font-semibold text-foreground">
                                HUSDC
                              </span>{" "}
                              (Hedera USDC) to this wallet address. Sending
                              other tokens may result in permanent loss of
                              funds.
                            </p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
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

      {/* Fund HBAR Modal */}
      <FundHbarModal
        open={showFundModal}
        onOpenChange={setShowFundModal}
        hederaAccountId={user?.hedera_account_id}
      />
    </div>
  );
};

export default WalletDashboard;
