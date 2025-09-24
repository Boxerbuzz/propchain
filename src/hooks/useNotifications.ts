import { useState, useEffect } from "react";
import { supabaseService } from "@/services/supabaseService";
import { useSupabaseAuth } from "./useSupabaseAuth";
import { Notification } from "../types";
import { toast } from "react-hot-toast";

interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  markAllAsRead: () => Promise<void>;
  clearReadNotifications: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated || !user?.id) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await supabaseService.notifications.listUnreadByUser(user.id);
      setNotifications(data as unknown as Notification[]);
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while fetching notifications";
      setError(errorMessage);
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const success = await supabaseService.notifications.markAllAsRead(user.id);
      if (success) {
        // Update local state to mark all as read
        setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date() })));
        toast.success("All notifications marked as read");
      } else {
        toast.error("Failed to mark notifications as read");
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const clearReadNotifications = async () => {
    if (!user?.id) return;

    try {
      // For now, just remove read notifications from local state
      // You can implement actual deletion later if needed
      setNotifications(prev => prev.filter(n => !n.read_at));
      toast.success("Read notifications cleared");
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      toast.error("Failed to clear notifications");
    }
  };

  const refetch = () => {
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id, isAuthenticated]);

  return {
    notifications,
    isLoading,
    error,
    refetch,
    markAllAsRead,
    clearReadNotifications
  };
};