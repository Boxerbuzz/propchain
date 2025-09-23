import { SupabaseClient } from "@supabase/supabase-js";

export class BaseRepository<T> {
  protected supabase: SupabaseClient;
  protected tableName: string;

  constructor(supabase: SupabaseClient, tableName: string) {
    this.supabase = supabase;
    this.tableName = tableName;
  }

  // Database already uses snake_case, no conversion needed
  private processData(obj: Record<string, any>): Record<string, any> {
    return obj;
  }

  async create(data: Partial<T>): Promise<T | null> {
    const processedData = this.processData(data as Record<string, any>);
    const { data: createdData, error } = await this.supabase
      .from(this.tableName)
      .insert(processedData)
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
      const processedFilters = this.processData(filters as Record<string, any>);
      Object.keys(processedFilters).forEach((key) => {
        query = query.eq(key, (processedFilters as any)[key]);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const processedData = this.processData(data as Record<string, any>);
    const { data: updatedData, error } = await this.supabase
      .from(this.tableName)
      .update(processedData)
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
