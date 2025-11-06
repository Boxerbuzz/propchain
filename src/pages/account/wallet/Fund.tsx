import { useState, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CustomTokenSelector } from "@/components/account/CustomTokenSelector";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useWalletFunding } from "@/hooks/useWalletFunding";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import hederaIcon from "/hedera.svg";
import usdcIcon from "/usdc.svg";

interface Token {
  symbol: string;
  name: string;
  icon: string | ReactNode;
  balance: number;
}

type CardState = "main" | "selectCurrency";

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

  const quickAmounts = [1000, 5000, 10000, 25000, 50000];

  const selectedToken =
    tokens.find((t) => t.symbol.toLowerCase() === selectedCurrency) ||
    tokens[0];

  const handleFundClick = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
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
            <TabsTrigger value="withdraw" onClick={() => navigate("/account/wallet/withdraw")}>
              Withdraw
            </TabsTrigger>
            <TabsTrigger value="fund" onClick={() => navigate("/account/wallet/fund")}>
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
              {/* Currency Selector */}
              <CustomTokenSelector
                selectedToken={selectedToken}
                label="Currency"
                showBalance={true}
                onClick={() => setCardState("selectCurrency")}
              />

              {/* Amount Input */}
              <div className="space-y-2">
                <Label>Amount to fund</Label>
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
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8"
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
                <p className="text-sm text-muted-foreground">
                  Available:{" "}
                  {selectedCurrency === "hbar"
                    ? balance?.balanceHbar.toFixed(2)
                    : balance?.usdcBalance.toFixed(2)}{" "}
                  {selectedCurrency.toUpperCase()}
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

              {/* Fund Button */}
              {amount && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleFundClick}
                  disabled={isFunding || !amount}
                >
                  {isFunding ? "Processing..." : `Fund with ${selectedToken.symbol}`}
                </Button>
              )}
            </div>
          )}

          {/* Currency Selection State */}
          {cardState === "selectCurrency" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-2">Select Currency</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose the currency you want to fund
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
        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
