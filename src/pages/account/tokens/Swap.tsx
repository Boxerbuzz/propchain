import { useState, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, ArrowDownUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CustomTokenSelector } from "@/components/account/CustomTokenSelector";
import { CustomQuoteSelector } from "@/components/account/CustomQuoteSelector";
import { ProviderLogo } from "@/components/account/ProviderLogo";
import {
  useMockQuotes,
  QuoteProvider as QuoteProviderType,
} from "@/hooks/useMockQuotes";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import hederaIcon from "/hedera.svg";
import usdcIcon from "/usdc.svg";

interface Token {
  symbol: string;
  name: string;
  icon: string | ReactNode;
  balance: number;
}

type CardState =
  | "main"
  | "selectFromToken"
  | "selectToToken"
  | "selectQuote";

export default function SwapTokens() {
  const { balance } = useWalletBalance();
  const navigate = useNavigate();

  const [cardState, setCardState] = useState<CardState>("main");
  const [amount, setAmount] = useState<string>("100");
  const [fromToken, setFromToken] = useState<"HBAR" | "USDC" | "USD">("HBAR");
  const [toToken, setToToken] = useState<"HBAR" | "USDC" | "USD">("USDC");
  const [selectedQuote, setSelectedQuote] = useState<QuoteProviderType | null>(
    null
  );

  const { quotes, isLoading } = useMockQuotes(
    parseFloat(amount) || 0,
    fromToken,
    toToken,
    "swap"
  );

  const handleSwapClick = () => {
    if (!amount || !selectedQuote) return;
    // Handle swap logic here
    console.log(
      "Swapping",
      amount,
      fromToken,
      "to",
      toToken,
      "via",
      selectedQuote.name
    );
  };

  const tokens: Token[] = [
    {
      symbol: "HBAR",
      name: "Hedera",
      icon: <img src={hederaIcon} alt="Hedera" className="w-10 h-10" />,
      balance: balance?.balanceHbar || 0,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      icon: <img src={usdcIcon} alt="USDC" className="w-10 h-10" />,
      balance: balance?.usdcBalance || 0,
    },
  ];

  const quickAmounts = [50, 100, 250, 500, 1000];

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken as "HBAR" | "USDC");
    setToToken(temp as "HBAR" | "USDC");
  };

  const handleSelectToken = (token: Token, type: "from" | "to") => {
    if (type === "from") {
      setFromToken(token.symbol as "HBAR" | "USDC" | "USD");
    } else {
      setToToken(token.symbol as "HBAR" | "USDC" | "USD");
    }
    setCardState("main");
  };

  const handleSelectQuote = (quote: QuoteProviderType) => {
    setSelectedQuote(quote);
    setCardState("main");
  };

  const getSelectedFromToken = () =>
    tokens.find((t) => t.symbol === fromToken) || null;
  const getSelectedToToken = () =>
    tokens.find((t) => t.symbol === toToken) || null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] mx-auto">
        <Tabs value="swap" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="buy" onClick={() => navigate("/account/tokens/buy")}>
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" onClick={() => navigate("/account/tokens/sell")}>
              Sell
            </TabsTrigger>
            <TabsTrigger value="swap" onClick={() => navigate("/account/tokens/swap")}>
              Swap
            </TabsTrigger>
            <TabsTrigger value="send" onClick={() => navigate("/account/tokens/send")}>
              Send
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swap" className="mt-0">
        <Card className="p-6 bg-card border-border">
          {cardState !== "main" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCardState("main")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          {cardState === "main" && (
            <div className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label>From</Label>
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
              <div className="space-y-4">
                <CustomTokenSelector
                  selectedToken={getSelectedFromToken()}
                  label="From"
                  showBalance
                  onClick={() => setCardState("selectFromToken")}
                />

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

                <CustomTokenSelector
                  selectedToken={getSelectedToToken()}
                  label="To"
                  onClick={() => setCardState("selectToToken")}
                />
              </div>

              {/* Quote Provider Selector */}
              <CustomQuoteSelector
                selectedQuote={selectedQuote}
                label="Select DEX"
                onClick={() => setCardState("selectQuote")}
              />

              {/* Continue Button */}
              {selectedQuote && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSwapClick}
                  disabled={!amount}
                >
                  Continue with {selectedQuote.name}
                </Button>
              )}
            </div>
          )}

          {/* Token Selection State */}
          {(cardState === "selectFromToken" ||
            cardState === "selectToToken") && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                Select {cardState === "selectFromToken" ? "From" : "To"} Token
              </h3>
              {tokens.map((token) => (
                <Card
                  key={token.symbol}
                  className="p-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() =>
                    handleSelectToken(
                      token,
                      cardState === "selectFromToken" ? "from" : "to"
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12">
                        {typeof token.icon === "string" ? (
                          <span className="text-3xl">{token.icon}</span>
                        ) : (
                          token.icon
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{token.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {token.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {token.balance.toFixed(4)}
                      </p>
                      <p className="text-xs text-muted-foreground">Balance</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Quote Provider Selection State */}
          {cardState === "selectQuote" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Select DEX</h3>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                quotes.map((quote) => (
                  <Card
                    key={quote.id}
                    className="p-4 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectQuote(quote)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="space-y-1">
                          <ProviderLogo
                            provider={quote.logo as string}
                            size="sm"
                          />
                          <p className="text-sm text-muted-foreground">
                            {quote.processingTime}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ${quote.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fee: ${quote.fee.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {quote.badges.length > 0 && (
                      <div className="flex gap-2">
                        {quote.badges.map((badge) => (
                          <Badge
                            key={badge}
                            variant="secondary"
                            className="text-xs"
                          >
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}
        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
