import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export const usePropertyHCSSetup = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check for properties that need HCS topic creation
  const { data: pendingProperties } = useQuery({
    queryKey: ['pending-hcs-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .eq('approval_status', 'approved')
        .is('hcs_topic_id', null);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Check every 5 seconds
  });

  // Mutation to create HCS topic
  const createHCSTopic = useMutation({
    mutationFn: async (propertyId: string) => {
      const property = pendingProperties?.find(p => p.id === propertyId);
      if (!property) throw new Error('Property not found');

      const { data, error } = await supabase.functions.invoke('create-hcs-topic', {
        body: {
          memo: `PropChain Property: ${property.title}`,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to create HCS topic');

      // Update property with HCS topic ID
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          hcs_topic_id: data.data.topicId,
        })
        .eq('id', propertyId);

      if (updateError) throw updateError;

      return data.data;
    },
    onSuccess: (data, propertyId) => {
      toast.success(`HCS topic created: ${data.topicId}`);
      queryClient.invalidateQueries({ queryKey: ['pending-hcs-properties'] });
      queryClient.invalidateQueries({ queryKey: ['user-properties'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to create HCS topic: ${error.message}`);
    },
  });

  // Auto-create HCS topics for pending properties
  useEffect(() => {
    if (pendingProperties && pendingProperties.length > 0) {
      pendingProperties.forEach((property) => {
        if (!property.hcs_topic_id) {
          createHCSTopic.mutate(property.id);
        }
      });
    }
  }, [pendingProperties]);

  return {
    pendingProperties,
    createHCSTopic,
    isCreating: createHCSTopic.isPending,
  };
};