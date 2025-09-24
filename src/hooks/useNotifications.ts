import { useState, useEffect } from "react";
import { userApi } from "../api/users";
import { useAuth } from "../context/AuthContext";
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
  const { currentUser, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated || !currentUser?.id) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await userApi.getUserNotifications(currentUser.id);
      
      if (response.success && response.data) {
        setNotifications(response.data);
      } else {
        setError(response.error || "Failed to fetch notifications");
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while fetching notifications";
      setError(errorMessage);
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser?.id) return;

    try {
      const response = await userApi.markAllNotificationsAsRead(currentUser.id);
      if (response.success) {
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
    if (!currentUser?.id) return;

    try {
      const response = await userApi.clearReadNotifications(currentUser.id);
      if (response.success) {
        // Remove read notifications from local state
        setNotifications(prev => prev.filter(n => !n.read_at));
        toast.success("Read notifications cleared");
      } else {
        toast.error("Failed to clear notifications");
      }
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
  }, [currentUser?.id, isAuthenticated]);

  return {
    notifications,
    isLoading,
    error,
    refetch,
    markAllAsRead,
    clearReadNotifications
  };
};