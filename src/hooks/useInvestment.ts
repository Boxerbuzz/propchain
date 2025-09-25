import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseService } from "@/services/supabaseService";
import { useAuth } from "@/context/AuthContext";

export const useCreateInvestment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (investmentData: any) => {
      if (!user?.id) throw new Error('User not authenticated');
      return await supabaseService.investments.create({
        ...investmentData,
        investor_id: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

export const useUpdateInvestment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await supabaseService.investments.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] });
    },
  });
};