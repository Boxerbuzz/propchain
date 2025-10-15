/**
 * Currency conversion utilities for wallet balances
 * Uses exchange rates from sync-wallet-balance as single source of truth
 */

export interface ExchangeRates {
  hbarToUsd: number;
  usdToNgn: number;
}

// Cache for exchange rates (refreshed every 30 seconds with wallet balance sync)
let cachedRates: ExchangeRates | null = null;
let lastUpdate: number = 0;

export const CACHE_DURATION_MS = 30000; // 30 seconds

/**
 * Update cached exchange rates
 */
export const updateExchangeRates = (rates: ExchangeRates) => {
  cachedRates = rates;
  lastUpdate = Date.now();
};

/**
 * Get current exchange rates from cache
 */
export const getExchangeRates = (): ExchangeRates | null => {
  if (!cachedRates || Date.now() - lastUpdate > CACHE_DURATION_MS) {
    return null;
  }
  return cachedRates;
};

/**
 * Convert HBAR to fiat currency
 */
export const convertHbarToFiat = (
  hbar: number,
  rates: ExchangeRates,
  targetCurrency: "NGN" | "USD"
): number => {
  const usd = hbar * rates.hbarToUsd;
  if (targetCurrency === "USD") {
    return usd;
  }
  return usd * rates.usdToNgn;
};

/**
 * Convert USDC to fiat currency
 * USDC maintains 1:1 peg with USD
 */
export const convertUsdcToFiat = (
  usdc: number,
  rates: ExchangeRates,
  targetCurrency: "NGN" | "USD"
): number => {
  if (targetCurrency === "USD") {
    return usdc; // 1:1 peg
  }
  return usdc * rates.usdToNgn;
};

/**
 * Calculate exchange rates from wallet balance data
 */
export const calculateRatesFromBalance = (
  balanceHbar: number,
  balanceUsd: number,
  balanceNgn: number
): ExchangeRates | null => {
  if (balanceHbar === 0 || balanceUsd === 0) {
    return null;
  }

  return {
    hbarToUsd: balanceUsd / balanceHbar,
    usdToNgn: balanceNgn / balanceUsd,
  };
};

/**
 * Format amount with currency symbol
 */
export const formatCurrencyAmount = (
  amount: number,
  currency: "HBAR" | "USDC" | "NGN" | "USD"
): string => {
  switch (currency) {
    case "HBAR":
      return `${amount.toFixed(4)} ℏ`;
    case "USDC":
      return `${amount.toFixed(2)} USDC`;
    case "NGN":
      return `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "USD":
      return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    default:
      return amount.toString();
  }
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency: "HBAR" | "USDC" | "NGN" | "USD"): string => {
  switch (currency) {
    case "HBAR":
      return "ℏ";
    case "USDC":
      return "USDC";
    case "NGN":
      return "₦";
    case "USD":
      return "$";
    default:
      return "";
  }
};
