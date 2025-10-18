import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TokenSelector } from "./TokenSelector";
import { QuoteProvider } from "./QuoteProvider";
import { useMockQuotes } from "@/hooks/useMockQuotes";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownUp } from "lucide-react";

interface TokenSwapCardProps {
  defaultTab?: "buy" | "sell" | "swap";
}

export function TokenSwapCard({ defaultTab = "buy" }: TokenSwapCardProps) {
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "swap">(defaultTab);
  const [amount, setAmount] = useState<string>("100");
  const [fromToken, setFromToken] = useState<"HBAR" | "USDC" | "USD">("USD");
  const [toToken, setToToken] = useState<"HBAR" | "USDC" | "USD">("HBAR");
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");

  const { balance } = useWalletBalance();
  const { quotes, isLoading } = useMockQuotes(
    parseFloat(amount) || 0,
    fromToken,
    toToken,
    activeTab
  );

  const tokens = [
    {
      symbol: "HBAR",
      name: "Hedera",
      icon: "ℏ",
      balance: balance?.balanceHbar || 0,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      icon: "💵",
      balance: balance?.usdcBalance || 0,
    },
  ];

  const quickAmounts = [50, 100, 250, 500, 1000];

  const handleTabChange = (value: string) => {
    setActiveTab(value as "buy" | "sell" | "swap");
    setSelectedQuote(null);
    
    if (value === "buy") {
      setFromToken("USD");
      setToToken("HBAR");
    } else if (value === "sell") {
      setFromToken("HBAR");
      setToToken("USD");
    } else {
      setFromToken("HBAR");
      setToToken("USDC");
    }
  };

  const handleSwapTokens = () => {
    if (activeTab === "swap") {
      const temp = fromToken;
      setFromToken(toToken as "HBAR" | "USDC");
      setToToken(temp as "HBAR" | "USDC");
    }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto p-6">
      <Card className="p-6 bg-card border-border">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
            <TabsTrigger value="swap">Swap</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label>
                {activeTab === "buy" ? "I want to spend" : activeTab === "sell" ? "I want to sell" : "From"}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold">
                  $
                </span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-2xl font-bold pl-8 h-14"
                  placeholder="0.00"
                />
              </div>
              
              {/* Quick Amount Buttons */}
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(amt.toString())}
                    className="flex-1 min-w-[60px]"
                  >
                    ${amt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Token Selectors */}
            {activeTab === "swap" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <TokenSelector
                    selectedToken={fromToken}
                    onSelectToken={(token) => setFromToken(token as "HBAR" | "USDC")}
                    tokens={tokens}
                  />
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSwapTokens}
                    className="rounded-full"
                  >
                    <ArrowDownUp className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>To</Label>
                  <TokenSelector
                    selectedToken={toToken}
                    onSelectToken={(token) => setToToken(token as "HBAR" | "USDC")}
                    tokens={tokens}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>
                  {activeTab === "buy" ? "I want to receive" : "I'll receive"}
                </Label>
                <TokenSelector
                  selectedToken={activeTab === "buy" ? toToken : fromToken}
                  onSelectToken={(token) => {
                    if (activeTab === "buy") {
                      setToToken(token as "HBAR" | "USDC");
                    } else {
                      setFromToken(token as "HBAR" | "USDC");
                    }
                  }}
                  tokens={tokens}
                  showBalance={activeTab === "sell"}
                />
              </div>
            )}

            {/* Payment Method (for buy/sell only) */}
            {activeTab !== "swap" && (
              <div className="space-y-2">
                <Label>
                  {activeTab === "buy" ? "Payment method" : "Receive to"}
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">💳 Credit/Debit Card</SelectItem>
                    <SelectItem value="bank">🏦 Bank Transfer</SelectItem>
                    <SelectItem value="apple">🍎 Apple Pay</SelectItem>
                    <SelectItem value="google">📱 Google Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quotes Section */}
            <div className="space-y-3">
              <Label>
                {activeTab === "swap" ? "Select DEX" : "Select provider"}
              </Label>
              
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {quotes.map((quote) => (
                    <QuoteProvider
                      key={quote.id}
                      quote={quote}
                      isSelected={selectedQuote === quote.id}
                      onSelect={() => setSelectedQuote(quote.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
