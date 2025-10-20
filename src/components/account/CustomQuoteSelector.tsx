import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { QuoteProvider as QuoteProviderType } from "@/hooks/useMockQuotes";
import { ProviderLogo } from "./ProviderLogo";

interface CustomQuoteSelectorProps {
  selectedQuote: QuoteProviderType | null;
  label: string;
  onClick: () => void;
}

export function CustomQuoteSelector({
  selectedQuote,
  label,
  onClick,
}: CustomQuoteSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <Card
        className="p-4 cursor-pointer hover:bg-accent transition-colors"
        onClick={onClick}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
              {selectedQuote?.logo ? (
                typeof selectedQuote.logo === 'string' ? (
                  <ProviderLogo provider={selectedQuote.logo} size="sm" />
                ) : (
                  selectedQuote.logo
                )
              ) : (
                "?"
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm sm:text-base truncate">
                {selectedQuote?.name || "Select provider"}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {selectedQuote?.processingTime || "Choose best rate"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {selectedQuote && (
              <div className="text-right hidden sm:block">
                <p className="font-bold text-base sm:text-lg">${selectedQuote.total.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  Fee: ${selectedQuote.fee.toFixed(2)}
                </p>
              </div>
            )}
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </div>
        </div>
      </Card>
    </div>
  );
}
