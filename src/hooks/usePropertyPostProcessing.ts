import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Hook to handle post-processing of properties (HCS topic creation, etc.)
export const usePropertyPostProcessing = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Listen for property HCS topic creation requests
    const handlePropertyActivities = async () => {
      const { data: activities, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_type', 'property_hcs_topic_pending')
        .is('hcs_transaction_id', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching property activities:', error);
        return;
      }

      // Process each pending HCS topic creation
      for (const activity of activities || []) {
        try {
          const propertyId = activity.property_id;
          const metadata = activity.metadata as any;
          
          // Call create-hcs-topic function
          const { data: topicResult, error: topicError } = await supabase.functions.invoke('create-hcs-topic', {
            body: {
              memo: `PropChain Property: ${metadata.title}`,
            },
          });

          if (topicError) {
            throw new Error(`HCS topic creation failed: ${topicError.message}`);
          }

          if (!topicResult.success) {
            throw new Error(`HCS topic creation failed: ${topicResult.error}`);
          }

          // Update property with HCS topic ID
          const { error: updateError } = await supabase
            .from('properties')
            .update({ 
              hcs_topic_id: topicResult.data.topicId 
            })
            .eq('id', propertyId);

          if (updateError) {
            throw new Error(`Failed to update property with HCS topic: ${updateError.message}`);
          }

          // Mark activity as completed
          await supabase
            .from('activity_logs')
            .update({ 
              activity_type: 'property_hcs_topic_created',
              description: 'Property HCS topic created successfully',
              hcs_transaction_id: topicResult.data.transactionId,
              updated_at: new Date().toISOString()
            })
            .eq('id', activity.id);

          toast.success(`HCS topic created for property: ${metadata.title}`);
        } catch (error: any) {
          console.error('Error processing property HCS topic:', error);
          
          // Mark activity as failed
          await supabase
            .from('activity_logs')
            .update({ 
              activity_type: 'property_hcs_topic_failed',
              description: `HCS topic creation failed: ${error.message}`,
              updated_at: new Date().toISOString()
            })
            .eq('id', activity.id);
        }
      }
    };

    // Listen for tokenization Hedera token creation requests
    const handleTokenizationActivities = async () => {
      const { data: activities, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_type', 'tokenization_hedera_token_pending')
        .is('hcs_transaction_id', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching tokenization activities:', error);
        return;
      }

      // Process each pending Hedera token creation
      for (const activity of activities || []) {
        try {
          const tokenizationId = activity.tokenization_id;
          const metadata = activity.metadata as any;
          
          // Call tokenization-approved function (which will create the Hedera token)
          const { data: tokenResult, error: tokenError } = await supabase.functions.invoke('tokenization-approved', {
            body: {
              tokenizationId: tokenizationId,
            },
          });

          if (tokenError) {
            throw new Error(`Hedera token creation failed: ${tokenError.message}`);
          }

          if (!tokenResult.success) {
            throw new Error(`Hedera token creation failed: ${tokenResult.error}`);
          }

          // Mark activity as completed
          await supabase
            .from('activity_logs')
            .update({ 
              activity_type: 'tokenization_hedera_token_created',
              description: 'Hedera token created successfully',
              hcs_transaction_id: tokenResult.data.transactionId,
              updated_at: new Date().toISOString()
            })
            .eq('id', activity.id);

          toast.success(`Hedera token created: ${metadata.token_symbol}`);
        } catch (error: any) {
          console.error('Error processing tokenization Hedera token:', error);
          
          // Mark activity as failed
          await supabase
            .from('activity_logs')
            .update({ 
              activity_type: 'tokenization_hedera_token_failed',
              description: `Hedera token creation failed: ${error.message}`,
              updated_at: new Date().toISOString()
            })
            .eq('id', activity.id);
        }
      }
    };

    // Run initial check
    handlePropertyActivities();
    handleTokenizationActivities();

    // Set up polling to check for new activities every 30 seconds
    const interval = setInterval(() => {
      handlePropertyActivities();
      handleTokenizationActivities();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);
};