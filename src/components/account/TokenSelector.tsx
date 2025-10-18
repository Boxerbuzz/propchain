import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface Token {
  symbol: string;
  name: string;
  icon: string;
  balance?: number;
}

interface TokenSelectorProps {
  selectedToken: string;
  onSelectToken: (token: string) => void;
  tokens: Token[];
  showBalance?: boolean;
}

export function TokenSelector({
  selectedToken,
  onSelectToken,
  tokens,
  showBalance = true,
}: TokenSelectorProps) {
  const selected = tokens.find((t) => t.symbol === selectedToken);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{selected?.icon}</span>
            <div className="text-left">
              <p className="font-semibold">{selected?.symbol}</p>
              {showBalance && selected?.balance !== undefined && (
                <p className="text-xs text-muted-foreground">
                  Balance: {selected.balance.toFixed(4)}
                </p>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {tokens.map((token) => (
          <DropdownMenuItem
            key={token.symbol}
            onClick={() => onSelectToken(token.symbol)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2 w-full">
              <span className="text-xl">{token.icon}</span>
              <div className="flex-1">
                <p className="font-semibold">{token.symbol}</p>
                <p className="text-xs text-muted-foreground">{token.name}</p>
              </div>
              {showBalance && token.balance !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {token.balance.toFixed(4)}
                </p>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
