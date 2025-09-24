import { ChatRepository } from "../data/repositories/ChatRepository";
import { ChatRoom, ChatParticipant, ChatMessage } from "../types";

export class ChatService {
  private chatRepository: ChatRepository;

  constructor(chatRepository: ChatRepository) {
    this.chatRepository = chatRepository;
  }

  async createChatRoom(createdBy: string, name: string, description?: string, room_type?: ChatRoom["room_type"], is_public?: boolean): Promise<ChatRoom | null> {
    const newRoom: Partial<ChatRoom> = {
      created_by: createdBy,
      name,
      description,
      room_type,
      is_public,
      created_at: new Date(),
      updated_at: new Date(),
    };
    return this.chatRepository.create(newRoom);
  }

  async getChatRoom(roomId: string): Promise<ChatRoom | null> {
    return this.chatRepository.findById(roomId);
  }

  async getChatRooms(filters?: Partial<ChatRoom>): Promise<ChatRoom[]> {
    return this.chatRepository.find(filters);
  }

  async addParticipantToRoom(roomId: string, userId: string, role?: ChatParticipant["role"]): Promise<ChatParticipant | null> {
    const newParticipant: Partial<ChatParticipant> = {
      room_id: roomId,
      user_id: userId,
      role,
      joined_at: new Date(),
    };
    return this.chatRepository.createChatParticipant(newParticipant);
  }

  async getRoomParticipants(roomId: string): Promise<ChatParticipant[]> {
    return this.chatRepository.getChatParticipants(roomId);
  }

  async sendMessage(roomId: string, senderId: string, messageText: string, message_type?: ChatMessage["message_type"]): Promise<ChatMessage | null> {
    const newMessage: Partial<ChatMessage> = {
      room_id: roomId,
      sender_id: senderId,
      message_text: messageText,
      message_type,
      created_at: new Date(),
    };
    return this.chatRepository.createChatMessage(newMessage);
  }

  async getRoomMessages(roomId: string): Promise<ChatMessage[]> {
    return this.chatRepository.getChatMessages(roomId);
  }
}
