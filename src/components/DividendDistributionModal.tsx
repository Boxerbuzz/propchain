import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, DollarSign, Users, TrendingUp } from "lucide-react";

interface DividendDistributionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rentalId: string;
  rentalAmount: number;
  propertyTitle: string;
  onSuccess: () => void;
}

export default function DividendDistributionModal({
  open,
  onOpenChange,
  rentalId,
  rentalAmount,
  propertyTitle,
  onSuccess,
}: DividendDistributionModalProps) {
  const [loading, setLoading] = useState(false);
  const [distributionData, setDistributionData] = useState<any>(null);

  const platformFee = 1.0; // 1%
  const managementFee = 2.5; // 2.5%
  const platformAmount = rentalAmount * (platformFee / 100);
  const managementAmount = rentalAmount * (managementFee / 100);
  const distributableAmount = rentalAmount - platformAmount - managementAmount;

  const handleCreateDistribution = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-dividend-distribution', {
        body: {
          rental_id: rentalId,
          platform_fee_percentage: platformFee,
          management_fee_percentage: managementFee,
        },
      });

      if (error) throw error;

      setDistributionData(data);
      toast.success("Distribution created successfully");
    } catch (error: any) {
      console.error('Distribution error:', error);
      toast.error(error.message || "Failed to create distribution");
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = async () => {
    if (!distributionData?.distribution?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('distribute-dividends', {
        body: {
          distribution_id: distributionData.distribution.id,
        },
      });

      if (error) throw error;

      toast.success(`Dividends distributed to ${data.successful_payments} recipients`);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Distribution error:', error);
      toast.error(error.message || "Failed to distribute dividends");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Distribute Rental Income</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Property</p>
            <p className="text-lg font-semibold">{propertyTitle}</p>
          </div>

          {/* Income Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Label>Total Rental Income</Label>
              </div>
              <span className="text-lg font-semibold">
                ₦{rentalAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee ({platformFee}%)</span>
              <span className="text-red-600">-₦{platformAmount.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Management Fee ({managementFee}%)</span>
              <span className="text-red-600">-₦{managementAmount.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t font-bold">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Distributable Amount</span>
              </div>
              <span className="text-lg text-green-600">
                ₦{distributableAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Distribution Preview */}
          {distributionData && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                <Users className="h-4 w-4" />
                <span>Distribution Preview</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Recipients</p>
                  <p className="font-semibold">{distributionData.total_recipients} token holders</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Per Token</p>
                  <p className="font-semibold">₦{Number(distributionData.per_token_amount).toFixed(4)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            {!distributionData ? (
              <Button
                type="button"
                className="flex-1"
                onClick={handleCreateDistribution}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Preview Distribution
              </Button>
            ) : (
              <Button
                type="button"
                className="flex-1"
                onClick={handleDistribute}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm & Distribute
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
