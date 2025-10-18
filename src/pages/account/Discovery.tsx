import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Flame,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";

export default function Discovery() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { formatAmount } = useCurrency();

  const filters = [
    {
      id: "popular",
      name: "Popular",
      icon: Trophy,
    },
    {
      id: "trending",
      name: "Trending",
      icon: Flame,
    },
    {
      id: "gainers",
      name: "Gainers",
      icon: TrendingUp,
    },
    {
      id: "losers",
      name: "Losers",
      icon: TrendingDown,
    },
  ];

  // Mock property tokens (expanded for pagination)
  const allPropertyTokens = [
    {
      id: "1",
      name: "Lekki Phase 1 Apartment",
      symbol: "LKAP01",
      icon: "/placeholder.svg",
      price: 125000,
      priceUsd: 150,
      change24h: 5.2,
      marketCap: 45000000,
      marketCapUsd: 54000,
      chartData: [20, 22, 21, 24, 23, 26, 25, 28, 27, 30, 29, 32, 31, 35, 32],
    },
    {
      id: "2",
      name: "Victoria Island Office",
      symbol: "VIOF01",
      icon: "/placeholder.svg",
      price: 350000,
      priceUsd: 420,
      change24h: -2.1,
      marketCap: 125000000,
      marketCapUsd: 150000,
      chartData: [45, 44, 42, 41, 40, 39, 38, 37, 35, 34, 33, 33, 32, 32, 32],
    },
    {
      id: "3",
      name: "Abuja Estate Share",
      symbol: "ABES01",
      icon: "/placeholder.svg",
      price: 85000,
      priceUsd: 102,
      change24h: 8.7,
      marketCap: 28000000,
      marketCapUsd: 33600,
      chartData: [15, 16, 18, 19, 20, 22, 23, 25, 26, 27, 28, 30, 31, 32, 32],
    },
    {
      id: "4",
      name: "Ikoyi Luxury Villa",
      symbol: "IKLV01",
      icon: "/placeholder.svg",
      price: 550000,
      priceUsd: 660,
      change24h: 1.5,
      marketCap: 185000000,
      marketCapUsd: 222000,
      chartData: [50, 50, 51, 51, 52, 52, 51, 51, 53, 53, 54, 54, 55, 55, 55],
    },
    {
      id: "5",
      name: "Lagos Mainland Duplex",
      symbol: "LMDU01",
      icon: "/placeholder.svg",
      price: 95000,
      priceUsd: 114,
      change24h: -5.3,
      marketCap: 32000000,
      marketCapUsd: 38400,
      chartData: [28, 27, 27, 25, 24, 23, 23, 22, 21, 20, 20, 19, 19, 19, 19],
    },
    {
      id: "6",
      name: "Port Harcourt Commercial",
      symbol: "PHCO01",
      icon: "/placeholder.svg",
      price: 180000,
      priceUsd: 216,
      change24h: 3.8,
      marketCap: 68000000,
      marketCapUsd: 81600,
      chartData: [25, 26, 27, 28, 28, 29, 30, 31, 32, 32, 33, 34, 35, 35, 36],
    },
    {
      id: "7",
      name: "Kaduna Residential Plot",
      symbol: "KDRE01",
      icon: "/placeholder.svg",
      price: 65000,
      priceUsd: 78,
      change24h: -1.2,
      marketCap: 22000000,
      marketCapUsd: 26400,
      chartData: [18, 18, 17, 17, 16, 16, 16, 15, 15, 15, 14, 14, 14, 14, 14],
    },
    {
      id: "8",
      name: "Banana Island Penthouse",
      symbol: "BIPE01",
      icon: "/placeholder.svg",
      price: 850000,
      priceUsd: 1020,
      change24h: 12.4,
      marketCap: 295000000,
      marketCapUsd: 354000,
      chartData: [60, 62, 65, 67, 70, 72, 75, 78, 80, 83, 85, 88, 90, 92, 95],
    },
    {
      id: "9",
      name: "Enugu Shopping Plaza",
      symbol: "ENSP01",
      icon: "/placeholder.svg",
      price: 220000,
      priceUsd: 264,
      change24h: -3.7,
      marketCap: 78000000,
      marketCapUsd: 93600,
      chartData: [40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26],
    },
    {
      id: "10",
      name: "Ibadan Industrial Hub",
      symbol: "IBIH01",
      icon: "/placeholder.svg",
      price: 145000,
      priceUsd: 174,
      change24h: 6.1,
      marketCap: 52000000,
      marketCapUsd: 62400,
      chartData: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    },
    {
      id: "11",
      name: "Calabar Beach Resort",
      symbol: "CBRE01",
      icon: "/placeholder.svg",
      price: 320000,
      priceUsd: 384,
      change24h: 9.2,
      marketCap: 112000000,
      marketCapUsd: 134400,
      chartData: [35, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59, 61, 63],
    },
    {
      id: "12",
      name: "Kano Trade Center",
      symbol: "KNTC01",
      icon: "/placeholder.svg",
      price: 175000,
      priceUsd: 210,
      change24h: -0.8,
      marketCap: 58000000,
      marketCapUsd: 69600,
      chartData: [30, 30, 29, 29, 28, 28, 28, 27, 27, 27, 26, 26, 26, 26, 25],
    },
  ];

  // Pagination
  const totalPages = Math.ceil(allPropertyTokens.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTokens = allPropertyTokens.slice(startIndex, endIndex);

  const MiniChart = ({ data, isPositive }: { data: number[]; isPositive: boolean }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const path = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 18;
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(" ");

    return (
      <svg width="60" height="20" className="inline-block" viewBox="0 0 60 20">
        <path
          d={path}
          fill="none"
          stroke={isPositive ? "#16a34a" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Discovery</h1>
          <p className="text-muted-foreground">
            Explore and trade property tokens on the secondary market
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.id)}
              className="gap-2"
            >
              <filter.icon className="h-4 w-4" />
              {filter.name}
            </Button>
          ))}
        </div>

        {/* Property Tokens List */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {currentTokens.map((token) => (
                <div
                  key={token.id}
                  className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_120px_100px_80px_120px] items-center gap-3 sm:gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/account/discovery/${token.id}`)}
                >
                  {/* Column 1: Icon with Hedera Badge */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                      <img
                        src={token.icon}
                        alt={token.symbol}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border-2 border-purple-500 shadow-sm">
                      <img src="/hedera.svg" alt="Hedera" className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  
                  {/* Column 2: Name & Symbol */}
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{token.name}</p>
                    <p className="text-sm text-muted-foreground">{token.symbol}</p>
                  </div>
                  
                  {/* Column 3: Price - Hidden on mobile */}
                  <div className="hidden sm:block text-right">
                    <p className="font-medium">
                      {formatAmount(token.price, token.priceUsd)}
                    </p>
                  </div>
                  
                  {/* Column 4: Change - Hidden on mobile */}
                  <div className="hidden sm:block text-right">
                    <Badge
                      variant={token.change24h > 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {token.change24h > 0 ? "+" : ""}
                      {token.change24h}%
                    </Badge>
                  </div>
                  
                  {/* Column 5: Chart - Hidden on mobile */}
                  <div className="hidden sm:flex justify-center">
                    <MiniChart
                      data={token.chartData}
                      isPositive={token.change24h > 0}
                    />
                  </div>
                  
                  {/* Column 6: Market Cap */}
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatAmount(token.marketCap, token.marketCapUsd)}
                    </p>
                    <p className="text-xs text-muted-foreground">MC</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, allPropertyTokens.length)} of {allPropertyTokens.length} tokens
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            <div className="sm:hidden flex items-center px-3">
              <span className="text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


