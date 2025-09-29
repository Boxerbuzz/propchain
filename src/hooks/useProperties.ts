import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseService } from "@/services/supabaseService";
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types';

interface PropertyWithTokenization {
  id?: string;
  property_title?: string;
  property_location?: any;
  property_type?: string;
  primary_image?: string;
  image_count?: number;
  // Tokenization fields
  status?: string;
  target_raise?: number;
  current_raise?: number;
  expected_roi_annual?: number;
  tokens_sold?: number;
  total_supply?: number;
  investment_window_end?: string;
  price_per_token?: number;
  min_investment?: number;
  // Include other relevant fields
  [key: string]: any;
}

export const useProperties = (filters?: any) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const tokenizations = await supabaseService.properties.listActiveTokenizations();
      
      return tokenizations.map((tokenization: any) => {
        const images = tokenization.properties?.property_images || [];
        const primaryImage = images.find(img => img.is_primary)?.image_url || images[0]?.image_url;
        
        return {
          ...tokenization,
          property_title: tokenization.properties?.title || "Unknown Property",
          property_location: tokenization.properties?.location || {},
          property_type: tokenization.properties?.property_type || "Unknown",
          primary_image: primaryImage,
          image_count: images.length,
          images: images,
        };
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (property: any) => {
      const { data, error } = await supabase
        .from('properties')
        .insert(property)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};
