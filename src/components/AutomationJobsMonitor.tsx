import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AutomationJob {
  id: string;
  job_name: string;
  status: string;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  metadata?: any;
  created_at: string;
}

export const AutomationJobsMonitor = () => {
  const { data: recentJobs, isLoading } = useQuery<AutomationJob[]>({
    queryKey: ["automation-jobs"],
    queryFn: async () => {
      // @ts-ignore - Table not in generated types yet
      const { data, error } = await (supabase as any)
        .from("automation_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as unknown as AutomationJob[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Automation Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading job history...</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "running":
        return <Clock className="h-4 w-4 text-warning animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "running":
        return <Badge variant="secondary">Running</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Automation Jobs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentJobs && recentJobs.length > 0 ? (
            recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-start justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(job.status)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{job.job_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(job.started_at), {
                        addSuffix: true,
                      })}
                    </p>
                    {job.error_message && (
                      <p className="text-xs text-destructive mt-1">
                        {job.error_message}
                      </p>
                    )}
                    {job.metadata && job.metadata.message && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {job.metadata.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(job.status)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No automation jobs found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
