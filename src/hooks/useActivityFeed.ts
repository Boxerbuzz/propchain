import { useQuery } from "@tanstack/react-query";
import { supabaseService } from "@/services/supabaseService";
import { useAuth } from "@/hooks/useAuth";

export function useActivityFeed(limit = 20) {
  const { user } = useAuth();

  const {
    data: activities = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["activity-feed", user?.id, limit],
    queryFn: () => {
      if (!user?.id) return Promise.resolve([]);
      return supabaseService.activity.getActivityFeed(user.id, limit);
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  return {
    activities,
    isLoading,
    error,
    refetch,
  };
}
