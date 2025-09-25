import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseService } from "@/services/supabaseService";
import { useAuth } from "@/context/AuthContext";
import { UserChatRoomWithLastMessage } from "../types";

export const useUserChatRooms = () => {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['user-chat-rooms', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) return [];
      return await supabaseService.chat.getUserChatRooms(user.id) as unknown as UserChatRoomWithLastMessage[];
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useChatMessages = (roomId: string) => {
  return useQuery({
    queryKey: ['chat-messages', roomId],
    queryFn: async () => {
      if (!roomId) return [];
      return await supabaseService.chat.getChatMessages(roomId);
    },
    enabled: !!roomId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useSendMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ roomId, message }: { roomId: string; message: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return await supabaseService.chat.sendMessage(roomId, user.id, message);
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', roomId] });
    },
  });
};