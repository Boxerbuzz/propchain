import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "../BaseRepository";
import { ChatRoom, ChatParticipant, ChatMessage } from "../../types";

export class ChatRepository extends BaseRepository<ChatRoom> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "chat_rooms");
  }

  async createChatParticipant(data: Partial<ChatParticipant>): Promise<ChatParticipant | null> {
    const { data: createdData, error } = await this.supabase
      .from("chat_participants")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return createdData as ChatParticipant;
  }

  async getChatParticipants(roomId: string): Promise<ChatParticipant[]> {
    const { data, error } = await this.supabase
      .from("chat_participants")
      .select("*")
      .eq("room_id", roomId);
    if (error) throw error;
    return data as ChatParticipant[];
  }

  async createChatMessage(data: Partial<ChatMessage>): Promise<ChatMessage | null> {
    const { data: createdData, error } = await this.supabase
      .from("chat_messages")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return createdData as ChatMessage;
  }

  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data as ChatMessage[];
  }
}
