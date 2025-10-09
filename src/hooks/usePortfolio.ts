import { useQuery } from '@tanstack/react-query';
import { supabaseService } from "@/services/supabaseService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Investment, TokenHolding, DividendPayment } from "../types";

interface PortfolioStats {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  monthlyDividends: number;
  totalProperties: number;
  activeInvestments: number;
}

export const usePortfolio = () => {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['portfolio', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) {
        return {
          portfolioStats: {
            totalInvested: 0,
            currentValue: 0,
            totalReturn: 0,
            returnPercentage: 0,
            monthlyDividends: 0,
            totalProperties: 0,
            activeInvestments: 0
          },
          investments: [],
          tokenHoldings: [],
          dividendPayments: []
        };
      }

      const [investments, tokenHoldings, dividendPayments] = await Promise.all([
        supabaseService.investments.listByUser(user.id),
        supabaseService.investments.getTokenHoldings(user.id),
        supabase
          .from('dividend_payments')
          .select(`
            *,
            distribution:dividend_distributions(*)
          `)
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false })
      ]);
      
      const totalInvested = tokenHoldings.reduce((sum: number, h: any) => sum + (h.total_invested_ngn || 0), 0);
      const unrealizedReturns = tokenHoldings.reduce((sum: number, h: any) => sum + (h.unrealized_returns_ngn || 0), 0);
      const realizedReturns = tokenHoldings.reduce((sum: number, h: any) => sum + (h.realized_returns_ngn || 0), 0);
      const currentValue = totalInvested + unrealizedReturns;
      const totalReturn = unrealizedReturns + realizedReturns;
      const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

      const portfolioStats: PortfolioStats = {
        totalInvested,
        currentValue,
        totalReturn,
        returnPercentage,
        monthlyDividends: 0,
        totalProperties: tokenHoldings.length,
        activeInvestments: tokenHoldings.filter((h: any) => h.balance > 0).length
      };

      return {
        portfolioStats,
        investments: investments as unknown as Investment[],
        tokenHoldings: tokenHoldings as unknown as TokenHolding[],
        dividendPayments: (dividendPayments.data || []) as unknown as DividendPayment[]
      };
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};