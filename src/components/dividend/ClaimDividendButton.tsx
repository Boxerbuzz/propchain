import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ClaimDividendButtonProps {
  paymentId: string;
  amount: number;
  tokenName: string;
  onSuccess?: () => void;
}

export function ClaimDividendButton({
  paymentId,
  amount,
  tokenName,
  onSuccess
}: ClaimDividendButtonProps) {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const { data, error } = await supabase.functions.invoke('claim-dividend', {
        body: { payment_id: paymentId }
      });

      if (error) throw error;

      if (data.success) {
        setClaimed(true);
        setTxHash(data.transaction_hash);
        toast.success(`Successfully claimed ₦${amount.toLocaleString()} dividend!`);
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Failed to claim dividend:', error);
      toast.error(error.message || 'Failed to claim dividend');
    } finally {
      setClaiming(false);
    }
  };

  if (claimed && txHash) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-green-500">Claimed Successfully</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  Completed
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                ₦{amount.toLocaleString()} has been added to your wallet
              </p>
              <a
                href={`https://hashscan.io/testnet/transaction/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
              >
                View transaction
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Claimable Dividend</p>
          <p className="text-2xl font-bold">₦{amount.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">from {tokenName}</p>
        </div>
        <Button
          onClick={handleClaim}
          disabled={claiming}
          size="lg"
        >
          {claiming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Claiming...
            </>
          ) : (
            'Claim Dividend'
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Claiming will transfer the dividend to your wallet on the Hedera network
      </p>
    </div>
  );
}
