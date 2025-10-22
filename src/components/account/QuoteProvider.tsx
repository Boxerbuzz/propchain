import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuoteProvider as QuoteProviderType } from "@/hooks/useMockQuotes";
import { ProviderLogo } from "./ProviderLogo";

interface QuoteProviderProps {
  quote: QuoteProviderType;
  onSelect: () => void;
  isSelected: boolean;
}

export function QuoteProvider({ quote, onSelect, isSelected }: QuoteProviderProps) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:border-primary ${
        isSelected ? "border-primary bg-accent" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div>
            <ProviderLogo provider={typeof quote.logo === 'string' ? quote.logo : ''} size="md" />
            <p className="text-sm text-muted-foreground">{quote.processingTime}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">${quote.total.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Fee: ${quote.fee.toFixed(2)}</p>
        </div>
      </div>
      
      {quote.badges.length > 0 && (
        <div className="flex gap-2">
          {quote.badges.map((badge) => (
            <Badge key={badge} variant="secondary" className="text-xs">
              {badge}
            </Badge>
          ))}
        </div>
      )}

      {isSelected && (
        <Button className="w-full mt-3" size="sm">
          Continue with {quote.name}
        </Button>
      )}
    </Card>
  );
}
