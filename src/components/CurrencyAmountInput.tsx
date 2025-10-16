import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Currency {
  id: 'hbar' | 'usdc';
  name: string;
  icon: string;
  balance: number;
  balanceNgn: number;
  color: string;
}

interface CurrencyAmountInputProps {
  currencies: Currency[];
  selectedCurrency: 'hbar' | 'usdc';
  onCurrencyChange: (currency: 'hbar' | 'usdc') => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  showMaxButton?: boolean;
  showBalance?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function CurrencyAmountInput({
  currencies,
  selectedCurrency,
  onCurrencyChange,
  amount,
  onAmountChange,
  showMaxButton = true,
  showBalance = true,
  placeholder = "0.00",
  disabled = false,
  error = false,
  className,
}: CurrencyAmountInputProps) {
  const [open, setOpen] = React.useState(false);
  const [displayValue, setDisplayValue] = React.useState('');
  
  const selected = currencies.find(c => c.id === selectedCurrency);
  const numericValue = parseFloat(amount || "0");
  const ngnValue = selected ? numericValue * (selected.balanceNgn / (selected.balance || 1)) : 0;

  // Format number with commas like MoneyInput
  const formatNumber = (num: string): string => {
    if (!num || num === '0') return '';
    const parsed = parseFloat(num);
    if (isNaN(parsed) || parsed === 0) return '';
    return parsed.toLocaleString('en-US', { maximumFractionDigits: 8 });
  };

  // Update display value when amount changes
  React.useEffect(() => {
    setDisplayValue(formatNumber(amount));
  }, [amount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow completely empty input
    if (inputValue === '') {
      setDisplayValue('');
      onAmountChange('0');
      return;
    }
    
    // Remove commas for parsing
    const cleaned = inputValue.replace(/,/g, '');
    
    // Only allow numbers and decimal point
    if (!/^\d*\.?\d*$/.test(cleaned)) {
      return;
    }
    
    onAmountChange(cleaned || '0');
  };

  const handleBlur = () => {
    setDisplayValue(formatNumber(amount));
  };

  const handleMaxClick = () => {
    if (selected) {
      onAmountChange(selected.balance.toString());
    }
  };

  return (
    <div className="space-y-2">
      <div className={cn(
        "relative flex items-center gap-2",
        className
      )}>
        {/* Currency Selector Dropdown */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              className={cn(
                "flex items-center gap-2 h-10 px-3 min-w-[110px]",
                selected?.color === 'purple' && "border-purple-500/30",
                selected?.color === 'blue' && "border-blue-500/30"
              )}
            >
              <img src={selected?.icon} alt={selected?.name} className="w-5 h-5" />
              <span className="font-semibold">{selected?.name}</span>
              <ChevronDown className="w-4 h-4 ml-auto opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0" align="start">
            <Command>
              <CommandList>
                <CommandEmpty>No currency found.</CommandEmpty>
                <CommandGroup>
                  {currencies.map((currency) => (
                    <CommandItem
                      key={currency.id}
                      value={currency.id}
                      onSelect={() => {
                        onCurrencyChange(currency.id);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <img src={currency.icon} alt={currency.name} className="w-5 h-5" />
                        <span className="font-medium">{currency.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {currency.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Amount Input */}
        <div className="relative flex-1">
          <Input
            type="text"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={(e) => e.target.select()}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "h-10 pr-16 font-mono text-right",
              error && "border-destructive focus-visible:ring-destructive"
            )}
          />
          
          {/* Max Button */}
          {showMaxButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMaxClick}
              disabled={disabled || !selected?.balance}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 text-xs"
            >
              Max
            </Button>
          )}
        </div>
      </div>

      {/* Balance and NGN Conversion Row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div>
          {numericValue > 0 && (
            <span>≈ ₦{ngnValue.toLocaleString('en-NG', { maximumFractionDigits: 2 })}</span>
          )}
        </div>
        <div>
          {showBalance && selected && (
            <span>Balance: {selected.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })} {selected.name}</span>
          )}
        </div>
      </div>
    </div>
  );
}
