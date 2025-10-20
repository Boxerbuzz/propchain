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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10">
              {typeof selectedToken?.icon === 'string' ? (
                <span className="text-3xl">{selectedToken?.icon || "?"}</span>
              ) : (
                selectedToken?.icon || "?"
              )}
            </div>
            <div>
              <p className="font-semibold">{selectedToken?.symbol || "Select"}</p>
              <p className="text-sm text-muted-foreground">
                {selectedToken?.name || "Choose token"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {showBalance && selectedToken && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="font-semibold">{selectedToken.balance?.toFixed(4)}</p>
              </div>
            )}
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </Card>
    </div>
  );
}
