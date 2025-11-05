import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWalletBalance } from "./useWalletBalance";

interface WalletTokenBalance {
  tokenId: string;
  tokenSymbol: string;
  tokenName: string;
  balance: number; // Actual balance from wallet
  decimals: number;
  displayBalance: string; // Formatted balance
  propertyTitle?: string;
  propertyId?: string;
  tokenizationId?: string;
  tokenizationType?: string;
  pricePerToken?: number;
  totalValueNgn?: number;
  totalValueUsd?: number;
  source: 'wallet' | 'database'; // Distinguish between on-chain and database records
}

export const useWalletTokenBalances = () => {
  const { balance: walletBalance, isLoading: isLoadingWallet } = useWalletBalance();

  return useQuery({
    queryKey: ["wallet-token-balances", walletBalance?.associatedTokens],
    queryFn: async (): Promise<WalletTokenBalance[]> => {
      if (!walletBalance?.associatedTokens || walletBalance.associatedTokens.length === 0) {
        return [];
      }

      // Get all token IDs from wallet
      const tokenIds = walletBalance.associatedTokens.map((token) => token.tokenId);

      // Fetch tokenization metadata for these tokens
      const { data: tokenizations, error } = await supabase
        .from("tokenizations")
        .select(`
          id,
          token_id,
          token_name,
          token_symbol,
          tokenization_type,
          price_per_token,
          property_id,
          properties!inner (
            title
          )
        `)
        .in("token_id", tokenIds);

      if (error) {
        console.error("Error fetching tokenization metadata:", error);
      }

      // Create a map of token metadata
      const tokenMetadataMap = new Map(
        (tokenizations || []).map((t: any) => [
          t.token_id,
          {
            propertyTitle: t.properties.title,
            propertyId: t.property_id,
            tokenizationId: t.id,
            tokenizationType: t.tokenization_type,
            pricePerToken: t.price_per_token,
          },
        ])
      );

      // Merge wallet balances with metadata
      const enrichedTokens: WalletTokenBalance[] = walletBalance.associatedTokens.map(
        (walletToken) => {
          const metadata = tokenMetadataMap.get(walletToken.tokenId);
          const actualBalance =
            walletToken.decimals > 0
              ? walletToken.balance / Math.pow(10, walletToken.decimals)
              : walletToken.balance;

          const totalValueNgn = metadata?.pricePerToken
            ? actualBalance * metadata.pricePerToken
            : undefined;

          const totalValueUsd = totalValueNgn && walletBalance?.exchangeRates?.usdToNgn
            ? totalValueNgn / walletBalance.exchangeRates.usdToNgn
            : undefined;

          return {
            tokenId: walletToken.tokenId,
            tokenSymbol: metadata?.tokenizationType 
              ? walletToken.tokenSymbol 
              : walletToken.tokenSymbol,
            tokenName: metadata?.propertyTitle || walletToken.tokenName,
            balance: actualBalance,
            decimals: walletToken.decimals,
            displayBalance: actualBalance.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: walletToken.decimals,
            }),
            propertyTitle: metadata?.propertyTitle,
            propertyId: metadata?.propertyId,
            tokenizationId: metadata?.tokenizationId,
            tokenizationType: metadata?.tokenizationType,
            pricePerToken: metadata?.pricePerToken,
            totalValueNgn,
            totalValueUsd,
            source: metadata ? 'wallet' : 'wallet', // All are from wallet now
          };
        }
      );

      return enrichedTokens;
    },
    enabled: !!walletBalance?.associatedTokens && walletBalance.associatedTokens.length > 0,
    staleTime: 30000, // 30 seconds
  });
};
