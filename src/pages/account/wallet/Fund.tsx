import { useState, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CustomTokenSelector } from "@/components/account/CustomTokenSelector";
import { CustomPaymentSelector } from "@/components/account/CustomPaymentSelector";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useWalletFunding } from "@/hooks/useWalletFunding";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  CreditCardIcon,
  BankIcon,
  AppleLogoIcon,
} from "@phosphor-icons/react";
import hederaIcon from "/hedera.svg";
import usdcIcon from "/usdc.svg";
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

// Exchange rates (approximate - should be fetched from API in production)
const HBAR_TO_NGN_RATE = 262; // ~$0.05 HBAR * ~5,240 NGN/USD
const USDC_TO_NGN_RATE = 1465; // 1:1 USD peg * ~1,465 NGN/USD

type CardState = "main" | "selectCurrency" | "selectPayment";

export default function FundWallet() {
  const { user } = useAuth();
  const { fundWallet, isFunding } = useWalletFunding();
  const { balance } = useWalletBalance();
  const navigate = useNavigate();

  const [cardState, setCardState] = useState<CardState>("main");
  const [amount, setAmount] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState<"hbar" | "usdc">(
    "hbar"
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    id: "card",
    name: "Credit/Debit Card",
    icon: "card",
  });

  const tokens: Token[] = [
    {
      symbol: "HBAR",
      name: "Hedera",
      icon: <img src={hederaIcon} alt="HBAR" className="w-6 h-6" />,
      balance: balance?.balanceHbar || 0,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      icon: <img src={usdcIcon} alt="USDC" className="w-6 h-6" />,
      balance: balance?.usdcBalance || 0,
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

  const quickAmounts = [1000, 5000, 10000, 25000, 50000];

  const selectedToken =
    tokens.find((t) => t.symbol.toLowerCase() === selectedCurrency) ||
    tokens[0];

  // Calculate estimated token amount
  const exchangeRate =
    selectedCurrency === "hbar" ? HBAR_TO_NGN_RATE : USDC_TO_NGN_RATE;
  const estimatedTokenAmount =
    amount && parseFloat(amount) > 0
      ? parseFloat(amount) / exchangeRate
      : 0;

  const handleSelectPayment = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setCardState("main");
  };

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

  const handleFundClick = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (Number(amount) < 1000) {
      toast.error("Minimum funding amount is ₦1,000");
      return;
    }

    if (!user?.email) {
      toast.error("Please log in to fund your wallet");
      return;
    }

    fundWallet({
      amount_ngn: Number(amount),
      target_token: selectedCurrency === "hbar" ? "HBAR" : "USDC",
      email: user.email,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] mx-auto">
        <Tabs value="fund" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="withdraw"
              onClick={() => navigate("/account/wallet/withdraw")}
            >
              Withdraw
            </TabsTrigger>
            <TabsTrigger
              value="fund"
              onClick={() => navigate("/account/wallet/fund")}
            >
              Fund
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fund" className="mt-0">
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
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Add Money to Your Wallet</h2>
                    <p className="text-sm text-muted-foreground">
                      Fund your wallet with NGN to receive tokens
                    </p>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label>Amount to spend</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold">
                        ₦
                      </span>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="text-2xl font-bold pl-8 h-14 pr-20"
                        min="1000"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minimum: ₦1,000
                    </p>
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
                        ₦{amt.toLocaleString()}
                      </Button>
                    ))}
                  </div>

                  {/* Token Selector */}
                  <CustomTokenSelector
                    selectedToken={selectedToken}
                    label="I want to receive"
                    onClick={() => setCardState("selectCurrency")}
                  />

                  {/* Exchange Rate Display */}
                  {amount && parseFloat(amount) > 0 && (
                    <div className="bg-muted rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          Exchange Rate
                        </span>
                        <span className="font-semibold">
                          1 {selectedToken.symbol} ≈ ₦
                          {exchangeRate.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          You'll receive
                        </span>
                        <span className="text-xl font-bold text-primary">
                          ~{estimatedTokenAmount.toFixed(4)}{" "}
                          {selectedToken.symbol}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <CustomPaymentSelector
                    selectedMethod={paymentMethod}
                    label="Payment method"
                    onClick={() => setCardState("selectPayment")}
                  />

                  {/* Summary Card */}
                  {amount && parseFloat(amount) > 0 && (
                    <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            Amount
                          </span>
                          <span className="font-semibold text-lg">
                            ₦{Number(amount).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            Exchange Rate
                          </span>
                          <span className="font-medium">
                            1 {selectedToken.symbol} ≈ ₦
                            {exchangeRate.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-px bg-border"></div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">You'll Receive</span>
                          <span className="text-2xl font-bold text-primary">
                            ~{estimatedTokenAmount.toFixed(4)}{" "}
                            {selectedToken.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm pt-2 border-t">
                          <span className="text-muted-foreground">
                            Payment Method
                          </span>
                          <span className="font-medium">
                            {paymentMethod.name}
                          </span>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Continue to Payment Button */}
                  {amount && parseFloat(amount) >= 1000 && (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleFundClick}
                      disabled={isFunding}
                    >
                      {isFunding
                        ? "Processing..."
                        : "Continue to Payment"}
                    </Button>
                  )}
                </div>
              )}

              {/* Currency Selection State */}
              {cardState === "selectCurrency" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-2">
                    Select Token to Receive
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose which token you want to receive after funding
                  </p>
                  {tokens.map((token) => (
                    <Card
                      key={token.symbol}
                      className="p-4 cursor-pointer hover:bg-accent hover:border-primary/50 transition-all border-2"
                      onClick={() => {
                        setSelectedCurrency(
                          token.symbol.toLowerCase() as "hbar" | "usdc"
                        );
                        setCardState("main");
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                          {token.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-base">
                            {token.symbol}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {token.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Current Balance: {token.balance.toFixed(4)}{" "}
                            {token.symbol}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Rate
                          </p>
                          <p className="font-semibold">
                            1 {token.symbol} ≈ ₦
                            {token.symbol === "HBAR"
                              ? HBAR_TO_NGN_RATE.toLocaleString()
                              : USDC_TO_NGN_RATE.toLocaleString()}
                          </p>
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
                    Select Payment Method
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
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
