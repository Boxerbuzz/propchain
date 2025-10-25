import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TokenHolding {
  id: string;
  balance: number;
  acquisition_date: string;
  tokenization_id: string;
  property_id: string;
  token_name: string;
  token_symbol: string;
  hedera_token_id: string | null;
  tokenization_type: string;
  property_title: string;
}

export const useTokenHoldings = () => {
  return useQuery({
    queryKey: ["token-holdings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("token_holdings")
        .select(`
          id,
          balance,
          acquisition_date,
          tokenization_id,
          property_id,
          tokenizations!inner (
            token_name,
            token_symbol,
            hedera_token_id,
            tokenization_type
          ),
          properties!inner (
            title
          )
        `)
        .eq("user_id", user.id)
        .gt("balance", 0)
        .order("acquisition_date", { ascending: false });

      if (error) throw error;

      // Transform the data to flatten the nested structure
      const holdings: TokenHolding[] = (data || []).map((holding: any) => ({
        id: holding.id,
        balance: holding.balance,
        acquisition_date: holding.acquisition_date,
        tokenization_id: holding.tokenization_id,
        property_id: holding.property_id,
        token_name: holding.tokenizations.token_name,
        token_symbol: holding.tokenizations.token_symbol,
        hedera_token_id: holding.tokenizations.hedera_token_id,
        tokenization_type: holding.tokenizations.tokenization_type,
        property_title: holding.properties.title,
      }));

      return holdings;
    },
    staleTime: 30000, // 30 seconds
  });
};
