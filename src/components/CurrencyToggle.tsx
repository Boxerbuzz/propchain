import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { CurrencyNgnIcon, CurrencyDollarIcon } from "@phosphor-icons/react";

export const CurrencyToggle = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="inline-flex items-center gap-1 bg-muted rounded-lg p-1 border border-border w-fit">
      <Button
        size="sm"
        variant={currency === "NGN" ? "default" : "ghost"}
        onClick={() => setCurrency("NGN")}
        className="h-8 px-3 text-xs font-medium"
      >
        <CurrencyNgnIcon />
      </Button>
      <Button
        size="sm"
        variant={currency === "USD" ? "default" : "ghost"}
        onClick={() => setCurrency("USD")}
        className="h-8 px-3 text-xs font-medium"
      >
        <CurrencyDollarIcon />
      </Button>
    </div>
  );
};
