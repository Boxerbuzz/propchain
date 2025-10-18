import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  TrendingUp,
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
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useCurrency } from "@/context/CurrencyContext";

export default function AccountDashboard() {
  const [showBalances, setShowBalances] = useState(true);
  const { balance: hederaBalance, syncBalance, isSyncing } = useWalletBalance();
  const { formatAmount } = useCurrency();

  const totalValueNgn = (hederaBalance?.balanceNgn || 0) + (hederaBalance?.usdcBalanceNgn || 0);
  const totalValueUsd = (hederaBalance?.balanceUsd || 0) + (hederaBalance?.usdcBalanceUsd || 0);

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

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your wallet and assets
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncBalance()}
            disabled={isSyncing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Refresh"}
          </Button>
        </div>

        {/* Total Balance */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Balance
                  </p>
                  <p className="text-4xl font-bold">
                    {showBalances ? (
                      formatAmount(totalValueNgn, totalValueUsd)
                    ) : (
                      <span>••••••</span>
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBalances(!showBalances)}
              >
                {showBalances ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="tokens" className="gap-2">
              <Coins className="h-4 w-4" />
              <span className="hidden sm:inline">Tokens</span>
            </TabsTrigger>
            <TabsTrigger value="nfts" className="gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">NFTs</span>
            </TabsTrigger>
            <TabsTrigger value="defi" className="gap-2">
              <CircleDollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">DeFi</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
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
                    <div className="hidden sm:block text-center">
                      <p className="font-medium">
                        {showBalances ? (
                          formatAmount(
                            hederaBalance?.exchangeRates?.hbarToUsd 
                              ? (hederaBalance.exchangeRates.hbarToUsd * (hederaBalance?.exchangeRates?.usdToNgn || 1500))
                              : 0,
                            hederaBalance?.exchangeRates?.hbarToUsd || 0
                          )
                        ) : (
                          <span>••••</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">Price</p>
                    </div>
                    
                    {/* Column 4: Amount & Equivalent */}
                    <div className="text-right">
                      <p className="font-semibold">
                        {showBalances ? (
                          formatAmount(hederaBalance?.balanceNgn || 0, hederaBalance?.balanceUsd || 0)
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
                        <img src="/hedera.svg" alt="Hedera" className="w-2.5 h-2.5" />
                      </div>
                    </div>
                    
                    {/* Column 2: Name & Symbol */}
                    <div>
                      <p className="font-semibold">USD Coin</p>
                      <p className="text-sm text-muted-foreground">USDC</p>
                    </div>
                    
                    {/* Column 3: Price - Hidden on mobile */}
                    <div className="hidden sm:block text-center">
                      <p className="font-medium">
                        {showBalances ? (
                          formatAmount(
                            hederaBalance?.exchangeRates?.usdToNgn || 1500,
                            1.00
                          )
                        ) : (
                          <span>••••</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">Price</p>
                    </div>
                    
                    {/* Column 4: Amount & Equivalent */}
                    <div className="text-right">
                      <p className="font-semibold">
                        {showBalances ? (
                          formatAmount(hederaBalance?.usdcBalanceNgn || 0, hederaBalance?.usdcBalanceUsd || 0)
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
                <Card key={nft.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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
                              ? formatAmount(nft.floorPrice, nft.floorPrice / 1500)
                              : "••••"}
                          </p>
                        </div>
                        {nft.lastSale && (
                          <div className="text-right">
                            <p className="text-muted-foreground">Last Sale</p>
                            <p className="font-medium">
                              {showBalances
                                ? formatAmount(nft.lastSale, nft.lastSale / 1500)
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
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {mockTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_140px_180px] items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
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
                            : tx.type === "swap"
                            ? `${tx.amount} ${tx.token} → ${tx.toAmount} ${tx.toToken}`
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
                          {tx.type === "receive" ? "+" : tx.type === "send" ? "-" : ""}
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
                          {tx.type === "swap" && tx.toToken && (
                            <span> → {tx.toToken}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

