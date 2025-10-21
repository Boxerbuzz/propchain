import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Users, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WithdrawalRequest {
  id: string;
  requestId: number;
  amount_ngn: number;
  description: string;
  status: string;
  created_at: string;
  metadata: {
    withdrawalRequestId: string;
    recipient: string;
    multisig_status: string;
    approvals?: string[];
    requiredApprovals?: number;
  };
}

interface MultiSigWithdrawalCardProps {
  withdrawal: WithdrawalRequest;
  currentUserIsSigner: boolean;
  currentUserAddress?: string;
  onApprovalChange?: () => void;
}

export const MultiSigWithdrawalCard = ({
  withdrawal,
  currentUserIsSigner,
  currentUserAddress,
  onApprovalChange,
}: MultiSigWithdrawalCardProps) => {
  const [isApproving, setIsApproving] = useState(false);

  const approvalCount = withdrawal.metadata.approvals?.length || 0;
  const requiredApprovals = withdrawal.metadata.requiredApprovals || 2;
  const hasApproved = currentUserAddress && withdrawal.metadata.approvals?.includes(currentUserAddress);
  const canApprove = currentUserIsSigner && !hasApproved && withdrawal.status === 'pending_approval';
  const isReadyToExecute = approvalCount >= requiredApprovals && withdrawal.status === 'pending_approval';

  const handleApprove = async () => {
    if (!currentUserAddress) {
      toast.error('Wallet not connected');
      return;
    }

    setIsApproving(true);
    try {
      // Call edge function to approve withdrawal on smart contract
      const { data, error } = await supabase.functions.invoke('approve-treasury-withdrawal', {
        body: {
          withdrawalRequestId: withdrawal.metadata.withdrawalRequestId,
          approverAddress: currentUserAddress,
        },
      });

      if (error) throw error;

      toast.success('Withdrawal approved successfully');
      onApprovalChange?.();
    } catch (error: any) {
      console.error('Error approving withdrawal:', error);
      toast.error(error.message || 'Failed to approve withdrawal');
    } finally {
      setIsApproving(false);
    }
  };

  const handleExecute = async () => {
    setIsApproving(true);
    try {
      const { data, error } = await supabase.functions.invoke('execute-treasury-withdrawal', {
        body: {
          withdrawalRequestId: withdrawal.metadata.withdrawalRequestId,
        },
      });

      if (error) throw error;

      toast.success('Withdrawal executed successfully');
      onApprovalChange?.();
    } catch (error: any) {
      console.error('Error executing withdrawal:', error);
      toast.error(error.message || 'Failed to execute withdrawal');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">
            ₦{withdrawal.amount_ngn.toLocaleString()}
          </h3>
          <p className="text-sm text-muted-foreground">
            {withdrawal.description}
          </p>
          <p className="text-xs text-muted-foreground">
            Recipient: {withdrawal.metadata.recipient.slice(0, 10)}...
          </p>
        </div>
        <Badge variant={
          withdrawal.status === 'completed' ? 'default' :
          withdrawal.status === 'pending_approval' ? 'secondary' :
          'outline'
        }>
          {withdrawal.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Approvals
          </span>
          <span className="font-medium">
            {approvalCount} / {requiredApprovals}
          </span>
        </div>

        <div className="flex gap-1">
          {Array.from({ length: requiredApprovals }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < approvalCount ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {currentUserIsSigner && withdrawal.status !== 'completed' && (
        <div className="flex gap-2">
          {canApprove && (
            <Button
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-1 gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isApproving ? 'Approving...' : 'Approve'}
            </Button>
          )}
          
          {isReadyToExecute && currentUserIsSigner && (
            <Button
              onClick={handleExecute}
              disabled={isApproving}
              variant="default"
              className="flex-1 gap-2"
            >
              <Clock className="h-4 w-4" />
              {isApproving ? 'Executing...' : 'Execute Withdrawal'}
            </Button>
          )}

          {hasApproved && !isReadyToExecute && (
            <Button disabled className="flex-1 gap-2" variant="secondary">
              <CheckCircle2 className="h-4 w-4" />
              Approved
            </Button>
          )}
        </div>
      )}

      {withdrawal.metadata.withdrawalRequestId && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-2"
          onClick={() => {
            window.open(
              `https://hashscan.io/testnet/contract/${withdrawal.metadata.withdrawalRequestId}`,
              '_blank'
            );
          }}
        >
          <ExternalLink className="h-3 w-3" />
          View on Explorer
        </Button>
      )}
    </Card>
  );
};
