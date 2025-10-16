import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
  
  const selected = currencies.find(c => c.id === selectedCurrency);
  const ngnValue = selected ? parseFloat(amount || "0") * (selected.balanceNgn / (selected.balance || 1)) : 0;

  const handleMaxClick = () => {
    if (selected) {
      onAmountChange(selected.balance.toString());
    }
  };

  return (
    <div className="space-y-2">
      <InputGroup 
        className={cn(
          "h-auto sm:h-16",
          error && "ring-2 ring-destructive/50",
          selected?.color === 'purple' && !error && "ring-1 ring-purple-500/20",
          selected?.color === 'blue' && !error && "ring-1 ring-blue-500/20",
          className
        )}
      >
        {/* Currency Selector - Desktop Left / Mobile Top */}
        <InputGroupAddon align="block-start" className="sm:hidden border-b pb-3">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton 
                size="sm" 
                className="gap-2 px-3 w-full justify-between"
                disabled={disabled}
              >
                <div className="flex items-center gap-2">
                  <img src={selected?.icon} alt={selected?.name} className="w-5 h-5" />
                  <span className="font-semibold">{selected?.name}</span>
                </div>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
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
                          {currency.balance.toFixed(2)}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </InputGroupAddon>

        <InputGroupAddon align="inline-start" className="hidden sm:flex min-w-[130px]">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton 
                size="sm" 
                className="gap-2 px-3"
                disabled={disabled}
              >
                <img src={selected?.icon} alt={selected?.name} className="w-5 h-5" />
                <span className="font-semibold">{selected?.name}</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
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
                          {currency.balance.toFixed(2)}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </InputGroupAddon>

        {/* Amount Input with NGN display */}
        <div className="flex-1 flex flex-col justify-center px-3 py-2 min-w-0">
          <InputGroupInput
            type="number"
            placeholder={placeholder}
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            disabled={disabled}
            className="text-lg font-semibold p-0 h-auto border-0 focus-visible:ring-0"
            step="any"
            min="0"
          />
          {amount && parseFloat(amount) > 0 && (
            <span className="text-xs text-muted-foreground mt-0.5">
              ≈ ₦{ngnValue.toLocaleString('en-NG', { maximumFractionDigits: 2 })}
            </span>
          )}
        </div>

        {/* Max Button + Balance - Right Side */}
        <InputGroupAddon align="inline-end" className="gap-2 pr-3">
          {showMaxButton && (
            <InputGroupButton 
              size="xs" 
              onClick={handleMaxClick}
              disabled={disabled || !selected?.balance}
            >
              Max
            </InputGroupButton>
          )}
          {showBalance && selected && (
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">
                {selected.balance.toFixed(2)}
              </span>
            </div>
          )}
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
