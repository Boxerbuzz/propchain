import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const usePortfolioDetail = (tokenizationId: string) => {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['portfolio-detail', tokenizationId, user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id || !tokenizationId) {
        throw new Error('Authentication required');
      }

      // Fetch token holding for this tokenization
      const { data: tokenHolding, error: holdingError } = await supabase
        .from('token_holdings')
        .select(`
          *,
          tokenizations!inner(
            *,
            properties!inner(
              *,
              property_images(
                id,
                image_url,
                is_primary,
                sort_order
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('tokenization_id', tokenizationId)
        .maybeSingle();

      if (holdingError) {
        console.error('Error fetching token holding:', holdingError);
        throw holdingError;
      }

      if (!tokenHolding) {
        throw new Error('Investment not found');
      }

      // Fetch dividend payments for this tokenization
      const { data: dividendPayments, error: dividendsError } = await supabase
        .from('dividend_payments')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('tokenization_id', tokenizationId)
        .order('created_at', { ascending: false });

      if (dividendsError) {
        console.error('Error fetching dividends:', dividendsError);
      }

      // Fetch property activity logs
      const propertyId = (tokenHolding.tokenizations as any)?.properties?.id;
      const { data: activityLogs, error: activityError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activityError) {
        console.error('Error fetching activity logs:', activityError);
      }

      // Fetch governance proposals
      const { data: proposals, error: proposalsError } = await supabase
        .from('governance_proposals')
        .select('*')
        .eq('tokenization_id', tokenizationId)
        .order('created_at', { ascending: false });

      if (proposalsError) {
        console.error('Error fetching proposals:', proposalsError);
      }

      // Fetch property documents
      const { data: documents, error: documentsError } = await supabase
        .from('property_documents')
        .select('*')
        .eq('property_id', propertyId)
        .order('uploaded_at', { ascending: false });

      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
      }

      // Fetch chat room info
      const { data: chatRoom, error: chatError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('tokenization_id', tokenizationId)
        .maybeSingle();

      if (chatError) {
        console.error('Error fetching chat room:', chatError);
      }

      return {
        tokenHolding,
        tokenization: (tokenHolding.tokenizations as any),
        property: (tokenHolding.tokenizations as any)?.properties,
        dividendPayments: dividendPayments || [],
        activityLogs: activityLogs || [],
        proposals: proposals || [],
        documents: documents || [],
        chatRoom,
      };
    },
    enabled: !!user?.id && !!tokenizationId && isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
};
