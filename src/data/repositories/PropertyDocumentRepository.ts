import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "../BaseRepository";
import { PropertyDocument } from "../../types";

export class PropertyDocumentRepository extends BaseRepository<PropertyDocument> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "property_documents");
  }

  async findByPropertyId(propertyId: string): Promise<PropertyDocument[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("property_id", propertyId)
      .order("uploaded_at", { ascending: false });
    if (error) throw error;
    return data as PropertyDocument[];
  }

  async findByDocumentType(propertyId: string, documentType: string): Promise<PropertyDocument[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("property_id", propertyId)
      .eq("document_type", documentType);
    if (error) throw error;
    return data as PropertyDocument[];
  }

  async findVerifiedDocuments(propertyId: string): Promise<PropertyDocument[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("property_id", propertyId)
      .eq("verification_status", "verified");
    if (error) throw error;
    return data as PropertyDocument[];
  }

  async updateVerificationStatus(
    id: string, 
    status: 'pending' | 'verified' | 'rejected',
    verifiedBy?: string
  ): Promise<PropertyDocument | null> {
    const updateData: any = { 
      verification_status: status,
      verified_at: status === 'verified' ? new Date().toISOString() : null
    };
    
    if (verifiedBy) {
      updateData.verified_by = verifiedBy;
    }

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as PropertyDocument;
  }

  async getRequiredDocuments(propertyId: string): Promise<{ 
    required: string[], 
    uploaded: string[],
    verified: string[]
  }> {
    const requiredDocs = [
      'certificate_of_occupancy',
      'deed_of_assignment',
      'survey_plan',
      'building_plan',
      'property_photos'
    ];

    const documents = await this.findByPropertyId(propertyId);
    const uploaded = documents.map(doc => (doc as any).document_type);
    const verified = documents
      .filter(doc => (doc as any).verification_status === 'verified')
      .map(doc => (doc as any).document_type);

    return {
      required: requiredDocs,
      uploaded,
      verified
    };
  }

  async getDocumentByHash(fileHash: string): Promise<PropertyDocument | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("file_hash", fileHash)
      .maybeSingle();
    if (error) throw error;
    return data as PropertyDocument | null;
  }

  async bulkUpdateExpiry(documentIds: string[], expiryDate: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .update({ expiry_date: expiryDate })
      .in("id", documentIds);
    if (error) throw error;
    return true;
  }
}