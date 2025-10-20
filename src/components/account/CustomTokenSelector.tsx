import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface Token {
  symbol: string;
  name: string;
  icon: string | ReactNode;
  balance?: number;
}

interface CustomTokenSelectorProps {
  selectedToken: Token | null;
  label: string;
  showBalance?: boolean;
  onClick: () => void;
}

export function CustomTokenSelector({
  selectedToken,
  label,
  showBalance = false,
  onClick,
}: CustomTokenSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <Card
        className="p-4 cursor-pointer hover:bg-accent transition-colors"
        onClick={onClick}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
              {typeof selectedToken?.icon === 'string' ? (
                <span className="text-3xl">{selectedToken?.icon || "?"}</span>
              ) : (
                selectedToken?.icon || "?"
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm sm:text-base truncate">{selectedToken?.symbol || "Select"}</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {selectedToken?.name || "Choose token"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {showBalance && selectedToken && (
              <div className="text-right hidden sm:block">
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="font-semibold">{selectedToken.balance?.toFixed(4)}</p>
              </div>
            )}
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </div>
        </div>
      </Card>
    </div>
  );
}
