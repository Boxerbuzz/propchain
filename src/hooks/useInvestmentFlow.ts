import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseService } from "@/services/supabaseService";
import { useAuth } from "@/context/AuthContext";
import { toast } from 'sonner';

interface InvestmentData {
  tokenizationId: string;
  amount: number;
  paymentMethod: 'paystack' | 'wallet';
}

interface PaystackResponse {
  authorizationUrl: string;
  reference: string;
}

interface ReservationResult {
  success: boolean;
  investment_id: string;
  reservation_expires_at: string;
  tokens_reserved: number;
  error?: string;
}

export const useInvestmentFlow = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createInvestment = useMutation({
    mutationFn: async (data: InvestmentData): Promise<PaystackResponse> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get tokenization details
      const tokenization = await supabaseService.tokenizations.getById(data.tokenizationId);
      if (!tokenization) throw new Error('Tokenization not found');

      const tokensRequested = Math.floor(data.amount / tokenization.price_per_token);

      // Create investment with reservation using the database function
      const reservationResult = (await supabaseService.investments.createWithReservation({
        tokenization_id: data.tokenizationId,
        investor_id: user.id,
        amount_ngn: data.amount,
        tokens_requested: tokensRequested,
        payment_method: data.paymentMethod,
      }) as unknown) as ReservationResult;

      if (!reservationResult.success) {
        throw new Error(reservationResult.error || 'Failed to reserve tokens');
      }

      // Initialize payment based on method
      if (data.paymentMethod === 'paystack') {
        const paymentResult = await supabaseService.payments.initializePaystack({
          amount: data.amount,
          email: user.email,
          reference: reservationResult.investment_id,
        });

        return {
          authorizationUrl: paymentResult.authorization_url,
          reference: reservationResult.investment_id,
        };
      } else {
        // Handle wallet payment
        const walletResult = await supabaseService.wallets.deductBalance({
          userId: user.id,
          amount: data.amount,
          reference: reservationResult.investment_id,
        });

        if (!walletResult.success) {
          throw new Error('Insufficient wallet balance');
        }

        return {
          authorizationUrl: '',
          reference: reservationResult.investment_id,
        };
      }
    },
    onSuccess: (result, variables) => {
      if (variables.paymentMethod === 'paystack' && result.authorizationUrl) {
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