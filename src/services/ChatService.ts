import { ChatRepository } from "../data/repositories/ChatRepository";
import { ChatRoom, ChatParticipant, ChatMessage } from "../types";

export class ChatService {
  private chatRepository: ChatRepository;

  constructor(chatRepository: ChatRepository) {
    this.chatRepository = chatRepository;
  }

  async createChatRoom(createdBy: string, name: string, description?: string, roomType?: ChatRoom["roomType"], isPublic?: boolean): Promise<ChatRoom | null> {
    const newRoom: Partial<ChatRoom> = {
      createdBy,
      name,
      description,
      roomType,
      isPublic,
      createdAt: new Date(),
      updatedAt: new Date(),
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
      roomId,
      userId,
      role,
      joinedAt: new Date(),
    };
    return this.chatRepository.createChatParticipant(newParticipant);
  }

  async getRoomParticipants(roomId: string): Promise<ChatParticipant[]> {
    return this.chatRepository.getChatParticipants(roomId);
  }

  async sendMessage(roomId: string, senderId: string, messageText: string, messageType?: ChatMessage["messageType"]): Promise<ChatMessage | null> {
    const newMessage: Partial<ChatMessage> = {
      roomId,
      senderId,
      messageText,
      messageType,
      createdAt: new Date(),
    };
    return this.chatRepository.createChatMessage(newMessage);
  }

  async getRoomMessages(roomId: string): Promise<ChatMessage[]> {
    return this.chatRepository.getChatMessages(roomId);
  }
}
