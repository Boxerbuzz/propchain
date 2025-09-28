import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export const useTokenizationHederaSetup = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check for tokenizations status (for monitoring purposes)
  const { data: pendingTokenizations } = useQuery({
    queryKey: ['pending-hedera-tokenizations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('tokenizations')
        .select(`
          *,
          properties!inner(owner_id)
        `)
        .eq('properties.owner_id', user.id)
        .eq('status', 'approved')
        .is('token_id', null);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Reduced frequency - now just for monitoring
  });

  // Mutation to create Hedera token
  const createHederaToken = useMutation({
    mutationFn: async (tokenizationId: string) => {
      const tokenization = pendingTokenizations?.find(t => t.id === tokenizationId);
      if (!tokenization) throw new Error('Tokenization not found');

      const { data, error } = await supabase.functions.invoke('tokenization-approved', {
        body: {
          tokenizationId,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to create Hedera token');

      return data;
    },
    onSuccess: (data, tokenizationId) => {
      toast.success(`Hedera token created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['pending-hedera-tokenizations'] });
      queryClient.invalidateQueries({ queryKey: ['tokenizations'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to create Hedera token: ${error.message}`);
    },
  });

  // Manual retry capability (automatic processing now handled by database triggers)
  const retryTokenCreation = (tokenizationId: string) => {
    createHederaToken.mutate(tokenizationId);
  };

  return {
    pendingTokenizations,
    createHederaToken,
    retryTokenCreation,
    isCreating: createHederaToken.isPending,
  };
};