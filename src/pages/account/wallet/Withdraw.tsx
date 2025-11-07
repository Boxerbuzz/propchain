import { useState, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Building2, Wallet, Coins, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CustomWithdrawalMethodSelector } from "@/components/account/CustomWithdrawalMethodSelector";
import { CustomTokenSelector } from "@/components/account/CustomTokenSelector";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import hederaIcon from "/hedera.svg";
import usdcIcon from "/usdc.svg";

interface Token {
  symbol: string;
  name: string;
  icon: string | ReactNode;
  balance: number;
}

interface WithdrawalMethod {
  id: "bank_transfer" | "hedera" | "usdc";
  name: string;
  description: string;
  icon: "bank" | "hedera" | "usdc";
  fee: string;
  badge?: string;
  processingTime?: string;
}

type CardState =
  | "main"
  | "selectMethod"
  | "selectCurrency"
  | "bankDetails"
  | "hederaDetails";

export default function WithdrawFunds() {
  const { balance } = useWalletBalance();
  const navigate = useNavigate();

  const [cardState, setCardState] = useState<CardState>("main");
  const [amount, setAmount] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState<"hbar" | "usdc">(
    "hbar"
  );
  const [selectedMethod, setSelectedMethod] =
    useState<WithdrawalMethod | null>(null);
  const [loading, setLoading] = useState(false);

  // Bank details
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");

  // Hedera details
  const [hederaAccount, setHederaAccount] = useState("");

  const withdrawalMethods: WithdrawalMethod[] = [
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      description: "₦100 processing fee",
      icon: "bank",
      fee: "₦100",
      badge: "Most Popular",
      processingTime: "1-3 business days",
    },
    {
      id: "hedera",
      name: "Hedera Account",
      description: "Instant & Free",
      icon: "hedera",
      fee: "Free",
      badge: "Fastest",
      processingTime: "Instant",
    },
    {
      id: "usdc",
      name: "USDC Transfer",
      description: "Instant & Free",
      icon: "usdc",
      fee: "Free",
      badge: "Lowest Fee",
      processingTime: "Instant",
    },
  ];

  // Quick amounts in token units (percentage of balance)
  const getQuickAmounts = () => {
    const currentBalance =
      selectedCurrency === "hbar"
        ? balance?.balanceHbar || 0
        : balance?.usdcBalance || 0;
    if (currentBalance === 0) return [];
    
    // Calculate 25%, 50%, 75%, 100% of balance
    return [
      currentBalance * 0.25,
      currentBalance * 0.5,
      currentBalance * 0.75,
      currentBalance,
    ].filter((amt) => amt > 0);
  };

  // Exchange rates for NGN conversion (approximate)
  const HBAR_TO_NGN_RATE = 262;
  const USDC_TO_NGN_RATE = 1465;
  
  const getNgnEquivalent = (tokenAmount: number) => {
    const rate = selectedCurrency === "hbar" ? HBAR_TO_NGN_RATE : USDC_TO_NGN_RATE;
    return tokenAmount * rate;
  };

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

  const selectedToken =
    tokens.find((t) => t.symbol.toLowerCase() === selectedCurrency) ||
    tokens[0];

  const processingFee = selectedMethod?.id === "bank_transfer" ? 100 : 0;
  // Calculate NGN equivalent of token amount, then subtract fee
  const ngnAmount = amount ? getNgnEquivalent(parseFloat(amount)) : 0;
  const netAmount = ngnAmount - processingFee;

  const handleSelectMethod = (method: WithdrawalMethod) => {
    setSelectedMethod(method);
    if (method.id === "bank_transfer") {
      setCardState("bankDetails");
    } else {
      setCardState("hederaDetails");
    }
  };

  const handleSubmitWithdrawal = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const currentBalance =
      selectedCurrency === "hbar"
        ? balance?.balanceHbar || 0
        : balance?.usdcBalance || 0;
    if (Number(amount) > currentBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!selectedMethod) {
      toast.error("Please select a withdrawal method");
      return;
    }

    if (
      selectedMethod.id === "bank_transfer" &&
      (!accountNumber || !accountName || !bankName)
    ) {
      toast.error("Please fill in all bank details");
      return;
    }

    if (
      (selectedMethod.id === "hedera" || selectedMethod.id === "usdc") &&
      !hederaAccount
    ) {
      toast.error("Please enter Hedera account ID");
      return;
    }

    setLoading(true);

    try {
      const tokenAmount = parseFloat(amount);
      const { error } = await supabase.functions.invoke(
        "initiate-withdrawal",
        {
          body: {
            amount_ngn: getNgnEquivalent(tokenAmount),
            currency_type: selectedCurrency,
            currency_amount: tokenAmount,
            withdrawal_method: selectedMethod.id,
            bank_details:
              selectedMethod.id === "bank_transfer"
                ? {
                    account_number: accountNumber,
                    account_name: accountName,
                    bank_name: bankName,
                    bank_code: "",
                  }
                : undefined,
            hedera_account:
              selectedMethod.id === "hedera" || selectedMethod.id === "usdc"
                ? hederaAccount
                : undefined,
          },
        }
      );

      if (error) throw error;

      toast.success("Withdrawal request submitted successfully");
      setAmount("");
      setSelectedMethod(null);
      setCardState("main");
      setAccountNumber("");
      setAccountName("");
      setBankName("");
      setHederaAccount("");
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast.error(error.message || "Failed to submit withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] mx-auto">
        <Tabs value="withdraw" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="withdraw" onClick={() => navigate("/account/wallet/withdraw")}>
              Withdraw
            </TabsTrigger>
            <TabsTrigger value="fund" onClick={() => navigate("/account/wallet/fund")}>
              Fund
            </TabsTrigger>
          </TabsList>

          <TabsContent value="withdraw" className="mt-0">
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
                <h2 className="text-2xl font-bold mb-2">Withdraw from Your Wallet</h2>
                <p className="text-sm text-muted-foreground">
                  Convert your tokens to fiat currency
                </p>
              </div>

              {/* Currency Selector */}
              <CustomTokenSelector
                selectedToken={selectedToken}
                label="Withdraw from"
                showBalance={true}
                onClick={() => setCardState("selectCurrency")}
              />

              {/* Amount Input */}
              <div className="space-y-2">
                <Label>Amount to withdraw</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`h-12 text-lg pr-20 ${
                      parseFloat(amount) >
                      (selectedCurrency === "hbar"
                        ? balance?.balanceHbar || 0
                        : balance?.usdcBalance || 0)
                        ? "border-destructive"
                        : ""
                    }`}
                    step="0.0001"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">
                      {selectedCurrency.toUpperCase()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() =>
                        setAmount(
                          String(
                            selectedCurrency === "hbar"
                              ? balance?.balanceHbar || 0
                              : balance?.usdcBalance || 0
                          )
                        )
                      }
                    >
                      Max
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-muted-foreground">
                    Available:{" "}
                    {selectedCurrency === "hbar"
                      ? balance?.balanceHbar.toFixed(4)
                      : balance?.usdcBalance.toFixed(4)}{" "}
                    {selectedCurrency.toUpperCase()}
                  </p>
                  {amount && parseFloat(amount) > 0 && (
                    <p className="text-muted-foreground">
                      ≈ ₦{getNgnEquivalent(parseFloat(amount)).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Amount Buttons */}
              {getQuickAmounts().length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {getQuickAmounts().map((amt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(amt.toFixed(4))}
                      className="flex-1 min-w-[60px]"
                    >
                      {amt.toFixed(2)} {selectedCurrency.toUpperCase()}
                    </Button>
                  ))}
                </div>
              )}

              {/* Method Selector */}
              <CustomWithdrawalMethodSelector
                selectedMethod={selectedMethod}
                label="Withdrawal method"
                onClick={() => setCardState("selectMethod")}
              />

              {/* Summary Card */}
              {amount && parseFloat(amount) > 0 && selectedMethod && (
                <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Amount</span>
                      <div className="text-right">
                        <span className="font-semibold text-lg">
                          {parseFloat(amount).toFixed(4)} {selectedCurrency.toUpperCase()}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          ≈ ₦{getNgnEquivalent(parseFloat(amount)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Processing Fee
                      </span>
                      <span className="font-medium text-muted-foreground">
                        -{selectedMethod.fee}
                      </span>
                    </div>
                    <div className="h-px bg-border"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">You'll Receive</span>
                      <span className="text-2xl font-bold text-primary">
                        ₦{netAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t">
                      <span className="text-muted-foreground">
                        Withdrawal Method
                      </span>
                      <span className="font-medium">
                        {selectedMethod.name}
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Submit Button */}
              {selectedMethod && amount && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmitWithdrawal}
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : `Withdraw with ${selectedMethod.name}`}
                </Button>
              )}
            </div>
          )}

          {/* Currency Selection State */}
          {cardState === "selectCurrency" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-2">Select Token to Withdraw</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose which token you want to withdraw from your wallet
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
                      <p className="font-semibold text-base">{token.symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        {token.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Balance: {token.balance.toFixed(4)} {token.symbol}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Method Selection State */}
          {cardState === "selectMethod" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-2">
                Select Withdrawal Method
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose how you want to receive your funds
              </p>
              {withdrawalMethods.map((method) => {
                const Icon =
                  method.icon === "bank"
                    ? Building2
                    : method.icon === "hedera"
                    ? Wallet
                    : Coins;
                return (
                  <Card
                    key={method.id}
                    className="p-4 cursor-pointer hover:bg-accent hover:border-primary/50 transition-all border-2"
                    onClick={() => handleSelectMethod(method)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-base">
                            {method.name}
                          </p>
                          {method.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {method.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {method.description}
                        </p>
                        {method.processingTime && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{method.processingTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Bank Details State */}
          {cardState === "bankDetails" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  Bank Account Details
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enter your bank account information for withdrawal
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="1234567890"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    placeholder="John Doe"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Select value={bankName} onValueChange={setBankName}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gtbank">GTBank</SelectItem>
                      <SelectItem value="access">Access Bank</SelectItem>
                      <SelectItem value="zenith">Zenith Bank</SelectItem>
                      <SelectItem value="firstbank">First Bank</SelectItem>
                      <SelectItem value="uba">UBA</SelectItem>
                      <SelectItem value="fidelity">Fidelity Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setCardState("main")}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Hedera Details State */}
          {cardState === "hederaDetails" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  Hedera Account Details
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enter your Hedera account ID to receive funds instantly
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hederaAccount">Hedera Account ID</Label>
                  <Input
                    id="hederaAccount"
                    placeholder="0.0.123456"
                    value={hederaAccount}
                    onChange={(e) => setHederaAccount(e.target.value)}
                    className="h-11 font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your Hedera account ID in the format 0.0.XXXXXX
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setCardState("main")}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
