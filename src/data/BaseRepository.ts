import { SupabaseClient } from "@supabase/supabase-js";

export class BaseRepository<T> {
  protected supabase: SupabaseClient;
  protected tableName: string;

  constructor(supabase: SupabaseClient, tableName: string) {
    this.supabase = supabase;
    this.tableName = tableName;
  }

  async create(data: Partial<T>): Promise<T | null> {
    const { data: createdData, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return createdData as T;
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();
    if (error && error.code !== "PGRST116") throw error; // PGRST116 is 'No rows found'
    return data as T | null;
  }

  async find(filters?: Partial<T>): Promise<T[]> {
    let query = this.supabase.from(this.tableName).select("*");
    if (filters) {
      Object.keys(filters).forEach((key) => {
        query = query.eq(key, (filters as any)[key]);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const { data: updatedData, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updatedData as T;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }
}
