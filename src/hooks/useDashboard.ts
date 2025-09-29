import { useQuery } from '@tanstack/react-query';
import { useAuth } from "@/context/AuthContext";
import { usePortfolio } from "./usePortfolio";
import { supabaseService } from "@/services/supabaseService";
import { Wallet } from "../types";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  portfolioValue: number;
  totalInvested: number;
  totalReturns: number;
  propertiesCount: number;
  monthlyReturns: number;
  walletBalance: number;
  returnPercentage: number;
}

interface KYCStatus {
  status: string;
  kyc_level: string;
  investment_limit_ngn: number;
  expires_at: string | null;
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

  const kycQuery = useQuery({
    queryKey: ['kyc-status', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('status, kyc_level, investment_limit_ngn, expires_at')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching KYC status:', error);
        return null;
      }
      
      return data as KYCStatus | null;
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const portfolioData = portfolioQuery.data;
  const wallets = walletsQuery.data || [];
  const kycStatus = kycQuery.data;
  
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

  const shouldShowKycAlert = !kycStatus || kycStatus.status !== 'approved' || 
    (kycStatus.expires_at && new Date(kycStatus.expires_at) < new Date());

  return {
    stats,
    wallets,
    kycStatus,
    isLoading: portfolioQuery.isLoading || walletsQuery.isLoading || kycQuery.isLoading,
    error: portfolioQuery.error?.message || walletsQuery.error?.message || kycQuery.error?.message || null,
    shouldShowKycAlert,
    refetch: () => {
      portfolioQuery.refetch();
      walletsQuery.refetch();
      kycQuery.refetch();
    }
  };
};