import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProposals, useVoteOnProposal } from '@/hooks/useProposals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ThumbsUp, ThumbsDown, Minus, Link2, Lock, ExternalLink, Play } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { ProposalExecutionStatus } from '@/components/governance/ProposalExecutionStatus';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Proposals() {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const { data: proposals, isLoading } = useProposals(propertyId);
  const voteOnProposal = useVoteOnProposal();
  const [votingProposalId, setVotingProposalId] = useState<string | null>(null);
  const [executingProposal, setExecutingProposal] = useState<string | null>(null);

  const handleVote = async (proposalId: string, voteChoice: 'for' | 'against' | 'abstain') => {
    setVotingProposalId(proposalId);
    try {
      await voteOnProposal.mutateAsync({
        proposalId,
        voteChoice,
        votingPower: 1, // TODO: Get actual voting power from token holdings
      });
    } finally {
      setVotingProposalId(null);
    }
  };

  const handleExecuteProposal = async (proposalId: string) => {
    setExecutingProposal(proposalId);
    try {
      const { data, error } = await supabase.functions.invoke('execute-proposal', {
        body: { proposal_id: proposalId }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Proposal executed successfully!');
      }
    } catch (error: any) {
      console.error('Failed to execute proposal:', error);
      toast.error(error.message || 'Failed to execute proposal');
    } finally {
      setExecutingProposal(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      passed: 'secondary',
      rejected: 'destructive',
      expired: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getProposalTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      maintenance: 'bg-orange-500/10 text-orange-500',
      improvement: 'bg-blue-500/10 text-blue-500',
      financial: 'bg-green-500/10 text-green-500',
      governance: 'bg-purple-500/10 text-purple-500',
    };
    return (
      <Badge className={colors[type] || 'bg-muted'}>
        {type}
      </Badge>
    );
  };

  const filterProposals = (status?: string) => {
    if (!proposals) return [];
    if (!status) return proposals;
    return proposals.filter(p => p.status === status);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Governance Proposals</h1>
        <p className="text-muted-foreground">
          View and vote on proposals for property management decisions
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Proposals</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="passed">Passed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {filterProposals().map(proposal => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onVote={handleVote}
              isVoting={votingProposalId === proposal.id}
              userId={user?.id}
              getStatusBadge={getStatusBadge}
              getProposalTypeBadge={getProposalTypeBadge}
              onExecute={handleExecuteProposal}
              isExecuting={executingProposal === proposal.id}
            />
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-6">
          {filterProposals('active').map(proposal => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onVote={handleVote}
              isVoting={votingProposalId === proposal.id}
              userId={user?.id}
              getStatusBadge={getStatusBadge}
              getProposalTypeBadge={getProposalTypeBadge}
              onExecute={handleExecuteProposal}
              isExecuting={executingProposal === proposal.id}
            />
          ))}
        </TabsContent>

        <TabsContent value="passed" className="space-y-4 mt-6">
          {filterProposals('passed').map(proposal => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onVote={handleVote}
              isVoting={votingProposalId === proposal.id}
              userId={user?.id}
              getStatusBadge={getStatusBadge}
              getProposalTypeBadge={getProposalTypeBadge}
              onExecute={handleExecuteProposal}
              isExecuting={executingProposal === proposal.id}
            />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {filterProposals('rejected').map(proposal => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onVote={handleVote}
              isVoting={votingProposalId === proposal.id}
              userId={user?.id}
              getStatusBadge={getStatusBadge}
              getProposalTypeBadge={getProposalTypeBadge}
              onExecute={handleExecuteProposal}
              isExecuting={executingProposal === proposal.id}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ProposalCardProps {
  proposal: any;
  onVote: (proposalId: string, voteChoice: 'for' | 'against' | 'abstain') => void;
  isVoting: boolean;
  userId?: string;
  getStatusBadge: (status: string) => JSX.Element;
  getProposalTypeBadge: (type: string) => JSX.Element;
  onExecute: (proposalId: string) => void;
  isExecuting: boolean;
}

function ProposalCard({ proposal, onVote, isVoting, getStatusBadge, getProposalTypeBadge, onExecute, isExecuting }: ProposalCardProps) {
  const totalVotes = Number(proposal.total_votes_cast || 0);
  const votesFor = Number(proposal.votes_for || 0);
  const votesAgainst = Number(proposal.votes_against || 0);
  const votesAbstain = Number(proposal.votes_abstain || 0);

  const forPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (votesAbstain / totalVotes) * 100 : 0;

  const isActive = proposal.status === 'active';
  const votingEnd = new Date(proposal.voting_end);
  const isExpired = votingEnd < new Date();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle>{proposal.title}</CardTitle>
              {getStatusBadge(proposal.status)}
              {getProposalTypeBadge(proposal.proposal_type)}
              {proposal.contract_proposal_id && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                  <Link2 className="h-3 w-3 mr-1" />
                  On-Chain
                </Badge>
              )}
              {proposal.funds_locked && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  <Lock className="h-3 w-3 mr-1" />
                  Funds Locked
                </Badge>
              )}
            </div>
            <CardDescription>{proposal.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {proposal.contract_proposal_id && (
          <ProposalExecutionStatus
            proposal={proposal}
          />
        )}

        {proposal.budget_ngn && (
          <div>
            <p className="text-sm font-medium mb-1">Budget</p>
            <p className="text-lg font-semibold">
              ₦{proposal.budget_ngn.toLocaleString()}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Voting Progress</span>
            <span className="font-medium">{totalVotes} votes cast</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                For
              </span>
              <span className="font-medium">{forPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={forPercentage} className="h-2 bg-muted [&>div]:bg-green-500" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                Against
              </span>
              <span className="font-medium">{againstPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={againstPercentage} className="h-2 bg-muted [&>div]:bg-red-500" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-muted-foreground" />
                Abstain
              </span>
              <span className="font-medium">{abstainPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={abstainPercentage} className="h-2" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {isExpired ? (
              <span>Ended {format(votingEnd, 'PPP')}</span>
            ) : (
              <span>Ends {format(votingEnd, 'PPP')}</span>
            )}
          </div>

          {isActive && !isExpired && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVote(proposal.id, 'for')}
                disabled={isVoting}
              >
                {isVoting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Vote For'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVote(proposal.id, 'against')}
                disabled={isVoting}
              >
                {isVoting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Vote Against'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onVote(proposal.id, 'abstain')}
                disabled={isVoting}
              >
                Abstain
              </Button>
            </div>
          )}

          {proposal.status === 'approved_pending_execution' && !proposal.funds_locked && (
            <Button
              size="sm"
              onClick={() => onExecute(proposal.id)}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Executing...</>
              ) : (
                <><Play className="h-4 w-4 mr-2" />Execute Proposal</>
              )}
            </Button>
          )}

          {proposal.contract_transaction_hash && (
            <a
              href={`https://hashscan.io/testnet/transaction/${proposal.contract_transaction_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View on Hedera
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
