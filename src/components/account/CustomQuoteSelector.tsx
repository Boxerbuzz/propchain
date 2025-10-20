import { Card } from "@/components/ui/card";
import { ChevronRight, Quote } from "lucide-react";
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
  console.log(selectedQuote);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <Card
        className="p-4 cursor-pointer hover:bg-accent transition-colors"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="items-center space-y-1 flex">
              {selectedQuote == null ? (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3">
                  <Quote className="h-5 w-5 text-muted-foreground" />
                </div>
              ) : (
                <ProviderLogo
                  provider={selectedQuote.logo as string}
                  size="sm"
                />
              )}
              <p className="text-sm text-muted-foreground">
                {selectedQuote?.processingTime || "Choose best rate"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedQuote && (
              <div className="text-right">
                <p className="font-bold text-lg">
                  ${selectedQuote.total.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Fee: ${selectedQuote.fee.toFixed(2)}
                </p>
              </div>
            )}
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </Card>
    </div>
  );
}
