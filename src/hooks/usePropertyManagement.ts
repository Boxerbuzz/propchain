import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseService } from "@/services/supabaseService";
import { useAuth } from "@/context/AuthContext";
import { Property } from "../types";

export const useUserProperties = () => { 
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["user-properties", user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) return [];
      return (await supabaseService.properties.getOwnedProperties(
        user.id
      )) as unknown as Property[];
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateProperty = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyData: any) => {
      if (!user?.id) throw new Error("User not authenticated");
      return await supabaseService.properties.create(propertyData, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-properties", user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

export const useUpdateProperty = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: any;
    }) => {
      return await supabaseService.properties.updateProperty(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-properties", user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};
