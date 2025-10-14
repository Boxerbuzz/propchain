import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'NGN' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amountNGN: number, amountUSD?: number) => string;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>('NGN');

  // Detect user location on mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // First check localStorage
        const saved = localStorage.getItem('preferred_currency');
        if (saved === 'NGN' || saved === 'USD') {
          setCurrencyState(saved);
          return;
        }

        // Try to detect from timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes('Lagos') || timezone.includes('Africa')) {
          setCurrencyState('NGN');
          localStorage.setItem('preferred_currency', 'NGN');
        } else {
          // Default to USD for international users
          setCurrencyState('USD');
          localStorage.setItem('preferred_currency', 'USD');
        }
      } catch (error) {
        // Fallback to NGN
        setCurrencyState('NGN');
      }
    };

    detectLocation();
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  const formatAmount = (amountNGN: number, amountUSD?: number): string => {
    if (currency === 'USD' && amountUSD !== undefined) {
      return `$${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₦${amountNGN.toLocaleString('en-NG')}`;
  };

  const getCurrencySymbol = (): string => {
    return currency === 'USD' ? '$' : '₦';
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, getCurrencySymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
