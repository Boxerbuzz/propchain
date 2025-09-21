import { supabase } from "../lib/supabase";
import { PropertyRepository } from "../data/repositories/PropertyRepository";
import { PropertyService } from "../services/PropertyService";
import { PropertyFormData, PropertyFormSchema, Property, ApiResponseSchema, PropertyImage, PropertyDocument, PaginatedResponseSchema, PropertySchema, PropertyImageSchema, PropertyDocumentSchema, GenericApiResponse } from "../types";
import { z } from "zod";

// Initialize repositories and services
const propertyRepository = new PropertyRepository(supabase);
const propertyService = new PropertyService(propertyRepository);

// Define response types
const PropertyResponseSchema = ApiResponseSchema(PropertySchema);
type PropertyResponse = z.infer<typeof PropertyResponseSchema>;

const PropertiesListResponseSchema = ApiResponseSchema(z.array(PropertySchema));
type PropertiesListResponse = z.infer<typeof PropertiesListResponseSchema>;

const PropertyImageResponseSchema = ApiResponseSchema(PropertyImageSchema);
type PropertyImageResponse = z.infer<typeof PropertyImageResponseSchema>;

const PropertyDocumentResponseSchema = ApiResponseSchema(PropertyDocumentSchema);
type PropertyDocumentResponse = z.infer<typeof PropertyDocumentResponseSchema>;

export const propertyApi = {
  async createProperty(ownerId: string, formData: any): Promise<PropertyResponse | GenericApiResponse> {
    try {
      const validatedData = PropertyFormSchema.parse(formData);
      const property = await propertyService.createProperty(ownerId, validatedData);
      return { success: true, data: property, message: "Property created successfully." };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0].message, message: "Validation Error" };
      }
      return { success: false, error: error.message, message: "Failed to create property." };
    }
  },

  async getPropertyDetails(propertyId: string): Promise<PropertyResponse | GenericApiResponse> {
    try {
      const property = await propertyService.getPropertyDetails(propertyId);
      if (!property) {
        return { success: false, message: "Property not found." };
      }
      return { success: true, data: property, message: "Property details retrieved successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to retrieve property details." };
    }
  },

  async listProperties(filters?: any): Promise<PropertiesListResponse | GenericApiResponse> {
    try {
      const properties = await propertyService.listProperties(filters);
      return { success: true, data: properties, message: "Properties listed successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to list properties." };
    }
  },

  async updateProperty(propertyId: string, formData: any): Promise<PropertyResponse | GenericApiResponse> {
    try {
      // You might have a specific schema for updates (e.g., Partial<PropertyFormSchema>)
      const updatedProperty = await propertyService.updateProperty(propertyId, formData);
      if (!updatedProperty) {
        return { success: false, message: "Property not found or update failed." };
      }
      return { success: true, data: updatedProperty, message: "Property updated successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to update property." };
    }
  },

  async uploadPropertyImage(propertyId: string, imageUrl: string, imageType?: string, caption?: string, isPrimary?: boolean): Promise<PropertyImageResponse | GenericApiResponse> {
    try {
      const image = await propertyService.uploadPropertyImage(propertyId, imageUrl, imageType, caption, isPrimary);
      if (!image) {
        return { success: false, message: "Failed to upload image." };
      }
      return { success: true, data: image, message: "Property image uploaded successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to upload property image." };
    }
  },

  async uploadPropertyDocument(propertyId: string, documentType: string, documentName: string, fileUrl: string): Promise<PropertyDocumentResponse | GenericApiResponse> {
    try {
      const document = await propertyService.uploadPropertyDocument(propertyId, documentType, documentName, fileUrl);
      if (!document) {
        return { success: false, message: "Failed to upload document." };
      }
      return { success: true, data: document, message: "Property document uploaded successfully." };
    } catch (error: any) {
      return { success: false, error: error.message, message: "Failed to upload property document." };
    }
  },
};
