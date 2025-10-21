import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, Lock, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProposalExecutionStatusProps {
  proposal: {
    status: string;
    contract_proposal_id?: string;
    contract_registered_at?: string;
    contract_transaction_hash?: string;
    funds_locked?: boolean;
    funds_locked_at?: string;
    funds_released?: boolean;
    funds_released_at?: string;
    execution_contract_tx?: string;
    voting_end: string;
  };
}

export const ProposalExecutionStatus = ({ proposal }: ProposalExecutionStatusProps) => {
  const isVotingEnded = new Date(proposal.voting_end) < new Date();
  
  const getStatusSteps = () => {
    return [
      {
        label: "Registered On-Chain",
        completed: !!proposal.contract_proposal_id,
        timestamp: proposal.contract_registered_at,
        icon: CheckCircle2,
      },
      {
        label: "Voting Completed",
        completed: isVotingEnded,
        timestamp: proposal.voting_end,
        icon: CheckCircle2,
      },
      {
        label: "Funds Locked in Escrow",
        completed: proposal.funds_locked,
        timestamp: proposal.funds_locked_at,
        icon: Lock,
        pending: isVotingEnded && !proposal.funds_locked && proposal.status === 'active',
      },
      {
        label: "Awaiting Completion",
        completed: false,
        timestamp: null,
        icon: Clock,
        pending: proposal.funds_locked && !proposal.funds_released,
      },
      {
        label: "Funds Released",
        completed: proposal.funds_released,
        timestamp: proposal.funds_released_at,
        icon: CheckCircle2,
      },
    ];
  };

  const steps = getStatusSteps();

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Execution Progress</h3>
        {proposal.contract_proposal_id && (
          <Badge variant="outline" className="gap-1">
            <Lock className="h-3 w-3" />
            On-Chain
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex items-start gap-3">
              <div className={`mt-1 ${
                step.completed 
                  ? 'text-primary' 
                  : step.pending 
                  ? 'text-warning animate-pulse' 
                  : 'text-muted-foreground'
              }`}>
                {step.pending ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  step.completed 
                    ? 'text-foreground' 
                    : 'text-muted-foreground'
                }`}>
                  {step.label}
                </p>
                {step.timestamp && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(step.timestamp).toLocaleString()}
                  </p>
                )}
                {step.pending && (
                  <p className="text-sm text-warning flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    In Progress...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {proposal.contract_transaction_hash && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => {
            window.open(
              `https://hashscan.io/testnet/transaction/${proposal.contract_transaction_hash}`,
              '_blank'
            );
          }}
        >
          <ExternalLink className="h-4 w-4" />
          View on Hedera Explorer
        </Button>
      )}

      {proposal.execution_contract_tx && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => {
            window.open(
              `https://hashscan.io/testnet/transaction/${proposal.execution_contract_tx}`,
              '_blank'
            );
          }}
        >
          <ExternalLink className="h-4 w-4" />
          View Execution Transaction
        </Button>
      )}
    </Card>
  );
};
