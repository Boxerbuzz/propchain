import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseService } from "@/services/supabaseService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from 'sonner';

interface InvestmentData {
  tokenization_id: string;
  amount_ngn: number;
  tokens_requested: number;
  payment_method: 'paystack' | 'wallet';
}

interface ReservationResult {
  type: 'paystack' | 'wallet';
  authorizationUrl?: string;
  investment_id: string;
  reservation_expires_at?: string;
  success?: boolean;
}

export const useInvestmentFlow = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createInvestment = useMutation({
    mutationFn: async (data: InvestmentData) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Use the comprehensive investment creation edge function
      const { data: result, error } = await supabase.functions.invoke('create-investment', {
        body: {
          tokenization_id: data.tokenization_id,
          investor_id: user.id,
          amount_ngn: data.amount_ngn,
          tokens_requested: data.tokens_requested,
          payment_method: data.payment_method,
          email: user.email
        }
      });

      if (error || !result?.success) {
        throw new Error(result?.error || error?.message || 'Investment creation failed');
      }

      if (data.payment_method === 'paystack') {
        return {
          type: 'paystack',
          authorizationUrl: result.payment_url,
          investment_id: result.investment_id,
          reservation_expires_at: result.reservation_expires_at
        } as ReservationResult;
      } else {
        return {
          type: 'wallet',
          success: true,
          investment_id: result.investment_id
        } as ReservationResult;
      }
    },
    onSuccess: (result, variables) => {
      if (variables.payment_method === 'paystack' && result.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = result.authorizationUrl;
      } else {
        toast.success('Investment completed successfully!');
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['portfolio', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['tokenizations'] });
      }
    },
    onError: (error: Error) => {
      toast.error(`Investment failed: ${error.message}`);
    },
  });

  return {
    createInvestment: createInvestment.mutate,
    isCreating: createInvestment.isPending,
    error: createInvestment.error,
  };
};