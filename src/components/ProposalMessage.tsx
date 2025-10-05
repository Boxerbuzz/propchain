import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ThumbsUp, ThumbsDown, Minus, Calendar, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface ProposalMessageProps {
  metadata: any;
  createdAt: string;
}

export const ProposalMessage = ({ metadata, createdAt }: ProposalMessageProps) => {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const proposalId = metadata.proposal_id;
  const totalVotes = (metadata.votes_for || 0) + (metadata.votes_against || 0) + (metadata.votes_abstain || 0);
  const forPercentage = totalVotes > 0 ? ((metadata.votes_for || 0) / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? ((metadata.votes_against || 0) / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? ((metadata.votes_abstain || 0) / totalVotes) * 100 : 0;

  const handleVote = async (choice: 'for' | 'against' | 'abstain') => {
    if (!user?.id || hasVoted) return;

    setIsVoting(true);
    try {
      // Get user's voting power
      const { data: holdings } = await supabase
        .from('token_holdings')
        .select('balance')
        .eq('user_id', user.id)
        .eq('tokenization_id', metadata.tokenization_id)
        .single();

      if (!holdings?.balance) {
        toast.error("You must hold tokens to vote");
        return;
      }

      const { data, error } = await supabase
        .rpc('cast_vote', {
          p_proposal_id: proposalId,
          p_voter_id: user.id,
          p_vote_choice: choice,
          p_voting_power: holdings.balance
        });

      if (error) throw error;

      toast.success(`Vote cast: ${choice}`);
      setHasVoted(true);
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error(error.message || "Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const getStatusBadge = () => {
    const status = metadata.status || 'active';
    const variants: Record<string, any> = {
      active: 'default',
      passed: 'success',
      rejected: 'destructive',
      expired: 'secondary'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <Card className="p-4 space-y-4 bg-accent/5 border-accent/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold">{metadata.title}</h4>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-muted-foreground">{metadata.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>Budget: ₦{(metadata.budget_ngn || 0).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-green-600 dark:text-green-400">For: {forPercentage.toFixed(1)}%</span>
          <span className="text-red-600 dark:text-red-400">Against: {againstPercentage.toFixed(1)}%</span>
          <span className="text-muted-foreground">Abstain: {abstainPercentage.toFixed(1)}%</span>
        </div>
        <Progress value={forPercentage} className="h-2" />
        <div className="text-xs text-muted-foreground">
          Total votes: {totalVotes}
        </div>
      </div>

      {!hasVoted && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-green-600 hover:bg-green-600/10"
            onClick={() => handleVote('for')}
            disabled={isVoting}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            For
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-red-600 hover:bg-red-600/10"
            onClick={() => handleVote('against')}
            disabled={isVoting}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            Against
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => handleVote('abstain')}
            disabled={isVoting}
          >
            <Minus className="h-4 w-4 mr-1" />
            Abstain
          </Button>
        </div>
      )}
    </Card>
  );
};
