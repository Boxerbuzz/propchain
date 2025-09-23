import { useState } from 'react';
import { investmentApi } from '@/api/investments';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useInvestment = () => {
  const [isInvesting, setIsInvesting] = useState(false);
  const { currentUser } = useAuth();

  const invest = async (
    tokenizationId: string,
    amount: number,
    paymentMethod: 'paystack' | 'wallet'
  ) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make an investment",
        variant: "destructive",
      });
      throw new Error('User not authenticated');
    }

    setIsInvesting(true);
    
    try {
      // Place investment
      const investmentResponse = await investmentApi.placeInvestment(
        currentUser.id,
        tokenizationId,
        {
          amount,
          paymentMethod,
          email: currentUser.email,
        }
      );
      
      if (!investmentResponse.success) {
        throw new Error(investmentResponse.error || 'Failed to place investment');
      }
      
      const investment = investmentResponse.data;
      
      // Handle Paystack payment
      if (paymentMethod === 'paystack' && investment?.paystackReference) {
        // Process payment
        const paymentResponse = await investmentApi.processInvestmentPayment(
          investment.id,
          investment.paystackReference
        );
        
        if (!paymentResponse.success) {
          throw new Error(paymentResponse.error || 'Payment processing failed');
        }
        
        toast({
          title: "Investment Successful!",
          description: `You've successfully invested ₦${amount.toLocaleString()}`,
        });
        
        return paymentResponse.data;
      }
      
      // Handle wallet payment
      if (paymentMethod === 'wallet') {
        toast({
          title: "Investment Successful!",
          description: `You've successfully invested ₦${amount.toLocaleString()} from your wallet`,
        });
        
        return investment;
      }
      
    } catch (error) {
      console.error('Investment error:', error);
      toast({
        title: "Investment Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsInvesting(false);
    }
  };

  return {
    invest,
    isInvesting
  };
};