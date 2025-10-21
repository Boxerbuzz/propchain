import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import {
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
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useCurrency } from "@/context/CurrencyContext";
import { useWalletTransactions } from "@/hooks/useWalletTransactions";

export default function AccountDashboard() {
  const navigate = useNavigate();
  const [showBalances, setShowBalances] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const { balance: hederaBalance, syncBalance, isSyncing } = useWalletBalance();
  const { currency, formatAmount } = useCurrency();
  const { transactions: allTransactions } = useWalletTransactions();

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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send":
        return <Send className="h-4 w-4" />;
      case "receive":
        return <Download className="h-4 w-4" />;
      case "swap":
        return <ArrowLeftRight className="h-4 w-4" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <div className="w-4 h-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border-2 border-green-500 shadow-sm">
            <Check className="h-2.5 w-2.5 text-green-600 dark:text-green-400" />
          </div>
        );
      case "pending":
        return (
          <div className="w-4 h-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border-2 border-yellow-500 shadow-sm">
            <Clock className="h-2.5 w-2.5 text-yellow-600 dark:text-yellow-400" />
          </div>
        );
      case "failed":
        return (
          <div className="w-4 h-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border-2 border-red-500 shadow-sm">
            <XIcon className="h-2.5 w-2.5 text-red-600 dark:text-red-400" />
          </div>
        );
      default:
        return null;
    }
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

  // Map all real transactions to simple display format
  const displayTransactions = (allTransactions || [])
    .map((tx) => {
      let simpleType: "send" | "receive";
      if (tx.type === "investment" || tx.type === "withdrawal" || tx.type === "token_withdrawal") {
        simpleType = "send";
      } else {
        simpleType = "receive";
      }

      const status = tx.status === "completed" ? "completed" : tx.status === "failed" ? "failed" : "pending";

      let details = "";
      if (tx.type === "investment") {
        details = tx.description || "Investment";
      } else if (tx.type === "dividend") {
        details = tx.description || "Dividend";
      } else if (tx.type === "withdrawal") {
        details = tx.description || "Bank account";
      } else if (tx.type === "deposit" || tx.type === "token_deposit") {
        details = tx.description || "Received";
      } else {
        details = tx.description || "";
      }

      return {
        id: tx.id,
        type: simpleType,
        status,
        token: tx.currency || "HBAR",
        amount: tx.amount || 0,
        to: simpleType === "send" ? details : undefined,
        from: simpleType === "receive" ? details : undefined,
        timestamp: tx.timestamp,
        hash: tx.hash || tx.reference || tx.explorerUrl || "",
      };
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  // Filter today's transactions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTransactions = displayTransactions.filter((tx) => {
    const txDate = new Date(tx.timestamp);
    txDate.setHours(0, 0, 0, 0);
    return txDate.getTime() === today.getTime();
  });

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
              <span className="hidden sm:inline text-xs sm:text-sm">
                Tokens
              </span>
            </TabsTrigger>
            <TabsTrigger value="nfts" className="gap-1 sm:gap-2 px-2 sm:px-3">
              <Image className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline text-xs sm:text-sm">NFTs</span>
            </TabsTrigger>
            <TabsTrigger value="defi" className="gap-1 sm:gap-2 px-2 sm:px-3">
              <CircleDollarSign className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline text-xs sm:text-sm">DeFi</span>
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <Receipt className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline text-xs sm:text-sm">
                Transactions
              </span>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Today's NFT Activity</CardTitle>
                <Button
                  variant="link"
                  onClick={() => navigate("/account/transactions")}
                  className="text-sm"
                >
                  View All →
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No NFT activity today
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DeFi Tab */}
          <TabsContent value="defi">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Today's DeFi Activity</CardTitle>
                <Button
                  variant="link"
                  onClick={() => navigate("/account/transactions")}
                  className="text-sm"
                >
                  View All →
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No DeFi activity today
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Today's Transactions</CardTitle>
                <Button
                  variant="link"
                  onClick={() => navigate("/account/transactions")}
                  className="text-sm"
                >
                  View All →
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {todayTransactions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No transactions today
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {todayTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_140px_180px] items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (tx.hash) {
                          window.open(
                            `https://hashscan.io/testnet/transaction/${tx.hash}`,
                            "_blank"
                          );
                        }
                      }}
                    >
                      {/* Column 1: Icon with Status Badge */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-700">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5">
                          {getStatusBadge(tx.status)}
                        </div>
                      </div>

                      {/* Column 2: Type & Details */}
                      <div className="min-w-0">
                        <p className="font-medium capitalize">{tx.type}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {tx.type === "send"
                            ? `To: ${tx.to}`
                            : tx.type === "receive"
                            ? `From: ${tx.from}`
                            : ""}
                        </p>
                      </div>

                      {/* Column 3: Timestamp - Hidden on mobile */}
                      <div className="hidden sm:block text-center">
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* Column 4: Amount & Token */}
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            tx.type === "receive"
                              ? "text-green-600"
                              : tx.type === "send"
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {tx.type === "receive"
                            ? "+"
                            : tx.type === "send"
                            ? "-"
                            : ""}
                          {showBalances ? (
                            <>
                              {tx.amount} {tx.token}
                            </>
                          ) : (
                            <span>••••</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.token}
                        </p>
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
