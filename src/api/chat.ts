import { supabase } from "../lib/supabase";
import { ChatRepository } from "../data/repositories/ChatRepository";
import { ChatService } from "../services/ChatService";
import { ChatRoom, ChatParticipant, ChatMessage, ApiResponseSchema, PaginatedResponseSchema, ChatRoomSchema, ChatParticipantSchema, ChatMessageSchema, GenericApiResponse } from "../types";
import { z } from "zod";

// Initialize repositories and services
const chatRepository = new ChatRepository(supabase);
const chatService = new ChatService(chatRepository);

// Define response types
const ChatRoomResponseSchema = ApiResponseSchema(ChatRoomSchema);
type ChatRoomResponse = z.infer<typeof ChatRoomResponseSchema>;

const ChatRoomsListResponseSchema = ApiResponseSchema(z.array(ChatRoomSchema));
type ChatRoomsListResponse = z.infer<typeof ChatRoomsListResponseSchema>;

const ChatParticipantResponseSchema = ApiResponseSchema(ChatParticipantSchema);
type ChatParticipantResponse = z.infer<typeof ChatParticipantResponseSchema>;

const ChatParticipantsListResponseSchema = ApiResponseSchema(z.array(ChatParticipantSchema));
type ChatParticipantsListResponse = z.infer<typeof ChatParticipantsListResponseSchema>;

const ChatMessageResponseSchema = ApiResponseSchema(ChatMessageSchema);
type ChatMessageResponse = z.infer<typeof ChatMessageResponseSchema>;

const ChatMessagesListResponseSchema = ApiResponseSchema(z.array(ChatMessageSchema));
type ChatMessagesListResponse = z.infer<typeof ChatMessagesListResponseSchema>;

export const chatApi = {
  async createChatRoom(createdBy: string, name: string, description?: string, room_type?: ChatRoom["room_type"], is_public?: boolean): Promise<ChatRoomResponse | GenericApiResponse> {
    try {
      const room = await chatService.createChatRoom(createdBy, name, description, room_type, is_public);
      return { success: true, data: room, message: "Chat room created successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to create chat room." };
    }
  },

  async getChatRoom(roomId: string): Promise<ChatRoomResponse | GenericApiResponse> {
    try {
      const room = await chatService.getChatRoom(roomId);
      if (!room) {
        return { success: false, message: "Chat room not found." };
      }
      return { success: true, data: room, message: "Chat room retrieved successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to retrieve chat room." };
    }
  },

  async getChatRooms(filters?: any): Promise<ChatRoomsListResponse | GenericApiResponse> {
    try {
      const rooms = await chatService.getChatRooms(filters);
      return { success: true, data: rooms, message: "Chat rooms retrieved successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to retrieve chat rooms." };
    }
  },

  async addParticipantToRoom(roomId: string, userId: string, role?: ChatParticipant["role"]): Promise<ChatParticipantResponse | GenericApiResponse> {
    try {
      const participant = await chatService.addParticipantToRoom(roomId, userId, role);
      return { success: true, data: participant, message: "Participant added to room successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to add participant to room." };
    }
  },

  async getRoomParticipants(roomId: string): Promise<ChatParticipantsListResponse | GenericApiResponse> {
    try {
      const participants = await chatService.getRoomParticipants(roomId);
      return { success: true, data: participants, message: "Room participants retrieved successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to retrieve room participants." };
    }
  },

  async sendMessage(roomId: string, senderId: string, messageText: string, message_type?: ChatMessage["message_type"]): Promise<ChatMessageResponse | GenericApiResponse> {
    try {
      const message = await chatService.sendMessage(roomId, senderId, messageText, message_type);
      return { success: true, data: message, message: "Message sent successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to send message." };
    }
  },

  async getRoomMessages(roomId: string): Promise<ChatMessagesListResponse | GenericApiResponse> {
    try {
      const messages = await chatService.getRoomMessages(roomId);
      return { success: true, data: messages, message: "Room messages retrieved successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to retrieve room messages." };
    }
  },
};
