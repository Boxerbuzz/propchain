import { useState, useEffect, useCallback } from "react";
import { supabaseService } from "@/services/supabaseService";
import { useSupabaseAuth } from "./useSupabaseAuth";
import { ChatRoom } from "../types";
import { toast } from "react-hot-toast";

interface UseUserChatRoomsReturn {
  chatRooms: any[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useUserChatRooms = (): UseUserChatRoomsReturn => {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChatRooms = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await supabaseService.chat.getUserChatRooms(user.id);
      setChatRooms(data);
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while fetching chat rooms";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  const refetch = () => {
    fetchChatRooms();
  };

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  return {
    chatRooms,
    isLoading,
    error,
    refetch
  };
};