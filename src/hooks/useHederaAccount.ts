import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const useHederaAccount = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: hederaAccount, isLoading } = useQuery({
    queryKey: ['hedera-account', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('hedera_account_id')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data?.hedera_account_id || null;
    },
    enabled: !!user?.id,
  });

  const createAccount = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('auto-create-hedera-account', {
        body: { userId: user.id }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data.data;
    },
    onSuccess: (data) => {
      toast.success('Blockchain wallet created successfully!');
      queryClient.invalidateQueries({ queryKey: ['hedera-account', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['wallets', user?.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create blockchain wallet');
    },
  });

  return {
    hederaAccount,
    isLoading,
    createAccount: createAccount.mutate,
    isCreating: createAccount.isPending,
    hasAccount: !!hederaAccount,
  };
};