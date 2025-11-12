import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDistributionMonitoring } from "@/hooks/useDistributionMonitoring";
import { RefreshCw, Play, AlertCircle, Clock, CheckCircle, XCircle, Lock, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DistributionMonitoring() {
  const { 
    tokenizations, 
    recentDistributions, 
    failedAttempts, 
    activeLocks, 
    loading, 
    refetch 
  } = useDistributionMonitoring();
  
  const [triggering, setTriggering] = useState<string | null>(null);

  const handleTriggerDistribution = async (tokenizationId: string) => {
    setTriggering(tokenizationId);
    try {
      const { data, error } = await supabase.functions.invoke('distribute-tokens-to-kyc-users', {
        body: { tokenization_id: tokenizationId }
      });

      if (error) throw error;

      toast.success("Distribution triggered successfully", {
        description: `Processing ${data?.total_investments || 0} investments`
      });
      
      // Refetch data after a short delay
      setTimeout(() => refetch(), 2000);
    } catch (error: any) {
      toast.error("Failed to trigger distribution", {
        description: error.message
      });
    } finally {
      setTriggering(null);
    }
  };

  const handleTriggerReconciliation = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('reconcile-token-distributions');

      if (error) throw error;

      toast.success("Reconciliation completed", {
        description: `Processed ${data?.reconciliations || 0} tokenizations`
      });
      
      setTimeout(() => refetch(), 2000);
    } catch (error: any) {
      toast.error("Failed to trigger reconciliation", {
        description: error.message
      });
    }
  };

  const getCooldownStatus = (lastDistribution: string | null) => {
    if (!lastDistribution) return { status: "ready", color: "success", minutesRemaining: 0 };
    
    const lastDist = new Date(lastDistribution);
    const now = new Date();
    const minutesSince = (now.getTime() - lastDist.getTime()) / (1000 * 60);
    const cooldownMinutes = 5;
    
    if (minutesSince < cooldownMinutes) {
      const remaining = Math.ceil(cooldownMinutes - minutesSince);
      return { status: "cooling", color: "warning", minutesRemaining: remaining };
    }
    
    return { status: "ready", color: "success", minutesRemaining: 0 };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Distribution Monitoring</h1>
          <p className="text-muted-foreground">Real-time token distribution dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleTriggerReconciliation} variant="secondary">
            <Activity className="w-4 h-4 mr-2" />
            Run Reconciliation
          </Button>
        </div>
      </div>

      {/* Active Locks Alert */}
      {activeLocks.length > 0 && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">{activeLocks.length} active lock(s)</span> - Distributions are currently in progress
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="tokenizations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tokenizations">
            Tokenizations ({tokenizations.length})
          </TabsTrigger>
          <TabsTrigger value="recent">
            Recent Distributions ({recentDistributions.length})
          </TabsTrigger>
          <TabsTrigger value="failed">
            Failed Attempts ({failedAttempts.length})
          </TabsTrigger>
          <TabsTrigger value="locks">
            Active Locks ({activeLocks.length})
          </TabsTrigger>
        </TabsList>

        {/* Tokenizations Tab */}
        <TabsContent value="tokenizations" className="space-y-4">
          <div className="grid gap-4">
            {tokenizations.map((tokenization) => {
              const cooldown = getCooldownStatus(tokenization.last_distribution_at);
              const canTrigger = cooldown.status === "ready" && !triggering;
              
              return (
                <Card key={tokenization.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{tokenization.token_symbol}</CardTitle>
                        <CardDescription>{tokenization.token_name}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={cooldown.color === "success" ? "default" : "secondary"}>
                          {cooldown.status === "ready" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {cooldown.status === "ready" ? "Ready" : `${cooldown.minutesRemaining}m cooldown`}
                        </Badge>
                        <Badge variant="outline">{tokenization.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Supply</p>
                        <p className="text-lg font-semibold">{tokenization.total_supply.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tokens Sold</p>
                        <p className="text-lg font-semibold">{tokenization.tokens_sold.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Investors</p>
                        <p className="text-lg font-semibold">{tokenization.investor_count}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Distribution</p>
                        <p className="text-sm">
                          {tokenization.last_distribution_at 
                            ? formatDistanceToNow(new Date(tokenization.last_distribution_at), { addSuffix: true })
                            : "Never"}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleTriggerDistribution(tokenization.id)}
                      disabled={!canTrigger || triggering === tokenization.id}
                      size="sm"
                      className="w-full md:w-auto"
                    >
                      {triggering === tokenization.id ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Trigger Distribution
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            {tokenizations.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No active tokenizations found
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Recent Distributions Tab */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Distribution Events</CardTitle>
              <CardDescription>Last 50 distribution attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Tokenization</TableHead>
                    <TableHead>Investment</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDistributions.map((dist) => (
                    <TableRow key={dist.id}>
                      <TableCell>
                        <Badge variant={dist.status === 'success' ? 'default' : dist.status === 'failed' ? 'destructive' : 'secondary'}>
                          {dist.status === 'success' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : dist.status === 'failed' ? (
                            <XCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {dist.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{dist.tokenization_id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-mono text-sm">{dist.investment_id.slice(0, 8)}...</TableCell>
                      <TableCell>{dist.tokens_distributed.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(dist.created_at), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {recentDistributions.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No recent distributions found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failed Attempts Tab */}
        <TabsContent value="failed">
          <Card>
            <CardHeader>
              <CardTitle>Failed Distribution Attempts</CardTitle>
              <CardDescription>Distributions that encountered errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {failedAttempts.map((attempt) => (
                  <Alert key={attempt.id} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            Tokenization: {attempt.tokenization_id.slice(0, 8)}...
                          </span>
                          <span className="text-sm">
                            {formatDistanceToNow(new Date(attempt.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="text-sm">
                          Investment: {attempt.investment_id.slice(0, 8)}... | 
                          Tokens: {attempt.tokens_distributed.toLocaleString()}
                        </div>
                        {attempt.error_message && (
                          <div className="text-sm bg-destructive/10 p-2 rounded">
                            Error: {attempt.error_message}
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
                {failedAttempts.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    No failed attempts found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Locks Tab */}
        <TabsContent value="locks">
          <Card>
            <CardHeader>
              <CardTitle>Active Distribution Locks</CardTitle>
              <CardDescription>Currently locked tokenizations being processed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeLocks.map((lock) => (
                  <Card key={lock.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-warning" />
                          <div>
                            <p className="font-semibold">Tokenization {lock.tokenization_id.slice(0, 8)}...</p>
                            <p className="text-sm text-muted-foreground">
                              Locked {formatDistanceToNow(new Date(lock.locked_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Processing
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {activeLocks.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    No active locks - all distributions idle
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
