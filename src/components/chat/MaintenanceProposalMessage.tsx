import { useState } from "react";
import { Wrench, AlertTriangle, DollarSign, Calendar, ThumbsUp, ThumbsDown, Minus, Timer } from "lucide-react";
import { EventAccordion } from "./EventAccordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow, differenceInDays } from "date-fns";

interface MaintenanceProposalMessageProps {
  metadata: any;
  createdAt: string;
}

export const MaintenanceProposalMessage = ({ metadata, createdAt }: MaintenanceProposalMessageProps) => {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const proposalId = metadata.proposal_id;
  const totalVotes = (metadata.votes_for || 0) + (metadata.votes_against || 0) + (metadata.votes_abstain || 0);
  const forPercentage = totalVotes > 0 ? ((metadata.votes_for || 0) / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? ((metadata.votes_against || 0) / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? ((metadata.votes_abstain || 0) / totalVotes) * 100 : 0;

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      critical: { variant: "destructive", color: "text-red-600" },
      high: { variant: "destructive", color: "text-orange-600" },
      medium: { variant: "secondary", color: "text-yellow-600" },
      low: { variant: "outline", color: "text-green-600" },
    };
    return variants[severity?.toLowerCase()] || variants.medium;
  };

  const severityStyle = getSeverityBadge(metadata.issue_severity);
  const daysRemaining = metadata.voting_end ? differenceInDays(new Date(metadata.voting_end), new Date()) : 0;

  const handleVote = async (choice: 'for' | 'against' | 'abstain') => {
    if (!user?.id || hasVoted) return;

    setIsVoting(true);
    try {
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

      const { data, error } = await supabase.rpc('cast_vote', {
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

  return (
    <EventAccordion
      icon={Wrench}
      title={`Maintenance Proposal: ${metadata.issue_category || "Property Maintenance"}`}
      subtitle={`${metadata.maintenance_type || "Repair"} • Requires Community Approval`}
      badge={{
        label: `${metadata.issue_severity || "Medium"} Severity`,
        variant: severityStyle.variant,
      }}
      defaultOpen={true}
    >
      <div className="space-y-4">
        {/* Severity Alert */}
        {metadata.issue_severity === "critical" && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold text-red-600 text-sm">Critical Issue</p>
              <p className="text-xs text-red-600/80">Requires immediate attention and approval</p>
            </div>
          </div>
        )}

        {/* Issue Description */}
        <div className="space-y-2">
          <h5 className="font-semibold text-sm">Issue Description</h5>
          <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
            {metadata.issue_description || "No description provided"}
          </p>
        </div>

        {/* Budget Breakdown */}
        <div className="space-y-2">
          <h5 className="font-semibold text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Budget Request
          </h5>
          <div className="p-4 bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-lg border border-amber-500/20">
            <div className="text-center">
              <p className="text-2xl font-bold">₦{(metadata.estimated_cost_ngn || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Estimated repair cost</p>
            </div>
          </div>
        </div>

        {/* Work Details */}
        {metadata.work_performed && (
          <div className="space-y-2">
            <h5 className="font-semibold text-sm">Planned Work</h5>
            <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              {metadata.work_performed}
            </p>
          </div>
        )}

        {/* Contractor Info */}
        {(metadata.contractor_name || metadata.contractor_company) && (
          <div className="space-y-2">
            <h5 className="font-semibold text-sm">Contractor Information</h5>
            <div className="grid gap-2 text-sm">
              {metadata.contractor_name && (
                <div className="flex justify-between p-2 bg-background rounded">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{metadata.contractor_name}</span>
                </div>
              )}
              {metadata.contractor_company && (
                <div className="flex justify-between p-2 bg-background rounded">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="font-medium">{metadata.contractor_company}</span>
                </div>
              )}
              {metadata.contractor_phone && (
                <div className="flex justify-between p-2 bg-background rounded">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium">{metadata.contractor_phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Voting Section */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <h5 className="font-semibold text-sm">Community Vote</h5>
            {daysRemaining > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
              </Badge>
            )}
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

          {!hasVoted && metadata.status === 'active' && (
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 hover:bg-green-600/10 border-green-600/20"
                onClick={() => handleVote('for')}
                disabled={isVoting}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:bg-red-600/10 border-red-600/20"
                onClick={() => handleVote('against')}
                disabled={isVoting}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleVote('abstain')}
                disabled={isVoting}
              >
                <Minus className="h-4 w-4 mr-1" />
                Abstain
              </Button>
            </div>
          )}

          {hasVoted && (
            <div className="text-center p-2 bg-primary/10 rounded-lg text-sm">
              ✓ You have voted on this proposal
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
          <p className="flex items-center justify-between">
            <span>Submitted:</span>
            <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          </p>
          {metadata.hcs_transaction_id && (
            <p className="font-mono truncate">
              Blockchain: {metadata.hcs_transaction_id}
            </p>
          )}
        </div>
      </div>
    </EventAccordion>
  );
};
