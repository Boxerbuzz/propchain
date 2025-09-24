import { useState, useEffect } from "react";
import { chatApi } from "../api/chat";
import { useAuth } from "../context/AuthContext";
import { ChatRoom } from "../types";
import { toast } from "react-hot-toast";

interface UseUserChatRoomsReturn {
  chatRooms: ChatRoom[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useUserChatRooms = (): UseUserChatRoomsReturn => {
  const { currentUser, isAuthenticated } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChatRooms = async () => {
    if (!isAuthenticated || !currentUser?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch chat rooms where user is a participant
      const response = await chatApi.getChatRooms();
      
      if (response.success && response.data) {
        setChatRooms(response.data);
      } else {
        setError(response.error || "Failed to fetch chat rooms");
        if (response.error) {
          toast.error("Failed to load chat rooms");
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while fetching chat rooms";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchChatRooms();
  };

  useEffect(() => {
    fetchChatRooms();
  }, [currentUser?.id, isAuthenticated]);

  return {
    chatRooms,
    isLoading,
    error,
    refetch
  };
};