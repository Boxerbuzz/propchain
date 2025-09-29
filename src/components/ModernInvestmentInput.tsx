import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import MoneyInput from "@/components/ui/money-input";
import { Progress } from "@/components/ui/progress";
import { ArrowUpDown } from "lucide-react";

interface ModernInvestmentInputProps {
  amount: number;
  tokenCount: number;
  tokenSymbol: string;
  pricePerToken: number;
  minInvestment: number;
  maxInvestment?: number;
  walletBalance?: number;
  onAmountChange: (amount: number) => void;
  onTokenCountChange: (tokenCount: number) => void;
  className?: string;
}

export default function ModernInvestmentInput({
  amount,
  tokenCount,
  tokenSymbol,
  pricePerToken,
  minInvestment,
  maxInvestment,
  walletBalance = 0,
  onAmountChange,
  onTokenCountChange,
  className = "",
}: ModernInvestmentInputProps) {
  const [inputMode, setInputMode] = useState<"amount" | "tokens">("amount");

  const calculateTokens = (amount: number) => {
    if (!amount || !pricePerToken) return 0;
    return Math.floor(amount / pricePerToken);
  };

  const calculateAmount = (tokenCount: number) => {
    if (!tokenCount || !pricePerToken) return 0;
    return tokenCount * pricePerToken;
  };

  const handleAmountChange = (value: number) => {
    onAmountChange(value);
    onTokenCountChange(calculateTokens(value));
  };

  const handleTokenCountChange = (value: number) => {
    onTokenCountChange(value);
    onAmountChange(calculateAmount(value));
  };

  const toggleInputMode = () => {
    setInputMode(inputMode === "amount" ? "tokens" : "amount");
  };

  const handleQuickAmount = (percentage: number) => {
    const maxAmount = maxInvestment || walletBalance;
    const quickAmount = Math.floor(maxAmount * percentage);
    const validAmount = Math.max(
      minInvestment,
      Math.min(quickAmount, maxAmount)
    );
    handleAmountChange(validAmount);
  };

  const getProgressPercentage = () => {
    const maxAmount = maxInvestment || minInvestment * 10;
    return Math.min(100, (amount / maxAmount) * 100);
  };

  const quickAmountButtons = [
    { label: "25%", value: 0.25 },
    { label: "50%", value: 0.5 },
    { label: "75%", value: 0.75 },
    { label: "Max", value: 1 },
  ];

  const currentDisplayValue = inputMode === "amount" ? amount : tokenCount;
  const currentConversion =
    inputMode === "amount"
      ? `${tokenCount.toLocaleString()} ${tokenSymbol}`
      : `₦${amount.toLocaleString()}`;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Balance */}
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Investment Amount</Label>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Balance: ₦{walletBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Modern Single Input Display */}
      <div className="bg-gradient-to-br from-background to-muted/20 border-2 border-border rounded-md p-6 space-y-4 transition-all duration-200 hover:border-primary/30">
        {/* Single Input with Currency Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {inputMode === "amount" ? "Amount (Naira)" : "Tokens"}
            </span>
            <button
              type="button"
              onClick={toggleInputMode}
              className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200 group"
            >
              <span className="text-xs font-medium">
                {inputMode === "amount" ? "₦" : tokenSymbol}
              </span>
              <ArrowUpDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>

          <div className="relative group">
            {/* Currency Symbol */}
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-xl font-semibold text-primary pointer-events-none">
              {inputMode === "amount" ? "₦" : tokenSymbol}
            </div>

            {/* Input Field */}
            {inputMode === "amount" ? (
              <MoneyInput
                value={currentDisplayValue}
                onChange={handleAmountChange}
                min={minInvestment}
                max={maxInvestment}
                placeholder="0.00"
                className="pl-16 pr-4 text-3xl font-bold h-16 bg-transparent border-0 focus:ring-0 focus:outline-none"
              />
            ) : (
              <Input
                type="number"
                value={currentDisplayValue || ""}
                onChange={(e) =>
                  handleTokenCountChange(parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className="pl-16 pr-4 text-3xl font-bold h-16 bg-transparent border-0 focus:ring-0 focus:outline-none"
              />
            )}

            {/* Conversion Display */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
              ≈ {currentConversion}
            </div>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {quickAmountButtons.map(({ label, value }) => {
            const maxAmount = maxInvestment || walletBalance;
            const buttonAmount = Math.floor(maxAmount * value);
            const isValid =
              buttonAmount >= minInvestment && buttonAmount <= maxAmount;

            return (
              <Button
                key={label}
                type="button"
                variant="outline"
                size="sm"
                disabled={!isValid}
                onClick={() => handleQuickAmount(value)}
                className={`h-10 text-sm font-medium transition-all duration-200 ${
                  isValid
                    ? "hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                {label}
              </Button>
            );
          })}
        </div>

        {/* Investment Limits & Progress */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Min: ₦{minInvestment.toLocaleString()}</span>
            </span>
            {maxInvestment && (
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Max: ₦{maxInvestment.toLocaleString()}</span>
              </span>
            )}
          </div>

          {/* Investment Progress Bar */}
          <div className="flex items-center space-x-2">
            <div className="w-20">
              <Progress value={getProgressPercentage()} className="h-1" />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round(getProgressPercentage())}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
