import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  ArrowUpDown,
  RefreshCw,
  Eye,
  EyeOff,
  Coins,
  Image,
  CircleDollarSign,
  Receipt,
  Send,
  Download,
  Check,
  Clock,
  X as XIcon,
  ArrowLeftRight,
  Plus,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useCurrency } from "@/context/CurrencyContext";
import { useWalletTransactions } from "@/hooks/useWalletTransactions";
import { TransactionFilters, FilterOptions } from "@/components/TransactionFilters";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountDashboard() {
  const [showBalances, setShowBalances] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const { balance: hederaBalance, syncBalance, isSyncing } = useWalletBalance();
  const { currency, formatAmount } = useCurrency();
  const { transactions: allTransactions, isLoading: isLoadingTransactions } = useWalletTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState(allTransactions);

  const totalValueNgn =
    (hederaBalance?.balanceNgn || 0) + (hederaBalance?.usdcBalanceNgn || 0);
  const totalValueUsd =
    (hederaBalance?.balanceUsd || 0) + (hederaBalance?.usdcBalanceUsd || 0);

  // Calculate transaction summaries
  const transactionSummary = (allTransactions || []).reduce(
    (acc, tx) => {
      let amountInNGN = tx.amount || 0;

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

  // Portfolio breakdown
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
      balance: hederaBalance?.balanceHbar || 0,
      displayBalance: `${(hederaBalance?.balanceHbar || 0).toFixed(4)} ℏ`,
      gradient: "from-purple-500 to-indigo-600",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
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
    },
    {
      id: currency === "NGN" ? "ngn" : "usd",
      name: "Total Value",
      symbol: currency === "NGN" ? "NGN" : "USD",
      icon: currency === "NGN" ? "/ngn.svg" : "/usd.svg",
      balance: currency === "NGN" ? totalValueNgn : totalValueUsd,
      displayBalance:
        currency === "NGN"
          ? `₦${totalValueNgn.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : `$${totalValueUsd.toLocaleString(undefined, {
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

  // Update filtered transactions when transactions change
  useEffect(() => {
    setFilteredTransactions(allTransactions);
  }, [allTransactions]);

  // Filter transactions
  const filterTransactions = (filters: FilterOptions) => {
    let filtered = [...allTransactions];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.description?.toLowerCase().includes(searchLower) ||
          tx.reference?.toLowerCase().includes(searchLower) ||
          tx.hash?.toLowerCase().includes(searchLower) ||
          tx.type.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((tx) => tx.type === filters.type);
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((tx) => tx.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.timestamp);
        
        switch (filters.dateRange) {
          case "today":
            return txDate >= today;
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return txDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return txDate >= monthAgo;
          case "quarter":
            const quarterAgo = new Date(today);
            quarterAgo.setMonth(quarterAgo.getMonth() - 3);
            return txDate >= quarterAgo;
          case "year":
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return txDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    setFilteredTransactions(filtered);
  };

  const getTransactionIcon = (type: string, direction: string) => {
    switch (type) {
      case "investment":
        return <TrendingUp className="h-4 w-4" />;
      case "dividend":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case "deposit":
      case "token_deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case "withdrawal":
      case "token_withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "sync":
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return direction === "incoming" ? (
          <ArrowDownLeft className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowUpRight className="h-4 w-4 text-red-500" />
        );
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { icon: Check, color: "text-green-500" },
      pending: { icon: Clock, color: "text-yellow-500" },
      failed: { icon: XIcon, color: "text-red-500" },
      cancelled: { icon: XIcon, color: "text-gray-500" },
      rejected: { icon: XIcon, color: "text-red-500" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = config.icon;

    return <StatusIcon className={`h-4 w-4 ${config.color}`} />;
  };

  // Mock NFTs data
  const mockNFTs = [
    {
      id: "1",
      name: "PropChain Property #1234",
      collection: "PropChain Real Estate",
      image: "/placeholder.svg",
      floorPrice: 150000,
      lastSale: 145000,
    },
    {
      id: "2",
      name: "Lagos Apartment Token",
      collection: "Premium Properties",
      image: "/placeholder.svg",
      floorPrice: 250000,
      lastSale: null,
    },
    {
      id: "3",
      name: "Abuja Villa Share",
      collection: "PropChain Real Estate",
      image: "/placeholder.svg",
      floorPrice: 500000,
      lastSale: 480000,
    },
  ];

  // Mock DeFi positions
  const mockDeFiPositions = [
    {
      id: "1",
      protocol: "SaucerSwap",
      type: "Liquidity Pool",
      pair: "HBAR/USDC",
      deposited: 1000,
      currentValue: 1050,
      apr: 12.5,
    },
    {
      id: "2",
      protocol: "Stader",
      type: "Staking",
      pair: "HBAR",
      deposited: 5000,
      currentValue: 5125,
      apr: 8.2,
    },
  ];

  // Mock transactions
  const mockTransactions = [
    {
      id: "1",
      type: "send",
      status: "completed",
      token: "HBAR",
      amount: 100,
      to: "0.0.12345",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      hash: "0x1234567890abcdef",
    },
    {
      id: "2",
      type: "receive",
      status: "completed",
      token: "USDC",
      amount: 50,
      from: "0.0.67890",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      hash: "0xabcdef1234567890",
    },
    {
      id: "3",
      type: "send",
      status: "pending",
      token: "HBAR",
      amount: 25,
      to: "0.0.11111",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      hash: "0x9999999900000000",
    },
    {
      id: "4",
      type: "swap",
      status: "completed",
      token: "HBAR",
      amount: 200,
      toToken: "USDC",
      toAmount: 10,
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      hash: "0xaaaaaabbbbbbcccc",
    },
    {
      id: "5",
      type: "receive",
      status: "failed",
      token: "HBAR",
      amount: 75,
      from: "0.0.99999",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      hash: "0xddddddeeeeee1111",
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Overview of your wallet and assets
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncBalance()}
            disabled={isSyncing}
            className="w-full sm:w-auto"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Refresh"}
          </Button>
        </div>

        {/* Wallet Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 md:mb-8">
          {/* Animated Currency Card Stack */}
          <div className="lg:col-span-1 xl:col-span-2 relative">
            <div className="relative h-[180px] perspective-1000 w-full max-w-md lg:max-w-none mx-auto lg:mx-0">
              {currencyCards.map((card, displayIndex) => {
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
                              setShowBalances(!showBalances);
                            }}
                            className="text-white hover:bg-white/20"
                          >
                            {showBalances ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-3xl font-bold mb-1">
                          {showBalances ? card.displayBalance : "••••••"}
                        </div>
                        {card.secondaryInfo && (
                          <p className="text-sm text-white/80">
                            {showBalances ? card.secondaryInfo : "••••"}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Total Deposited Card */}
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
                    transactionSummary.totalDeposited,
                    transactionSummary.totalDeposited /
                      (hederaBalance?.exchangeRates?.usdToNgn || 1500)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Lifetime deposits
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Withdrawn Card */}
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
                    transactionSummary.totalWithdrawn,
                    transactionSummary.totalWithdrawn /
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

        {/* Tabs */}
        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 md:mb-8 h-auto gap-1 p-1">
            <TabsTrigger value="tokens" className="gap-1 sm:gap-2 px-2 sm:px-3">
              <Coins className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline text-xs sm:text-sm">Tokens</span>
            </TabsTrigger>
            <TabsTrigger value="nfts" className="gap-1 sm:gap-2 px-2 sm:px-3">
              <Image className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline text-xs sm:text-sm">NFTs</span>
            </TabsTrigger>
            <TabsTrigger value="defi" className="gap-1 sm:gap-2 px-2 sm:px-3">
              <CircleDollarSign className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline text-xs sm:text-sm">DeFi</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-1 sm:gap-2 px-2 sm:px-3">
              <Receipt className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline text-xs sm:text-sm">Transactions</span>
            </TabsTrigger>
          </TabsList>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {/* HBAR Row */}
                  <div className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_140px_180px] items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    {/* Column 1: Icon */}
                    <img src="/hedera.svg" alt="HBAR" className="w-10 h-10" />

                    {/* Column 2: Name & Symbol */}
                    <div>
                      <p className="font-semibold">Hedera</p>
                      <p className="text-sm text-muted-foreground">HBAR</p>
                    </div>

                    {/* Column 3: Price - Hidden on mobile */}
                    <div className="hidden sm:block text-center text-align-left">
                      <p className="font-medium text-left">
                        {showBalances ? (
                          formatAmount(
                            hederaBalance?.exchangeRates?.hbarToUsd
                              ? hederaBalance.exchangeRates.hbarToUsd *
                                  (hederaBalance?.exchangeRates?.usdToNgn ||
                                    1500)
                              : 0,
                            hederaBalance?.exchangeRates?.hbarToUsd || 0
                          )
                        ) : (
                          <span>••••</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground text-left">
                        Price
                      </p>
                    </div>

                    {/* Column 4: Amount & Equivalent */}
                    <div className="text-right">
                      <p className="font-semibold">
                        {showBalances ? (
                          formatAmount(
                            hederaBalance?.balanceNgn || 0,
                            hederaBalance?.balanceUsd || 0
                          )
                        ) : (
                          <span>••••••</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {showBalances ? (
                          `${(hederaBalance?.balanceHbar || 0).toFixed(4)} ℏ`
                        ) : (
                          <span>••••</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* USDC Row */}
                  <div className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_140px_180px] items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    {/* Column 1: Icon */}
                    <div className="relative">
                      <img src="/usdc.svg" alt="USDC" className="w-10 h-10" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border-2 border-blue-500 shadow-sm">
                        <img
                          src="/hedera.svg"
                          alt="Hedera"
                          className="w-2.5 h-2.5"
                        />
                      </div>
                    </div>

                    {/* Column 2: Name & Symbol */}
                    <div>
                      <p className="font-semibold">USD Coin</p>
                      <p className="text-sm text-muted-foreground">USDC</p>
                    </div>

                    {/* Column 3: Price - Hidden on mobile */}
                    <div className="hidden sm:block text-center text-align-left">
                      <p className="font-medium text-left">
                        {showBalances ? (
                          formatAmount(
                            hederaBalance?.exchangeRates?.usdToNgn || 1500,
                            1.0
                          )
                        ) : (
                          <span>••••</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground text-left">
                        Price
                      </p>
                    </div>

                    {/* Column 4: Amount & Equivalent */}
                    <div className="text-right">
                      <p className="font-semibold">
                        {showBalances ? (
                          formatAmount(
                            hederaBalance?.usdcBalanceNgn || 0,
                            hederaBalance?.usdcBalanceUsd || 0
                          )
                        ) : (
                          <span>••••••</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {showBalances ? (
                          `${(hederaBalance?.usdcBalance || 0).toFixed(2)} USDC`
                        ) : (
                          <span>••••</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NFTs Tab */}
          <TabsContent value="nfts">
            <div className="grid md:grid-cols-3 gap-4">
              {mockNFTs.map((nft) => (
                <Card
                  key={nft.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-semibold truncate">{nft.name}</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {nft.collection}
                      </p>
                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground">Floor</p>
                          <p className="font-medium">
                            {showBalances
                              ? formatAmount(
                                  nft.floorPrice,
                                  nft.floorPrice / 1500
                                )
                              : "••••"}
                          </p>
                        </div>
                        {nft.lastSale && (
                          <div className="text-right">
                            <p className="text-muted-foreground">Last Sale</p>
                            <p className="font-medium">
                              {showBalances
                                ? formatAmount(
                                    nft.lastSale,
                                    nft.lastSale / 1500
                                  )
                                : "••••"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* DeFi Tab */}
          <TabsContent value="defi">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {mockDeFiPositions.map((position) => (
                    <div
                      key={position.id}
                      className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_140px_180px] items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      {/* Column 1: Icon */}
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center">
                        <CircleDollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>

                      {/* Column 2: Protocol & Type */}
                      <div>
                        <p className="font-semibold">{position.protocol}</p>
                        <p className="text-sm text-muted-foreground">
                          {position.type} • {position.pair}
                        </p>
                      </div>

                      {/* Column 3: APR - Hidden on mobile */}
                      <div className="hidden sm:block text-center">
                        <Badge variant="secondary" className="text-xs">
                          {position.apr}% APR
                        </Badge>
                      </div>

                      {/* Column 4: Value & P/L */}
                      <div className="text-right">
                        <p className="font-semibold">
                          {showBalances
                            ? formatAmount(
                                position.currentValue * 1500,
                                position.currentValue
                              )
                            : "••••••"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {showBalances ? (
                            <span
                              className={
                                position.currentValue > position.deposited
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {position.currentValue > position.deposited
                                ? "+"
                                : ""}
                              {(
                                ((position.currentValue - position.deposited) /
                                  position.deposited) *
                                100
                              ).toFixed(2)}
                              %
                            </span>
                          ) : (
                            <span>••••</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DeFi Tab */}
          <TabsContent value="defi">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {mockDeFiPositions.map((position) => (
                    <div
                      key={position.id}
                      className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_140px_180px] items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      {/* Column 1: Icon */}
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center">
                        <CircleDollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>

                      {/* Column 2: Protocol & Type */}
                      <div>
                        <p className="font-semibold">{position.protocol}</p>
                        <p className="text-sm text-muted-foreground">
                          {position.type} • {position.pair}
                        </p>
                      </div>

                      {/* Column 3: APR - Hidden on mobile */}
                      <div className="hidden sm:block text-center">
                        <Badge variant="secondary" className="text-xs">
                          {position.apr}% APR
                        </Badge>
                      </div>

                      {/* Column 4: Value & P/L */}
                      <div className="text-right">
                        <p className="font-semibold">
                          {showBalances
                            ? formatAmount(
                                position.currentValue * 1500,
                                position.currentValue
                              )
                            : "••••••"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {showBalances ? (
                            <span
                              className={
                                position.currentValue > position.deposited
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {position.currentValue > position.deposited
                                ? "+"
                                : ""}
                              {(
                                ((position.currentValue - position.deposited) /
                                  position.deposited) *
                                100
                              ).toFixed(2)}
                              %
                            </span>
                          ) : (
                            <span>••••</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <TransactionFilters
              onFilter={filterTransactions}
              totalCount={allTransactions.length}
              filteredCount={filteredTransactions.length}
            />

            {isLoadingTransactions ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/4" />
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {allTransactions.length === 0
                      ? "No transactions yet"
                      : "No transactions match your filters"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredTransactions.map((transaction) => (
                <Card
                  key={transaction.id}
                  className={cn(
                    "transition-colors",
                    transaction.explorerUrl && "cursor-pointer hover:border-primary/50"
                  )}
                  onClick={() => {
                    if (transaction.explorerUrl) {
                      window.open(transaction.explorerUrl, "_blank");
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-full bg-primary/10">
                          {getTransactionIcon(transaction.type, transaction.direction)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {transaction.description || transaction.type}
                            </p>
                            {getStatusBadge(transaction.status)}
                            {transaction.explorerUrl && (
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{new Date(transaction.timestamp).toLocaleString()}</span>
                            {transaction.reference && (
                              <>
                                <span>•</span>
                                <span className="truncate">
                                  Ref: {transaction.reference}
                                </span>
                              </>
                            )}
                          </div>
                          {transaction.method && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {transaction.method}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p
                          className={cn(
                            "font-medium",
                            transaction.direction === "incoming"
                              ? "text-green-500"
                              : "text-foreground"
                          )}
                        >
                          {transaction.direction === "incoming" ? "+" : "-"}
                          {transaction.amount.toLocaleString()} {transaction.currency}
                        </p>
                        {transaction.hash && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {transaction.hash.slice(0, 6)}...{transaction.hash.slice(-4)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground capitalize mt-1">
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
