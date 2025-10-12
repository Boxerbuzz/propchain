import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowUpDown, CoinsIcon, DollarSign } from "lucide-react";

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
  onBlur?: () => void;
  className?: string;
}

// Stable Input Field Component - Never re-renders during typing
interface StableInputFieldProps {
  inputMode: "amount" | "tokens";
  tokenSymbol: string;
  onInputChange: (value: string) => void;
  onModeToggle: () => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  externalValue: string;
  externalSyncKey: number;
}

const StableInputField = ({
  inputMode,
  tokenSymbol,
  onInputChange,
  onModeToggle,
  onBlur,
  onKeyDown,
  externalValue,
  externalSyncKey,
}: StableInputFieldProps) => {
  const [localValue, setLocalValue] = useState(externalValue);

  // Sync local input value when programmatic updates occur (e.g., quick buttons, mode toggle)
  useEffect(() => {
    const formatForMode = (val: string) => {
      if (!val) return "";
      const unformatted = val.replace(/,/g, "");
      if (inputMode === "tokens") {
        const intPart = unformatted.replace(/\D/g, "");
        return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      } else {
        const parts = unformatted.split(".");
        const intPart = parts[0].replace(/\D/g, "");
        const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (parts.length > 1) {
          return `${formattedInt}.${parts[1]}`;
        }
        return formattedInt;
      }
    };
    setLocalValue(formatForMode(externalValue));
  }, [externalSyncKey, externalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow valid number input
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;

    setLocalValue(value);
    onInputChange(value);
  };

  const handleBlur = () => {
    const unformatted = localValue.replace(/,/g, "");
    // Format for display on blur
    const parts = unformatted.split(".");
    const intPart = parts[0].replace(/\D/g, "");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formatted = inputMode === "amount" && parts.length > 1 ? `${formattedInt}.${parts[1]}` : formattedInt;
    setLocalValue(formatted);
    onBlur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text for easy replacement
    e.target.select();
    // Unformat for easier editing
    setLocalValue((prev) => prev.replace(/,/g, ""));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {inputMode === "amount" ? "Amount (Naira)" : "Tokens"}
        </span>
        <button
          type="button"
          onClick={onModeToggle}
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
        <div className="absolute top-1/2 transform -translate-y-1/2 text-xl font-semibold text-primary pointer-events-none z-10">
          {inputMode === "amount" ? <DollarSign /> : <CoinsIcon />}
        </div>

        {/* Input Field */}
        <Input
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={inputMode === "amount" ? "0.00" : "0"}
          className="pl-8 pr-4 text-3xl font-bold h-16 bg-transparent border-0 focus:ring-0 focus:outline-none"
        />
      </div>
    </div>
  );
};

// Live Display Info Component - Re-renders with live data
interface LiveDisplayInfoProps {
  amount: number;
  tokenCount: number;
  tokenSymbol: string;
  inputMode: "amount" | "tokens";
  minInvestment: number;
  maxInvestment?: number;
  walletBalance: number;
  onQuickAmount: (percentage: number) => void;
}

const LiveDisplayInfo = ({
  amount,
  tokenCount,
  tokenSymbol,
  inputMode,
  minInvestment,
  maxInvestment,
  walletBalance,
  onQuickAmount,
}: LiveDisplayInfoProps) => {
  const getProgressPercentage = () => {
    const maxAmount = maxInvestment || minInvestment * 10;
    return Math.min(100, (amount / maxAmount) * 100);
  };

  const getConversionText = () => {
    if (inputMode === "amount") {
      return `${tokenCount.toLocaleString()} ${tokenSymbol}`;
    } else {
      return `₦${amount.toLocaleString()}`;
    }
  };

  const quickAmountButtons = [
    { label: "25%", value: 0.25 },
    { label: "50%", value: 0.5 },
    { label: "75%", value: 0.75 },
    { label: "Max", value: 1 },
  ];

  return (
    <>
      {/* Conversion Display */}
      <div className="absolute right-4 top-20 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
        ≈ {getConversionText()}
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-4 gap-2 pt-2 pb-3">
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
              onClick={() => onQuickAmount(value)}
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
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
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
    </>
  );
};

// Main Container Component
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
  onBlur,
  className = "",
}: ModernInvestmentInputProps) {
  const [inputMode, setInputMode] = useState<"amount" | "tokens">("amount");

  const calculateTokens = (amountValue: number) => {
    if (!amountValue || !pricePerToken) return 0;
    return Math.floor(amountValue / pricePerToken);
  };

  const calculateAmount = (tokenValue: number) => {
    if (!tokenValue || !pricePerToken) return 0;
    return tokenValue * pricePerToken;
  };

  // Stable callbacks that won't cause StableInputField to re-render
  const handleInputChange = useCallback(
    (value: string) => {
      // Allow empty string for clearing
      if (value === "") {
        onAmountChange(0);
        onTokenCountChange(0);
        return;
      }

      // Update parent state immediately for live calculations
      const numValue = parseFloat(value) || 0;

      if (inputMode === "amount") {
        onAmountChange(numValue);
        onTokenCountChange(calculateTokens(numValue));
      } else {
        const tokenValue = Math.floor(numValue);
        onTokenCountChange(tokenValue);
        onAmountChange(calculateAmount(tokenValue));
      }
    },
    [inputMode, pricePerToken, onAmountChange, onTokenCountChange]
  );

  const handleModeToggle = useCallback(() => {
    setInputMode(inputMode === "amount" ? "tokens" : "amount");
  }, [inputMode]);

  const handleBlur = useCallback(() => {
    // Apply constraints only on blur
    if (inputMode === "amount") {
      let finalAmount = amount;
      if (minInvestment && finalAmount < minInvestment && finalAmount > 0) {
        finalAmount = minInvestment;
      }
      if (maxInvestment && finalAmount > maxInvestment) {
        finalAmount = maxInvestment;
      }

      // Only update if constraints were applied
      if (finalAmount !== amount) {
        onAmountChange(finalAmount);
        onTokenCountChange(calculateTokens(finalAmount));
      }
    } else {
      // For tokens, ensure it's a whole number
      const finalTokens = Math.floor(tokenCount);
      if (finalTokens !== tokenCount) {
        onTokenCountChange(finalTokens);
        onAmountChange(calculateAmount(finalTokens));
      }
    }

    // Call parent blur handler to sync with form
    onBlur?.();
  }, [
    inputMode,
    amount,
    tokenCount,
    minInvestment,
    maxInvestment,
    onAmountChange,
    onTokenCountChange,
    onBlur,
    calculateTokens,
    calculateAmount,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      }
    },
    []
  );

  // Quick amount buttons handler
  const handleQuickAmount = useCallback(
    (percentage: number) => {
      const maxAmount = maxInvestment || walletBalance;
      const quickAmount = Math.floor(maxAmount * percentage);
      const validAmount = Math.max(
        minInvestment,
        Math.min(quickAmount, maxAmount)
      );

      onAmountChange(validAmount);
      onTokenCountChange(calculateTokens(validAmount));
    },
    [
      maxInvestment,
      walletBalance,
      minInvestment,
      onAmountChange,
      onTokenCountChange,
      calculateTokens,
    ]
  );

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
        <div className="relative">
          {/* Stable Input Field - Never re-renders during typing */}
          <StableInputField
            inputMode={inputMode}
            tokenSymbol={tokenSymbol}
            onInputChange={handleInputChange}
            onModeToggle={handleModeToggle}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            externalValue={
              inputMode === "amount"
                ? (amount ? String(amount) : "")
                : (tokenCount ? String(tokenCount) : "")
            }
            externalSyncKey={inputMode === "amount" ? 1 : 2}
          />

          {/* Live Display Info - Re-renders with live data */}
          <LiveDisplayInfo
            amount={amount}
            tokenCount={tokenCount}
            tokenSymbol={tokenSymbol}
            inputMode={inputMode}
            minInvestment={minInvestment}
            maxInvestment={maxInvestment}
            walletBalance={walletBalance}
            onQuickAmount={handleQuickAmount}
          />
        </div>
      </div>
    </div>
  );
}
