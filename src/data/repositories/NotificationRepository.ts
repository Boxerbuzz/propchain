import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "../BaseRepository";
import { Notification } from "../../types";

export class NotificationRepository extends BaseRepository<Notification> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "notifications");
  }

  async getUnreadNotificationsByUserId(userId: string): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .is("read_at", null) // Notifications where read_at is NULL are unread
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Notification[];
  }

  async markAllAsReadByUserId(userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);
    if (error) throw error;
    return true;
  }

  async deleteReadNotificationsByUserId(userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq("user_id", userId)
      .not("read_at", "is", null);
    if (error) throw error;
    return true;
  }
}
