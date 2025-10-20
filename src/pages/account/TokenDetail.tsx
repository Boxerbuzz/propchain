import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  History,
  Users,
  Info,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

export default function TokenDetail() {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const { formatAmount } = useCurrency();
  const [timeframe, setTimeframe] = useState("24h");

  // Mock token data (would come from API in production)
  const tokenData = {
    id: tokenId,
    name: "Lekki Phase 1 Apartment",
    symbol: "LKAP01",
    icon: "/placeholder.svg",
    price: 125000,
    priceUsd: 150,
    change24h: 5.2,
    marketCap: 45000000,
    marketCapUsd: 54000,
    volume24h: 2500000,
    volume24hUsd: 3000,
    totalSupply: 10000,
    circulatingSupply: 8500,
    holders: 234,
    description:
      "Tokenized ownership of a luxury apartment in Lekki Phase 1, Lagos. This property offers rental income distribution and capital appreciation potential.",
    propertyType: "Residential",
    location: "Lekki Phase 1, Lagos",
    tokenizationType: "Equity",
  };

  // Mock chart data
  const chartData = {
    "24h": [
      120, 122, 121, 124, 123, 126, 125, 128, 127, 130, 129, 132, 131, 134, 132,
      135, 133, 136, 135, 125,
    ],
    "7d": [
      110, 112, 115, 113, 118, 120, 122, 125, 123, 128, 130, 132, 128, 125,
    ],
    "30d": [100, 105, 103, 108, 112, 115, 118, 120, 125, 123, 128, 125],
    "1y": [80, 85, 90, 95, 100, 105, 110, 115, 120, 125],
  };

  // Mock recent trades
  const recentTrades = [
    {
      id: "1",
      type: "buy",
      amount: 50,
      price: 125500,
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      type: "sell",
      amount: 25,
      price: 125000,
      timestamp: new Date(Date.now() - 600000),
    },
    {
      id: "3",
      type: "buy",
      amount: 100,
      price: 124800,
      timestamp: new Date(Date.now() - 900000),
    },
    {
      id: "4",
      type: "sell",
      amount: 75,
      price: 124500,
      timestamp: new Date(Date.now() - 1200000),
    },
    {
      id: "5",
      type: "buy",
      amount: 30,
      price: 124000,
      timestamp: new Date(Date.now() - 1500000),
    },
  ];

  const currentChartData = chartData[timeframe as keyof typeof chartData];

  const PriceChart = () => {
    const data = currentChartData;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const path = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 90;
        return `${index === 0 ? "M" : "L"} ${x},${y}`;
      })
      .join(" ");

    return (
      <svg
        width="100%"
        height="200"
        className="w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor={tokenData.change24h > 0 ? "#16a34a" : "#ef4444"}
              stopOpacity="0.2"
            />
            <stop
              offset="100%"
              stopColor={tokenData.change24h > 0 ? "#16a34a" : "#ef4444"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        <path d={`${path} L 100,100 L 0,100 Z`} fill="url(#priceGradient)" />
        <path
          d={path}
          fill="none"
          stroke={tokenData.change24h > 0 ? "#16a34a" : "#ef4444"}
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/account/discovery")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discovery
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                      <img
                        src={tokenData.icon}
                        alt={tokenData.symbol}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border-2 border-purple-500 shadow-sm">
                      <img
                        src="/hedera.svg"
                        alt="Hedera"
                        className="w-3.5 h-3.5"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-1">
                      {tokenData.name}
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-muted-foreground">
                        {tokenData.symbol}
                      </p>
                      <Badge variant="secondary">
                        {tokenData.propertyType}
                      </Badge>
                      <Badge variant="outline">
                        {tokenData.tokenizationType}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-4xl font-bold">
                      {formatAmount(tokenData.price, tokenData.priceUsd)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={
                          tokenData.change24h > 0 ? "default" : "destructive"
                        }
                        className="gap-1"
                      >
                        {tokenData.change24h > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {tokenData.change24h > 0 ? "+" : ""}
                        {tokenData.change24h}%
                      </Badge>
                      <span className="text-sm text-muted-foreground">24h</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Price Chart</CardTitle>
                  <div className="flex gap-2">
                    {["24h", "7d", "30d", "1y"].map((tf) => (
                      <Button
                        key={tf}
                        variant={timeframe === tf ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeframe(tf)}
                      >
                        {tf}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <PriceChart />
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="trades">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="trades">
                  <History className="h-4 w-4 mr-2" />
                  Trades
                </TabsTrigger>
                <TabsTrigger value="holders">
                  <Users className="h-4 w-4 mr-2" />
                  Holders
                </TabsTrigger>
                <TabsTrigger value="about">
                  <Info className="h-4 w-4 mr-2" />
                  About
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trades">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Trades</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {recentTrades.map((trade) => (
                        <div
                          key={trade.id}
                          className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 p-4"
                        >
                          <Badge
                            variant={
                              trade.type === "buy" ? "default" : "destructive"
                            }
                            className="text-xs"
                          >
                            {trade.type.toUpperCase()}
                          </Badge>
                          <div>
                            <p className="font-medium">{trade.amount} tokens</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatAmount(trade.price, trade.price / 1500)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {trade.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="holders">
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      Token Holders
                    </h3>
                    <p className="text-muted-foreground">
                      {tokenData.holders} unique holders
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      About {tokenData.symbol}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {tokenData.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Location
                        </p>
                        <p className="font-medium">{tokenData.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Property Type
                        </p>
                        <p className="font-medium">{tokenData.propertyType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Tokenization
                        </p>
                        <p className="font-medium">
                          {tokenData.tokenizationType}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Network</p>
                        <p className="font-medium flex items-center gap-1">
                          <img
                            src="/hedera.svg"
                            alt="Hedera"
                            className="w-4 h-4"
                          />
                          Hedera
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trading Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Trade {tokenData.symbol}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Buy
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <DollarSign className="h-4 w-4" />
                    Sell
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Token Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Token Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="font-semibold">
                    {formatAmount(tokenData.marketCap, tokenData.marketCapUsd)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="font-semibold">
                    {formatAmount(tokenData.volume24h, tokenData.volume24hUsd)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Total Supply</p>
                  <p className="font-semibold">
                    {tokenData.totalSupply.toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Circulating</p>
                  <p className="font-semibold">
                    {tokenData.circulatingSupply.toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Holders</p>
                  <p className="font-semibold">{tokenData.holders}</p>
                </div>
              </CardContent>
            </Card>

            {/* Property Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Property Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <p className="font-medium">{tokenData.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <p className="font-medium">{tokenData.propertyType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Tokenization Type
                  </p>
                  <p className="font-medium">{tokenData.tokenizationType}</p>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Full Property Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
