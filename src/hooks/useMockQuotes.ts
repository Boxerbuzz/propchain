import { useState, useEffect } from 'react';
import { ReactNode } from 'react';

export interface QuoteProvider {
  id: string;
  name: string;
  logo: string | ReactNode;
  rate: number;
  fee: number;
  total: number;
  processingTime: string;
  badges: string[];
}

export const useMockQuotes = (
  amount: number,
  fromToken: 'HBAR' | 'USDC' | 'USD',
  toToken: 'HBAR' | 'USDC' | 'USD',
  type: 'buy' | 'sell' | 'swap'
) => {
  const [quotes, setQuotes] = useState<QuoteProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      const baseRates = {
        HBAR: 0.05, // $0.05 per HBAR
        USDC: 1.0,  // $1.00 per USDC
      };

      let mockQuotes: QuoteProvider[] = [];

      if (type === 'buy') {
        mockQuotes = [
          {
            id: 'moonpay',
            name: 'MoonPay',
            logo: 'moonpay',
            rate: baseRates[toToken as 'HBAR' | 'USDC'],
            fee: amount * 0.045,
            total: amount + (amount * 0.045),
            processingTime: '1-3 minutes',
            badges: ['MOST RELIABLE'],
          },
          {
            id: 'transak',
            name: 'Transak',
            logo: 'transak',
            rate: baseRates[toToken as 'HBAR' | 'USDC'] * 0.98,
            fee: amount * 0.035,
            total: amount + (amount * 0.035),
            processingTime: '2-5 minutes',
            badges: ['BEST RATE'],
          },
          {
            id: 'ramp',
            name: 'Ramp Network',
            logo: 'ramp',
            rate: baseRates[toToken as 'HBAR' | 'USDC'],
            fee: amount * 0.05,
            total: amount + (amount * 0.05),
            processingTime: '3-10 minutes',
            badges: [],
          },
        ];
      } else if (type === 'sell') {
        mockQuotes = [
          {
            id: 'moonpay',
            name: 'MoonPay',
            logo: 'moonpay',
            rate: baseRates[fromToken as 'HBAR' | 'USDC'],
            fee: amount * 0.04,
            total: amount - (amount * 0.04),
            processingTime: '1-3 minutes',
            badges: ['MOST RELIABLE'],
          },
          {
            id: 'transak',
            name: 'Transak',
            logo: 'transak',
            rate: baseRates[fromToken as 'HBAR' | 'USDC'] * 1.02,
            fee: amount * 0.03,
            total: amount - (amount * 0.03),
            processingTime: '2-5 minutes',
            badges: ['BEST RATE'],
          },
        ];
      } else if (type === 'swap') {
        mockQuotes = [
          {
            id: 'saucerswap',
            name: 'SaucerSwap',
            logo: 'saucerswap',
            rate: baseRates[toToken as 'HBAR' | 'USDC'] / baseRates[fromToken as 'HBAR' | 'USDC'],
            fee: amount * 0.003,
            total: amount - (amount * 0.003),
            processingTime: '10-30 seconds',
            badges: ['BEST RATE'],
          },
          {
            id: 'pangolin',
            name: 'Pangolin',
            logo: 'pangolin',
            rate: (baseRates[toToken as 'HBAR' | 'USDC'] / baseRates[fromToken as 'HBAR' | 'USDC']) * 0.99,
            fee: amount * 0.005,
            total: amount - (amount * 0.005),
            processingTime: '20-40 seconds',
            badges: [],
          },
          {
            id: 'hsuite',
            name: 'HSuite Swap',
            logo: '⚡',
            rate: (baseRates[toToken as 'HBAR' | 'USDC'] / baseRates[fromToken as 'HBAR' | 'USDC']) * 0.98,
            fee: amount * 0.004,
            total: amount - (amount * 0.004),
            processingTime: '15-35 seconds',
            badges: [],
          },
        ];
      }

      setQuotes(mockQuotes);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [amount, fromToken, toToken, type]);

  return { quotes, isLoading };
};
