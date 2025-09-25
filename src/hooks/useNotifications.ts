import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseService } from "@/services/supabaseService";
import { useAuth } from "@/context/AuthContext";
import { Notification } from "../types";

export const useNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) return [];
      return await supabaseService.notifications.listUnreadByUser(user.id) as unknown as Notification[];
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      return await supabaseService.notifications.markAllAsRead(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const clearReadNotificationsMutation = useMutation({
    mutationFn: async () => {
      // Implementation for clearing read notifications
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  return {
    notifications: notificationsQuery.data || [],
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error?.message || null,
    refetch: notificationsQuery.refetch,
    markAllAsRead: markAllAsReadMutation.mutate,
    clearReadNotifications: clearReadNotificationsMutation.mutate,
  };
};