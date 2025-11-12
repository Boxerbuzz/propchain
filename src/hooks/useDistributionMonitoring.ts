import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Tokenization {
  id: string;
  token_symbol: string;
  token_name: string;
  status: string;
  total_supply: number;
  tokens_sold: number;
  investor_count: number;
  last_distribution_at: string | null;
}

interface DistributionEvent {
  id: string;
  tokenization_id: string;
  investment_id: string;
  tokens_distributed: number;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface DistributionLock {
  id: string;
  tokenization_id: string;
  locked_at: string;
}

export function useDistributionMonitoring() {
  const [tokenizations, setTokenizations] = useState<Tokenization[]>([]);
  const [recentDistributions, setRecentDistributions] = useState<DistributionEvent[]>([]);
  const [failedAttempts, setFailedAttempts] = useState<DistributionEvent[]>([]);
  const [activeLocks, setActiveLocks] = useState<DistributionLock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch tokenizations with distribution data
      // Try with last_distribution_at first, fallback without it if column doesn't exist
      let tokenizationsData: any[] = [];
      
      const { data: dataWithDistribution, error: errorWithDistribution } = await supabase
        .from('tokenizations')
        .select('id, token_symbol, token_name, status, total_supply, tokens_sold, investor_count, last_distribution_at')
        .in('status', ['active', 'minted', 'distributed'])
        .order('created_at', { ascending: false });

      if (errorWithDistribution) {
        console.log('Fetching without last_distribution_at column');
        // If column doesn't exist, fetch without it
        const { data: fallbackData } = await supabase
          .from('tokenizations')
          .select('id, token_symbol, token_name, status, total_supply, tokens_sold, investor_count')
          .in('status', ['active', 'minted', 'distributed'])
          .order('created_at', { ascending: false });
        
        tokenizationsData = (fallbackData || []).map(t => ({ ...t, last_distribution_at: null }));
      } else {
        tokenizationsData = dataWithDistribution || [];
      }
      
      setTokenizations(tokenizationsData as Tokenization[]);

      // Fetch recent distribution events (last 50) - use type assertion for tables not in types
      const { data: recentData, error: recentError } = await supabase
        .rpc('get_recent_distributions' as any, { limit_count: 50 }) as any;

      if (!recentError && recentData) {
        setRecentDistributions(recentData);
      } else {
        // Fallback: use activity logs as proxy
        const { data: activityData } = await supabase
          .from('activity_logs')
          .select('id, created_at, metadata, tokenization_id')
          .eq('activity_type', 'token_distribution')
          .order('created_at', { ascending: false })
          .limit(50);

        if (activityData) {
          setRecentDistributions(
            activityData.map((log: any) => ({
              id: log.id,
              tokenization_id: log.tokenization_id || '',
              investment_id: log.metadata?.investment_id || '',
              tokens_distributed: log.metadata?.tokens_distributed || 0,
              status: log.metadata?.status || 'success',
              error_message: null,
              created_at: log.created_at
            }))
          );
        }
      }

      // Fetch failed attempts (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: failedData } = await supabase
        .from('activity_logs')
        .select('id, created_at, metadata, tokenization_id')
        .eq('activity_type', 'token_distribution_failed')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false });

      if (failedData) {
        setFailedAttempts(
          failedData.map((log: any) => ({
            id: log.id,
            tokenization_id: log.tokenization_id || '',
            investment_id: log.metadata?.investment_id || '',
            tokens_distributed: log.metadata?.tokens_distributed || 0,
            status: 'failed',
            error_message: log.metadata?.error_message || null,
            created_at: log.created_at
          }))
        );
      }

      // For active locks, use a simple check on tokenizations being processed
      // This is a temporary solution until the distribution_locks table is created
      const { data: processingData } = await supabase
        .from('activity_logs')
        .select('tokenization_id, created_at')
        .eq('activity_type', 'distribution_started')
        .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // last 10 minutes
        .order('created_at', { ascending: false });

      if (processingData) {
        // Group by tokenization to get unique locks
        const uniqueLocks = new Map();
        processingData.forEach((item: any) => {
          if (item.tokenization_id && !uniqueLocks.has(item.tokenization_id)) {
            uniqueLocks.set(item.tokenization_id, {
              id: crypto.randomUUID(),
              tokenization_id: item.tokenization_id,
              locked_at: item.created_at
            });
          }
        });
        setActiveLocks(Array.from(uniqueLocks.values()));
      }

    } catch (error) {
      console.error('Error fetching distribution monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to activity logs for real-time updates (until proper tables exist)
    const activityChannel = supabase
      .channel('activity-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: 'activity_type=in.(token_distribution,token_distribution_failed,distribution_started)'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    // Subscribe to tokenizations updates
    const tokenizationsChannel = supabase
      .channel('tokenizations-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tokenizations'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activityChannel);
      supabase.removeChannel(tokenizationsChannel);
    };
  }, []);

  return {
    tokenizations,
    recentDistributions,
    failedAttempts,
    activeLocks,
    loading,
    refetch: fetchData
  };
}
