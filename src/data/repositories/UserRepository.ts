import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "../BaseRepository";
import { User } from "../../types";

export class UserRepository extends BaseRepository<User> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "users");
  }

  // Add user-specific query methods here if needed
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("email", email)
      .single();
    if (error && error.code !== "PGRST116") throw error; // PGRST116 is 'No rows found'
    return data as User | null;
  }
}
