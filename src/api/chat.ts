import { supabase } from "../lib/supabase";
import { ChatRepository } from "../data/repositories/ChatRepository";
import { ChatService } from "../services/ChatService";
import { ChatRoom, ChatParticipant, ChatMessage, ApiResponseSchema, PaginatedResponseSchema } from "../types";
import { z } from "zod";

// Initialize repositories and services
const chatRepository = new ChatRepository(supabase);
const chatService = new ChatService(chatRepository);

// Define response types
const ChatRoomResponseSchema = ApiResponseSchema(ChatRoom);
type ChatRoomResponse = z.infer<typeof ChatRoomResponseSchema>;

const ChatRoomsListResponseSchema = ApiResponseSchema(z.array(ChatRoom));
type ChatRoomsListResponse = z.infer<typeof ChatRoomsListResponseSchema>;

const ChatParticipantResponseSchema = ApiResponseSchema(ChatParticipant);
type ChatParticipantResponse = z.infer<typeof ChatParticipantResponseSchema>;

const ChatParticipantsListResponseSchema = ApiResponseSchema(z.array(ChatParticipant));
type ChatParticipantsListResponse = z.infer<typeof ChatParticipantsListResponseSchema>;

const ChatMessageResponseSchema = ApiResponseSchema(ChatMessage);
type ChatMessageResponse = z.infer<typeof ChatMessageResponseSchema>;

const ChatMessagesListResponseSchema = ApiResponseSchema(z.array(ChatMessage));
type ChatMessagesListResponse = z.infer<typeof ChatMessagesListResponseSchema>;

export const chatApi = {
  async createChatRoom(createdBy: string, name: string, description?: string, roomType?: ChatRoom["roomType"], isPublic?: boolean): Promise<ChatRoomResponse | ApiResponseSchema<z.ZodAny>> {
    try {
      const room = await chatService.createChatRoom(createdBy, name, description, roomType, isPublic);
      return { success: true, data: room, message: "Chat room created successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to create chat room." };
    }
  },

  async getChatRoom(roomId: string): Promise<ChatRoomResponse | ApiResponseSchema<z.ZodAny>> {
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

  async getChatRooms(filters?: any): Promise<ChatRoomsListResponse | ApiResponseSchema<z.ZodAny>> {
    try {
      const rooms = await chatService.getChatRooms(filters);
      return { success: true, data: rooms, message: "Chat rooms retrieved successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to retrieve chat rooms." };
    }
  },

  async addParticipantToRoom(roomId: string, userId: string, role?: ChatParticipant["role"]): Promise<ChatParticipantResponse | ApiResponseSchema<z.ZodAny>> {
    try {
      const participant = await chatService.addParticipantToRoom(roomId, userId, role);
      return { success: true, data: participant, message: "Participant added to room successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to add participant to room." };
    }
  },

  async getRoomParticipants(roomId: string): Promise<ChatParticipantsListResponse | ApiResponseSchema<z.ZodAny>> {
    try {
      const participants = await chatService.getRoomParticipants(roomId);
      return { success: true, data: participants, message: "Room participants retrieved successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to retrieve room participants." };
    }
  },

  async sendMessage(roomId: string, senderId: string, messageText: string, messageType?: ChatMessage["messageType"]): Promise<ChatMessageResponse | ApiResponseSchema<z.ZodAny>> {
    try {
      const message = await chatService.sendMessage(roomId, senderId, messageText, messageType);
      return { success: true, data: message, message: "Message sent successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to send message." };
    }
  },

  async getRoomMessages(roomId: string): Promise<ChatMessagesListResponse | ApiResponseSchema<z.ZodAny>> {
    try {
      const messages = await chatService.getRoomMessages(roomId);
      return { success: true, data: messages, message: "Room messages retrieved successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to retrieve room messages." };
    }
  },
};
