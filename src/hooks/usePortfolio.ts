import { useState, useEffect } from "react";
import { investmentApi } from "../api/investments";
import { useAuth } from "../context/AuthContext";
import { Investment, TokenHolding, DividendPayment } from "../types";
import { toast } from "react-hot-toast";

interface PortfolioStats {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  monthlyDividends: number;
  totalProperties: number;
  activeInvestments: number;
}

interface UsePortfolioReturn {
  portfolioStats: PortfolioStats;
  investments: Investment[];
  tokenHoldings: TokenHolding[];
  dividendPayments: DividendPayment[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const initialStats: PortfolioStats = {
  totalInvested: 0,
  currentValue: 0,
  totalReturn: 0,
  returnPercentage: 0,
  monthlyDividends: 0,
  totalProperties: 0,
  activeInvestments: 0
};

export const usePortfolio = (): UsePortfolioReturn => {
  const { currentUser, isAuthenticated } = useAuth();
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>(initialStats);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
  const [dividendPayments, setDividendPayments] = useState<DividendPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolioData = async () => {
    if (!isAuthenticated || !currentUser?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch user investments
      const investmentsResponse = await investmentApi.getUserInvestments(currentUser.id);
      if (investmentsResponse.success && investmentsResponse.data) {
        setInvestments(investmentsResponse.data);
      }

      // Fetch token holdings
      const holdingsResponse = await investmentApi.getTokenHoldings(currentUser.id);
      if (holdingsResponse.success && holdingsResponse.data) {
        setTokenHoldings(holdingsResponse.data);
        
        // Calculate portfolio stats from token holdings
        const holdings = holdingsResponse.data;
        const totalInvested = holdings.reduce((sum: number, h: any) => sum + (h.total_invested_ngn || 0), 0);
        const unrealizedReturns = holdings.reduce((sum: number, h: any) => sum + (h.unrealized_returns_ngn || 0), 0);
        const realizedReturns = holdings.reduce((sum: number, h: any) => sum + (h.realized_returns_ngn || 0), 0);
        const currentValue = totalInvested + unrealizedReturns;
        const totalReturn = unrealizedReturns + realizedReturns;
        const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

        setPortfolioStats({
          totalInvested,
          currentValue,
          totalReturn,
          returnPercentage,
          monthlyDividends: 0, // Will be calculated from dividend data
          totalProperties: holdings.length,
          activeInvestments: holdings.filter((h: any) => h.balance > 0).length
        });
      }

    } catch (err: any) {
      const errorMessage = err.message || "Failed to load portfolio data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchPortfolioData();
  };

  useEffect(() => {
    fetchPortfolioData();
  }, [currentUser?.id, isAuthenticated]);

  return {
    portfolioStats,
    investments,
    tokenHoldings,
    dividendPayments,
    isLoading,
    error,
    refetch
  };
};