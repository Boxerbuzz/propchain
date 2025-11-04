import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Info, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DividendDistributionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenizationId: string;
  propertyTitle: string;
}

interface DividendSchedule {
  id: string;
  property_id: string;
  tokenization_id: string;
  frequency: string;
  next_distribution_date: string;
  last_distribution_date: string | null;
  auto_distribute: boolean;
  created_at: string;
  updated_at: string;
}

export default function DividendDistributionModal({
  open,
  onOpenChange,
  tokenizationId,
  propertyTitle,
}: DividendDistributionModalProps) {
  // Fetch dividend schedule for this tokenization
  const { data: schedule, isLoading } = useQuery<DividendSchedule | null>({
    queryKey: ['dividend-schedule', tokenizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dividend_schedules' as any)
        .select('*')
        .eq('tokenization_id', tokenizationId)
        .maybeSingle();
      
      if (error) throw error;
      return data as unknown as DividendSchedule | null;
    },
    enabled: open && !!tokenizationId,
  });

  const formatFrequency = (freq: string) => {
    return freq.charAt(0).toUpperCase() + freq.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dividend Distribution Schedule</DialogTitle>
          <DialogDescription>
            View the dividend distribution schedule for this property tokenization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Property</p>
            <p className="text-lg font-semibold">{propertyTitle}</p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : schedule ? (
            <>
              {/* Schedule Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Distribution Frequency</p>
                      <p className="text-lg font-semibold">{formatFrequency(schedule.frequency)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Next Distribution</p>
                    </div>
                    <p className="font-semibold">{formatDate(schedule.next_distribution_date)}</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Last Distribution</p>
                    </div>
                    <p className="font-semibold">
                      {schedule.last_distribution_date 
                        ? formatDate(schedule.last_distribution_date)
                        : 'None yet'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Alert */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Dividends are distributed automatically on the scheduled dates. 
                  All confirmed rental income since the last distribution will be 
                  aggregated and distributed to token holders proportionally.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No dividend schedule found for this tokenization. 
                The schedule will be created automatically when tokens are minted.
              </AlertDescription>
            </Alert>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
