import { PropertyRepository } from "../data/repositories/PropertyRepository";
import { Property, PropertyImage, PropertyDocument, PropertyFormData } from "../types";

export class PropertyService {
  private propertyRepository: PropertyRepository;

  constructor(propertyRepository: PropertyRepository) {
    this.propertyRepository = propertyRepository;
  }

  async createProperty(ownerId: string, propertyData: PropertyFormData): Promise<Property | null> {
    const newProperty: Partial<Property> = {
      owner_id: ownerId,
      title: propertyData.title,
      description: propertyData.description,
      location: propertyData.location,
      property_type: propertyData.propertyType,
      property_subtype: propertyData.propertySubtype,
      land_size: propertyData.landSize,
      built_up_area: propertyData.builtUpArea,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      year_built: propertyData.yearBuilt,
      condition: propertyData.condition,
      amenities: propertyData.amenities,
      estimated_value: propertyData.estimatedValue,
      // Default values from schema or calculated:
      approval_status: "pending",
      listing_status: "draft",
      views_count: 0,
      favorites_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };
    return this.propertyRepository.create(newProperty);
  }

  async updateProperty(propertyId: string, data: Partial<Property>): Promise<Property | null> {
    return this.propertyRepository.update(propertyId, data);
  }

  async getPropertyDetails(propertyId: string): Promise<Property | null> {
    return this.propertyRepository.findById(propertyId);
  }

  async listProperties(filters?: Partial<Property>): Promise<Property[]> {
    return this.propertyRepository.find(filters);
  }

  async uploadPropertyImage(propertyId: string, imageUrl: string, imageType?: string, caption?: string, isPrimary?: boolean): Promise<PropertyImage | null> {
    const newImage: Partial<PropertyImage> = {
      property_id: propertyId,
      image_url: imageUrl,
      image_type: imageType,
      caption,
      is_primary: isPrimary,
      created_at: new Date(),
    };
    // For this, we'll need a new BaseRepository or a direct Supabase call for property_images
    // For simplicity, we'll mock returning the image data for now.
    console.log(`Mock: Uploading image for property ${propertyId}: ${imageUrl}`);
    return { id: "mock-image-id-" + Date.now(), ...newImage } as PropertyImage;
  }

  async uploadPropertyDocument(propertyId: string, documentType: string, documentName: string, fileUrl: string): Promise<PropertyDocument | null> {
    const newDocument: Partial<PropertyDocument> = {
      property_id: propertyId,
      document_type: documentType,
      document_name: documentName,
      file_url: fileUrl,
      uploaded_at: new Date(),
    };
    // Similarly, direct Supabase call or dedicated repo for property_documents.
    console.log(`Mock: Uploading document for property ${propertyId}: ${documentName}`);
    return { id: "mock-doc-id-" + Date.now(), ...newDocument } as PropertyDocument;
  }

  // Add methods for managing property listings (activate, deactivate, mark as sold)
}
