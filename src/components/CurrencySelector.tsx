import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CurrencySelectorProps {
  selectedCurrency: "hbar" | "usdc";
  onCurrencyChange: (currency: "hbar" | "usdc") => void;
  hbarBalance: number;
  hbarBalanceNgn: number;
  usdcBalance: number;
  usdcBalanceNgn: number;
  className?: string;
  showBalances?: boolean;
}

export default function CurrencySelector({
  selectedCurrency,
  onCurrencyChange,
  hbarBalance,
  hbarBalanceNgn,
  usdcBalance,
  usdcBalanceNgn,
  className,
  showBalances = true,
}: CurrencySelectorProps) {
  const currencies = [
    {
      id: "hbar" as const,
      name: "HBAR",
      fullName: "Hedera",
      icon: "/hedera.svg",
      balance: hbarBalance,
      balanceNgn: hbarBalanceNgn,
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      ringColor: "ring-purple-500",
      disabled: hbarBalance === 0,
    },
    {
      id: "usdc" as const,
      name: "USDC",
      fullName: "USD Coin",
      icon: "/usdc.svg",
      balance: usdcBalance,
      balanceNgn: usdcBalanceNgn,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      ringColor: "ring-blue-500",
      disabled: usdcBalance === 0,
    },
  ];

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
      {currencies.map((currency) => {
        const isSelected = selectedCurrency === currency.id;
        const isDisabled = currency.disabled;

        return (
          <Card
            key={currency.id}
            className={cn(
              "cursor-pointer transition-all hover:scale-[1.02]",
              isSelected &&
                `ring-2 ${currency.ringColor} ${currency.bgColor} shadow-lg`,
              !isSelected && "hover:shadow-md",
              isDisabled && "opacity-50 cursor-not-allowed hover:scale-100"
            )}
            onClick={() => !isDisabled && onCurrencyChange(currency.id)}
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br",
                      currency.color
                    )}
                  >
                    <img
                      src={currency.icon}
                      alt={currency.name}
                      className="h-7 w-7"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{currency.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currency.fullName}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <Badge
                    variant="default"
                    className={cn("bg-gradient-to-r", currency.color)}
                  >
                    Selected
                  </Badge>
                )}
              </div>

              {showBalances && (
                <div className="space-y-1">
                  <p className="text-2xl font-bold">
                    {currency.balance.toFixed(currency.id === "hbar" ? 4 : 2)}{" "}
                    {currency.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ≈ ₦{currency.balanceNgn.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  {isDisabled && (
                    <Badge variant="secondary" className="mt-2">
                      No balance
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
