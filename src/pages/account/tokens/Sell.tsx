import { useState, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CustomTokenSelector } from "@/components/account/CustomTokenSelector";
import { CustomPaymentSelector } from "@/components/account/CustomPaymentSelector";
import { CustomQuoteSelector } from "@/components/account/CustomQuoteSelector";
import { ProviderLogo } from "@/components/account/ProviderLogo";
import {
  useMockQuotes,
  QuoteProvider as QuoteProviderType,
} from "@/hooks/useMockQuotes";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import {
  CreditCardIcon,
  BankIcon,
  AppleLogoIcon,
} from "@phosphor-icons/react";
import hederaIcon from "/hedera.svg";
import usdcIcon from "/usdc.svg";
import usdIcon from "/usd.svg";
import paypalIcon from "@/assets/paypal.svg";
import googlePayIcon from "@/assets/google-pay.svg";
import venmoIcon from "@/assets/venmo-icon.svg";

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
  | "selectPayment"
  | "selectQuote";

export default function SellTokens() {
  const { balance } = useWalletBalance();
  const navigate = useNavigate();

  const [cardState, setCardState] = useState<CardState>("main");
  const [amount, setAmount] = useState<string>("100");
  const [fromToken, setFromToken] = useState<"HBAR" | "USDC" | "USD">("HBAR");
  const [selectedQuote, setSelectedQuote] = useState<QuoteProviderType | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    id: "card",
    name: "Credit/Debit Card",
    icon: "card",
  });

  const { quotes, isLoading } = useMockQuotes(
    parseFloat(amount) || 0,
    fromToken,
    "USD",
    "sell"
  );

  const handleSellClick = () => {
    if (!amount || !selectedQuote) return;
    // Handle sell logic here
    console.log("Selling", amount, fromToken, "to USD via", selectedQuote.name);
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

  const handleSelectToken = (token: Token) => {
    setFromToken(token.symbol as "HBAR" | "USDC" | "USD");
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

  const getSelectedFromToken = () =>
    tokens.find((t) => t.symbol === fromToken) || null;

  const PaymentIcon = ({ type }: { type: string }) => {
    const iconProps = { size: 32, weight: "duotone" as const };

    switch (type) {
      case "card":
        return <CreditCardIcon {...iconProps} />;
      case "bank":
        return <BankIcon {...iconProps} />;
      case "apple":
        return <AppleLogoIcon {...iconProps} />;
      case "google":
        return (
          <img src={googlePayIcon} alt="Google Pay" className="w-10 h-10" />
        );
      case "venmo":
        return (
          <img src={venmoIcon} alt="Venmo" className="w-10 h-10 rounded-full" />
        );
      case "paypal":
        return <img src={paypalIcon} alt="PayPal" className="w-10 h-10" />;
      default:
        return <CreditCardIcon {...iconProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] mx-auto">
        <Tabs value="sell" className="w-full">
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

          <TabsContent value="sell" className="mt-0">
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
                <Label>I want to sell</Label>
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

              {/* Token Selector */}
              <CustomTokenSelector
                selectedToken={getSelectedFromToken()}
                label="I'll receive"
                showBalance={true}
                onClick={() => setCardState("selectFromToken")}
              />

              {/* Payment Method */}
              <CustomPaymentSelector
                selectedMethod={paymentMethod}
                label="Receive to"
                onClick={() => setCardState("selectPayment")}
              />

              {/* Quote Provider Selector */}
              <CustomQuoteSelector
                selectedQuote={selectedQuote}
                label="Select provider"
                onClick={() => setCardState("selectQuote")}
              />

              {/* Continue Button */}
              {selectedQuote && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSellClick}
                  disabled={!amount}
                >
                  Continue with {selectedQuote.name}
                </Button>
              )}
            </div>
          )}

          {/* Token Selection State */}
          {cardState === "selectFromToken" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Select From Token</h3>
              {tokens
                .filter((t) => t.symbol !== "USD")
                .map((token) => (
                  <Card
                    key={token.symbol}
                    className="p-4 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectToken(token)}
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

          {/* Payment Method Selection State */}
          {cardState === "selectPayment" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Select Receive Method</h3>
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
              <h3 className="text-xl font-semibold">Select Provider</h3>
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
