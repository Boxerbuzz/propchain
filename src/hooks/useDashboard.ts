import { useQuery } from '@tanstack/react-query';
import { useAuth } from "@/context/AuthContext";
import { usePortfolio } from "./usePortfolio";
import { supabaseService } from "@/services/supabaseService";
import { Wallet } from "../types";

interface DashboardStats {
  portfolioValue: number;
  totalInvested: number;
  totalReturns: number;
  propertiesCount: number;
  monthlyReturns: number;
  walletBalance: number;
  returnPercentage: number;
}

export const useDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const portfolioQuery = usePortfolio();
  
  const walletsQuery = useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) return [];
      return await supabaseService.wallets.listByUser(user.id) as unknown as Wallet[];
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  const portfolioData = portfolioQuery.data;
  const wallets = walletsQuery.data || [];
  
  const stats: DashboardStats = {
    portfolioValue: portfolioData?.portfolioStats?.currentValue || 0,
    totalInvested: portfolioData?.portfolioStats?.totalInvested || 0,
    totalReturns: portfolioData?.portfolioStats?.totalReturn || 0,
    propertiesCount: portfolioData?.investments?.length || 0,
    monthlyReturns: 0,
    walletBalance: wallets.reduce((sum, wallet) => sum + (wallet.balance_ngn || 0), 0),
    returnPercentage: portfolioData?.portfolioStats?.totalInvested > 0 
      ? ((portfolioData?.portfolioStats?.totalReturn || 0) / portfolioData.portfolioStats.totalInvested) * 100 
      : 0
  };

  const shouldShowKycAlert = user?.kyc_status !== 'verified';

  return {
    stats,
    wallets,
    isLoading: portfolioQuery.isLoading || walletsQuery.isLoading,
    error: portfolioQuery.error?.message || walletsQuery.error?.message || null,
    shouldShowKycAlert,
    refetch: () => {
      portfolioQuery.refetch();
      walletsQuery.refetch();
    }
  };
};