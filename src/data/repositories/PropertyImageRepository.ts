import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "../BaseRepository";
import { PropertyImage } from "../../types";

export class PropertyImageRepository extends BaseRepository<PropertyImage> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "property_images");
  }

  async findByPropertyId(propertyId: string): Promise<PropertyImage[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("property_id", propertyId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data as PropertyImage[];
  }

  async getPrimaryImage(propertyId: string): Promise<PropertyImage | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("property_id", propertyId)
      .eq("is_primary", true)
      .maybeSingle();
    if (error) throw error;
    return data as PropertyImage | null;
  }

  async setPrimaryImage(propertyId: string, imageId: string): Promise<boolean> {
    // First, unset all primary images for this property
    await this.supabase
      .from(this.tableName)
      .update({ is_primary: false })
      .eq("property_id", propertyId);

    // Then set the new primary image
    const { error } = await this.supabase
      .from(this.tableName)
      .update({ is_primary: true })
      .eq("id", imageId)
      .eq("property_id", propertyId);

    if (error) throw error;
    return true;
  }

  async updateSortOrder(imageId: string, sortOrder: number): Promise<PropertyImage | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ sort_order: sortOrder })
      .eq("id", imageId)
      .select()
      .single();
    if (error) throw error;
    return data as PropertyImage;
  }

  async getImagesByType(propertyId: string, imageType: string): Promise<PropertyImage[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("property_id", propertyId)
      .eq("image_type", imageType)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data as PropertyImage[];
  }

  async bulkInsert(images: Partial<PropertyImage>[]): Promise<PropertyImage[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(images)
      .select();
    if (error) throw error;
    return data as PropertyImage[];
  }
}