import { SupabaseClient } from "@supabase/supabase-js";

export class BaseRepository<T> {
  protected supabase: SupabaseClient;
  protected tableName: string;

  constructor(supabase: SupabaseClient, tableName: string) {
    this.supabase = supabase;
    this.tableName = tableName;
  }

  private camelToSnakeCase(obj: Record<string, any>): Record<string, any> {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        newObj[snakeKey] = obj[key];
      }
    }
    return newObj;
  }

  async create(data: Partial<T>): Promise<T | null> {
    const snakeCaseData = this.camelToSnakeCase(data as Record<string, any>);
    const { data: createdData, error } = await this.supabase
      .from(this.tableName)
      .insert(snakeCaseData)
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
      const snakeCaseFilters = this.camelToSnakeCase(filters as Record<string, any>);
      Object.keys(snakeCaseFilters).forEach((key) => {
        query = query.eq(key, (snakeCaseFilters as any)[key]);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const snakeCaseData = this.camelToSnakeCase(data as Record<string, any>);
    const { data: updatedData, error } = await this.supabase
      .from(this.tableName)
      .update(snakeCaseData)
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
