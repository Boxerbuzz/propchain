import { useState, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMockQuotes, QuoteProvider as QuoteProviderType } from "@/hooks/useMockQuotes";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowDownUp } from "lucide-react";
import { CustomTokenSelector } from "./CustomTokenSelector";
import { CustomPaymentSelector } from "./CustomPaymentSelector";
import { CustomQuoteSelector } from "./CustomQuoteSelector";
import { CreditCard, Bank } from "@phosphor-icons/react";
import { AppleLogo, GoogleLogo } from "@phosphor-icons/react";
import { ProviderLogo } from "./ProviderLogo";
import hederaIcon from "@/assets/logo.svg";
import usdcIcon from "/usdc.svg";
import usdIcon from "/usd.svg";

interface Token {
  symbol: string;
  name: string;
  icon: string | ReactNode;
  balance: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: "card" | "bank" | "apple" | "google" | "venmo" | "paypal";
}

type CardState = 
  | "main"
  | "selectFromToken"
  | "selectToToken"
  | "selectPayment"
  | "selectQuote";

interface TokenSwapCardProps {
  defaultTab?: "buy" | "sell" | "swap";
}

export function TokenSwapCard({ defaultTab = "buy" }: TokenSwapCardProps) {
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "swap">(defaultTab);
  const [cardState, setCardState] = useState<CardState>("main");
  const [amount, setAmount] = useState<string>("100");
  const [fromToken, setFromToken] = useState<"HBAR" | "USDC" | "USD">("USD");
  const [toToken, setToToken] = useState<"HBAR" | "USDC" | "USD">("HBAR");
  const [selectedQuote, setSelectedQuote] = useState<QuoteProviderType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    id: "card",
    name: "Credit/Debit Card",
    icon: "card",
  });

  const { balance } = useWalletBalance();
  const { quotes, isLoading } = useMockQuotes(
    parseFloat(amount) || 0,
    fromToken,
    toToken,
    activeTab
  );

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
    {
      symbol: "USD",
      name: "US Dollar",
      icon: <img src={usdIcon} alt="USD" className="w-10 h-10" />,
      balance: 0,
    },
  ];

  const paymentMethods: PaymentMethod[] = [
    { id: "card", name: "Credit/Debit Card", icon: "card" },
    { id: "bank", name: "Bank Transfer", icon: "bank" },
    { id: "apple", name: "Apple Pay", icon: "apple" },
    { id: "google", name: "Google Pay", icon: "google" },
    { id: "venmo", name: "Venmo", icon: "venmo" },
    { id: "paypal", name: "PayPal", icon: "paypal" },
  ];

  const quickAmounts = [50, 100, 250, 500, 1000];

  const handleTabChange = (value: string) => {
    setActiveTab(value as "buy" | "sell" | "swap");
    setSelectedQuote(null);
    setCardState("main");
    
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

  const handleSelectToken = (token: Token, type: "from" | "to") => {
    if (type === "from") {
      setFromToken(token.symbol as "HBAR" | "USDC" | "USD");
    } else {
      setToToken(token.symbol as "HBAR" | "USDC" | "USD");
    }
    setCardState("main");
  };

  const handleSelectPayment = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setCardState("main");
  };

  const handleSelectQuote = (quote: QuoteProviderType) => {
    setSelectedQuote(quote);
    setCardState("main");
  };

  const getSelectedFromToken = () => tokens.find((t) => t.symbol === fromToken) || null;
  const getSelectedToToken = () => tokens.find((t) => t.symbol === toToken) || null;

  const PaymentIcon = ({ type }: { type: string }) => {
    const iconProps = { size: 32, weight: "duotone" as const };
    
    switch (type) {
      case "card":
        return <CreditCard {...iconProps} />;
      case "bank":
        return <Bank {...iconProps} />;
      case "apple":
        return <AppleLogo {...iconProps} />;
      case "google":
        return <GoogleLogo {...iconProps} />;
      case "venmo":
        return <span className="text-3xl font-bold text-[#008CFF]">V</span>;
      case "paypal":
        return <span className="text-3xl font-bold text-[#00457C]">P</span>;
      default:
        return <CreditCard {...iconProps} />;
    }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto p-6">
      <Card className="p-6 bg-card border-border">
        {cardState !== "main" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCardState("main")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        {cardState === "main" && (
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
            ) : (
              <CustomTokenSelector
                selectedToken={
                  activeTab === "buy" ? getSelectedToToken() : getSelectedFromToken()
                }
                label={activeTab === "buy" ? "I want to receive" : "I'll receive"}
                showBalance={activeTab === "sell"}
                onClick={() =>
                  setCardState(activeTab === "buy" ? "selectToToken" : "selectFromToken")
                }
              />
            )}

            {/* Payment Method (for buy/sell only) */}
            {activeTab !== "swap" && (
              <CustomPaymentSelector
                selectedMethod={paymentMethod}
                label={activeTab === "buy" ? "Payment method" : "Receive to"}
                onClick={() => setCardState("selectPayment")}
              />
            )}

            {/* Quote Provider Selector */}
            <CustomQuoteSelector
              selectedQuote={selectedQuote}
              label={activeTab === "swap" ? "Select DEX" : "Select provider"}
              onClick={() => setCardState("selectQuote")}
            />

            {/* Continue Button */}
            {selectedQuote && (
              <Button className="w-full" size="lg">
                Continue with {selectedQuote.name}
              </Button>
            )}
          </TabsContent>
        </Tabs>
        )}

        {/* Token Selection State */}
        {(cardState === "selectFromToken" || cardState === "selectToToken") && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              Select {cardState === "selectFromToken" ? "From" : "To"} Token
            </h3>
            {tokens
              .filter((t) => {
                if (activeTab === "buy" && cardState === "selectFromToken") return false;
                if (activeTab === "sell" && cardState === "selectToToken") return t.symbol === "USD";
                if (activeTab === "swap") return t.symbol !== "USD";
                return t.symbol !== "USD";
              })
              .map((token) => (
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
                        {typeof token.icon === 'string' ? (
                          <span className="text-3xl">{token.icon}</span>
                        ) : (
                          token.icon
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{token.symbol}</p>
                        <p className="text-sm text-muted-foreground">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{token.balance.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">Balance</p>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}

        {/* Payment Method Selection State */}
        {cardState === "selectPayment" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {activeTab === "buy" ? "Select Payment Method" : "Select Receive Method"}
            </h3>
            {paymentMethods.map((method) => (
              <Card
                key={method.id}
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleSelectPayment(method)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                    <PaymentIcon type={method.icon} />
                  </div>
                  <div>
                    <p className="font-semibold">{method.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {method.id === "card" && "Instant • 2.9% fee"}
                      {method.id === "bank" && "1-3 days • Lower fees"}
                      {method.id === "apple" && "Instant • 2.5% fee"}
                      {method.id === "google" && "Instant • 2.5% fee"}
                      {method.id === "venmo" && "Instant • 3% fee"}
                      {method.id === "paypal" && "Instant • 3.5% fee"}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quote Provider Selection State */}
        {cardState === "selectQuote" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {activeTab === "swap" ? "Select DEX" : "Select Provider"}
            </h3>
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
                      <div className="flex items-center justify-center w-12 h-12">
                        {typeof quote.logo === 'string' ? (
                          quote.logo === '⚡' ? (
                            <span className="text-3xl">{quote.logo}</span>
                          ) : (
                            <ProviderLogo provider={quote.logo} size="md" />
                          )
                        ) : (
                          quote.logo
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{quote.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {quote.processingTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${quote.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        Fee: ${quote.fee.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {quote.badges.length > 0 && (
                    <div className="flex gap-2">
                      {quote.badges.map((badge) => (
                        <span
                          key={badge}
                          className="text-xs px-2 py-1 rounded-full bg-muted"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
