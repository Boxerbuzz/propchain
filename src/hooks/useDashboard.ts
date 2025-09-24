import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usePortfolio } from "./usePortfolio";
import { userApi } from "../api/users";
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

interface UseDashboardReturn {
  stats: DashboardStats;
  wallets: Wallet[];
  isLoading: boolean;
  error: string | null;
  shouldShowKycAlert: boolean;
  refetch: () => void;
}

export const useDashboard = (): UseDashboardReturn => {
  const { currentUser, isAuthenticated } = useAuth();
  const { portfolioStats, investments, isLoading: portfolioLoading, error: portfolioError } = usePortfolio();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = async () => {
    if (!isAuthenticated || !currentUser?.id) {
      setWallets([]);
      return;
    }

    try {
      const response = await userApi.getUserWallets(currentUser.id);
      if (response.success && response.data) {
        setWallets(response.data);
      } else {
        console.error("Failed to fetch wallets:", response.error);
      }
    } catch (err: any) {
      console.error("Failed to fetch wallets:", err);
    }
  };

  const refetch = () => {
    fetchWallets();
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isAuthenticated || !currentUser?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await fetchWallets();
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser?.id, isAuthenticated]);

  // Calculate dashboard stats
  const stats: DashboardStats = {
    portfolioValue: portfolioStats?.currentValue || 0,
    totalInvested: portfolioStats?.totalInvested || 0,
    totalReturns: portfolioStats?.totalReturn || 0,
    propertiesCount: investments?.length || 0,
    monthlyReturns: 0, // TODO: Calculate based on dividend payments
    walletBalance: wallets.reduce((sum, wallet) => sum + (wallet.balance_ngn || 0), 0),
    returnPercentage: portfolioStats?.totalInvested > 0 
      ? ((portfolioStats?.totalReturn || 0) / portfolioStats.totalInvested) * 100 
      : 0
  };

  // Determine if KYC alert should show
  const shouldShowKycAlert = currentUser?.kyc_status !== 'verified';

  return {
    stats,
    wallets,
    isLoading: isLoading || portfolioLoading,
    error: error || portfolioError,
    shouldShowKycAlert,
    refetch
  };
};