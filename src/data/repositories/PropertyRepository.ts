import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "../BaseRepository";
import { Property, PropertyImage, PropertyDocument } from "../../types";

export class PropertyRepository extends BaseRepository<Property> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "properties");
  }

  async getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
    const { data, error } = await this.supabase
      .from("property_images")
      .select("*")
      .eq("property_id", propertyId);
    if (error) throw error;
    return data as PropertyImage[];
  }

  async getPropertyDocuments(propertyId: string): Promise<PropertyDocument[]> {
    const { data, error } = await this.supabase
      .from("property_documents")
      .select("*")
      .eq("property_id", propertyId);
    if (error) throw error;
    return data as PropertyDocument[];
  }
}
