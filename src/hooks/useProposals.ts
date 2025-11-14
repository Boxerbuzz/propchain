import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export const useProposals = (propertyId?: string) => {
  return useQuery({
    queryKey: ['governance-proposals', propertyId],
    queryFn: async () => {
      let query = supabase
        .from('governance_proposals')
        .select(`
          *,
          properties (
            id,
            title,
            location
          ),
          tokenizations (
            id,
            token_name,
            token_symbol
          )
        `)
        .order('created_at', { ascending: false });

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

export const useUserVotes = (proposalIds?: string[]) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-votes', user?.id, proposalIds],
    queryFn: async () => {
      if (!user?.id || !proposalIds?.length) return [];

      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('voter_id', user.id)
        .in('proposal_id', proposalIds);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!proposalIds?.length,
  });
};

export const useVoteOnProposal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      proposalId, 
      voteChoice,
      votingPower 
    }: { 
      proposalId: string; 
      voteChoice: 'for' | 'against' | 'abstain';
      votingPower: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('cast_vote', {
        p_proposal_id: proposalId,
        p_voter_id: user.id,
        p_vote_choice: voteChoice,
        p_voting_power: votingPower,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-proposals'] });
      toast.success('Vote cast successfully');
    },
    onError: (error) => {
      toast.error(`Failed to cast vote: ${error.message}`);
    },
  });
};
