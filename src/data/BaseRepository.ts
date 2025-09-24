import { SupabaseClient } from "@supabase/supabase-js";

export class BaseRepository<T> {
  protected supabase: SupabaseClient;
  protected tableName: string;

  constructor(supabase: SupabaseClient, tableName: string) {
    this.supabase = supabase;
    this.tableName = tableName;
    console.log(
      `BaseRepository: Initialized for table '${this.tableName}'. Supabase client available.`,
      this.supabase
    );
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
    console.log(
      `BaseRepository: findById called for table '${this.tableName}' with ID: '${id}'`
    );
    console.log(
      `BaseRepository: Debugging Supabase query details: tableName=${this.tableName}, id=${id}, supabaseClient=`,
      this.supabase
    );

    const queryBuilder = this.supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id);

    console.log(
      "BaseRepository: Supabase query builder object before .single():",
      queryBuilder
    );

    // --- TEMPORARY: Attempting direct fetch to debug network request issue ---
    const url = queryBuilder["url"].toString(); // Accessing the URL from the internal query builder object
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    const headers = {
      ...queryBuilder["headers"],
      Authorization: `Bearer ${session?.access_token}`,
    };

    console.log(
      "BaseRepository: Attempting direct fetch to:",
      url,
      "with headers:",
      headers
    );

    let data = null;
    let error = null;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const json = await response.json();
      // Supabase .single() expects a single object or null if not found
      data = Array.isArray(json) && json.length > 0 ? json[0] : null;

      if (!data) {
        error = { code: "PGRST116", message: "No rows found" }; // Mimic Supabase error for no rows
      }

      console.log("BaseRepository: Direct fetch result:", { data, error });
    } catch (e: any) {
      console.error("BaseRepository: Direct fetch error:", e);
      error = { message: e.message || "Unknown network error" };
    }
    // --- END TEMPORARY ---

    // const { data, error } = await queryBuilder.single(); // Temporarily commented out

    if (error) {
      console.error(
        `BaseRepository: Error in findById for table '${this.tableName}' with ID '${id}':`,
        error
      );
      if (error.code !== "PGRST116") {
        throw error; // Re-throw if it's not just 'No rows found'
      }
    }

    console.log(
      `BaseRepository: findById result for table '${this.tableName}' with ID '${id}':`,
      { data, error }
    );

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
