import { useState, useEffect, useCallback } from "react";
import { supabaseService } from "@/services/supabaseService";
import { useSupabaseAuth } from "./useSupabaseAuth";
import { ChatRoom } from "../types";
import { toast } from "react-hot-toast";

interface ChatRoomWithLastMessage {
  room_id: string;
  room_name: string;
  room_description?: string;
  room_type: string;
  property_title?: string;
  property_location?: any;
  token_symbol?: string;
  tokenization_status?: string;
  last_message?: string;
  last_message_type?: string;
  last_message_at?: string;
  last_sender_first_name?: string;
  last_sender_last_name?: string;
  unread_count: number;
  voting_power: number;
  role: string;
  joined_at: string;
  last_seen_at?: string;
}

interface UseUserChatRoomsReturn {
  chatRooms: ChatRoomWithLastMessage[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useUserChatRooms = (): UseUserChatRoomsReturn => {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoomWithLastMessage[]>([]);
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