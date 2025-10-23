import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MoneyInputProps {
  value: number;
  onChange?: (value: number) => void;
  onValueChange?: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  currency?: string;
  min?: number;
  max?: number;
}

const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onChange,
  onValueChange,
  placeholder = '0',
  disabled = false,
  required = false,
  className,
  currency = '₦',
  min,
  max,
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Format number with commas
  const formatNumber = (num: number): string => {
    if (isNaN(num) || num === 0) return '';
    return num.toLocaleString('en-US');
  };

  // Parse formatted string back to number
  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow completely empty input
    if (inputValue === '' || inputValue === currency) {
      setDisplayValue('');
      if (onChange) onChange(0);
      if (onValueChange) onValueChange(0);
      return;
    }
    
    const numericValue = parseNumber(inputValue);
    
    setDisplayValue(formatNumber(numericValue));
    if (onChange) onChange(numericValue);
    if (onValueChange) onValueChange(numericValue);
  };

  const handleBlur = () => {
    // Ensure the display value is properly formatted on blur
    setDisplayValue(formatNumber(value));
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
        {currency}
      </span>
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={(e) => e.target.select()}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={cn("pl-8", className)}
      />
    </div>
  );
};

export default MoneyInput;