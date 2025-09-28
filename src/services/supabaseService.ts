import { supabase } from "@/integrations/supabase/client";
import { User, Tokenization } from "@/types";
import { Database } from "@/types/database.types";

export const supabaseService = {
  // Auth services
  auth: {
    async getProfile(userId: string): Promise<User | null> {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data as unknown as User;
    },

    async upsertProfile(
      userId: string,
      profileData: Partial<User>
    ): Promise<User | null> {
      // Convert Date fields to ISO strings for database
      const dbData = {
        id: userId,
        ...profileData,
      };

      // Convert Date objects to ISO strings if present
      if (dbData.date_of_birth instanceof Date) {
        (dbData as any).date_of_birth = dbData.date_of_birth
          .toISOString()
          .split("T")[0];
      }
      if (dbData.created_at instanceof Date) {
        (dbData as any).created_at = dbData.created_at.toISOString();
      }
      if (dbData.updated_at instanceof Date) {
        (dbData as any).updated_at = dbData.updated_at.toISOString();
      }

      const { data, error } = await supabase
        .from("users")
        .upsert(dbData as any)
        .select()
        .single();

      if (error) {
        console.error("Error upserting profile:", error);
        return null;
      }

      return data as unknown as User;
    },
  },

  // Properties services
  properties: {
    async create(propertyData: any, userId: string) {
      const { data, error } = await supabase
        .from("properties")
        .insert({
          title: propertyData.title,
          description: propertyData.description,
          property_type: propertyData.property_type,
          location: propertyData.location,
          estimated_value: propertyData.estimated_value,
          rental_income_monthly: propertyData.rental_income_monthly || null,
          bedrooms: propertyData.bedrooms || null,
          bathrooms: propertyData.bathrooms || null,
          year_built: propertyData.year_built || null,
          owner_id: userId,
          approval_status: "pending",
          listing_status: "draft",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating property:", error);
        throw error;
      }

      return data;
    },

    async getOwnedProperties(userId: string) {
      const { data, error } = await supabase
        .from("properties")
        .select(
          `
          *,
          tokenizations(*),
          property_images(
            id,
            image_url,
            is_primary,
            sort_order
          ),
          property_documents(
            id,
            document_name,
            document_type,
            verification_status
          )
        `
        )
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching owned properties:", error);
        throw error;
      }

      return data;
    },

    async updateProperty(propertyId: string, updates: any) {
      const { data, error } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", propertyId)
        .select()
        .single();

      if (error) {
        console.error("Error updating property:", error);
        throw error;
      }

      return data;
    },

    async deleteProperty(propertyId: string) {
      const { error } = await supabase
        .from("properties")
        .update({ listing_status: "deleted" })
        .eq("id", propertyId);

      if (error) {
        console.error("Error deleting property:", error);
        throw error;
      }
    },

    async uploadPropertyImage(
      propertyId: string,
      file: File,
      isPrimary: boolean = false
    ) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${propertyId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("property-images").getPublicUrl(fileName);

      const { data, error } = await supabase
        .from("property_images")
        .insert({
          property_id: propertyId,
          image_url: publicUrl,
          is_primary: isPrimary,
          sort_order: 0,
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving image record:", error);
        throw error;
      }

      return data;
    },

    async uploadPropertyDocument(
      propertyId: string,
      file: File,
      documentType: string,
      documentName: string
    ) {
      // Get current user for uploaded_by field
      const { data: { user } } = await supabase.auth.getUser();
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${propertyId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("property-documents")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Error uploading document:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("property-documents").getPublicUrl(fileName);

      const { data, error } = await supabase
        .from("property_documents")
        .insert({
          property_id: propertyId,
          document_name: documentName,
          document_type: documentType,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          verification_status: "pending",
          uploaded_by: user?.id || null,
          uploaded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving document record:", error);
        throw error;
      }

      return data;
    },

    async updateDocumentHfsData(documentId: string, hfsFileId: string, verificationStatus: string, fileHash?: string) {
      // Get current user for verified_by field
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: any = {
        hfs_file_id: hfsFileId,
        verification_status: verificationStatus,
        verified_at: new Date().toISOString(),
        verified_by: user?.id || null,
        uploaded_by: user?.id || null,
        uploaded_at: new Date().toISOString(),
      };

      // Add file hash if provided
      if (fileHash) {
        updateData.file_hash = fileHash;
      }
      
      const { data, error } = await supabase
        .from("property_documents")
        .update(updateData)
        .eq("id", documentId)
        .select()
        .single();

      if (error) {
        console.error("Error updating document HFS data:", error);
        throw error;
      }

      return data;
    },

    async getPropertyById(propertyId: string) {
      const { data, error } = await supabase
        .from("properties")
        .select(
          `
          *,
          tokenizations(*),
          property_images(*),
          property_documents(*)
        `
        )
        .eq("id", propertyId)
        .single();

      if (error) {
        console.error("Error fetching property:", error);
        throw error;
      }

      return data;
    },

    async getPropertyFinancials(propertyId: string) {
      // Get tokenization data and investment metrics
      const { data: tokenization, error: tokError } = await supabase
        .from("tokenizations")
        .select(
          `
          *,
          investments(
            amount_ngn,
            payment_status,
            created_at
          )
        `
        )
        .eq("property_id", propertyId)
        .single();

      if (tokError && tokError.code !== "PGRST116") {
        console.error("Error fetching property financials:", tokError);
        throw tokError;
      }

      return tokenization || null;
    },

    async listActiveTokenizations(): Promise<Tokenization[]> {
      const { data, error } = await supabase
        .from("tokenizations")
        .select(
          `
          *,
          properties!inner(
            id,
            title,
            location,
            property_type,
            estimated_value
          )
        `
        )
        .in("status", ["upcoming", "active", "completed"])
        .eq("properties.approval_status", "approved")
        .eq("properties.listing_status", "active");

      if (error) {
        console.error("Error fetching tokenizations:", error);
        return [];
      }

      return data as unknown as Tokenization[];
    },

    async getTokenizationById(id: string): Promise<Tokenization | null> {
      const { data, error } = await supabase
        .from("tokenizations")
        .select(
          `
          *,
          properties!inner(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching tokenization:", error);
        return null;
      }

      return data as unknown as Tokenization;
    },

    async getPropertyImages(propertyId: string) {
      const { data, error } = await supabase
        .from("property_images")
        .select("*")
        .eq("property_id", propertyId)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching property images:", error);
        return [];
      }

      return data;
    },

    async approveProperty(propertyId: string, approvedBy?: string) {
      // Update property status to approved
      // The database trigger will automatically call the property-approved edge function
      const { data, error } = await supabase
        .from("properties")
        .update({
          approval_status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: approvedBy || null,
        })
        .eq("id", propertyId)
        .select()
        .single();

      if (error) {
        console.error("Error approving property:", error);
        throw error;
      }

      return data;
    },

    async processPropertyApproval(propertyId: string) {
      // Manually call the property-approved edge function
      const { data, error } = await supabase.functions.invoke('property-approved', {
        body: { propertyId },
      });

      if (error) {
        console.error("Error processing property approval:", error);
        throw error;
      }

      return data;
    },
  },

  // Investments services
  investments: {
    async create(investmentData: any) {
      const { data, error } = await supabase
        .from("investments")
        .insert(investmentData)
        .select()
        .single();

      if (error) {
        console.error("Error creating investment:", error);
        throw error;
      }

      return data;
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from("investments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating investment:", error);
        throw error;
      }

      return data;
    },

    async createWithReservation(data: {
      tokenization_id: string;
      investor_id: string;
      amount_ngn: number;
      tokens_requested: number;
      payment_method?: string;
    }) {
      const { data: result, error } = await supabase.rpc(
        "create_investment_with_reservation",
        {
          p_tokenization_id: data.tokenization_id,
          p_investor_id: data.investor_id,
          p_amount_ngn: data.amount_ngn,
          p_tokens_requested: data.tokens_requested,
        }
      );

      if (error) throw error;
      return result;
    },

    async listByUser(userId: string) {
      const { data, error } = await supabase
        .from("investments")
        .select(
          `
          *,
          tokenizations!inner(
            *,
            properties!inner(*)
          )
        `
        )
        .eq("investor_id", userId);

      if (error) {
        console.error("Error fetching investments:", error);
        return [];
      }

      return data;
    },

    async getTokenHoldings(userId: string) {
      const { data, error } = await supabase
        .from("token_holdings")
        .select(
          `
          *,
          tokenizations!inner(
            *,
            properties!inner(*)
          )
        `
        )
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching token holdings:", error);
        return [];
      }

      return data;
    },
  },

  // Notifications services
  notifications: {
    async listUnreadByUser(userId: string) {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .is("read_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      return data;
    },

    async markAllAsRead(userId: string) {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .is("read_at", null);

      if (error) {
        console.error("Error marking notifications as read:", error);
        return false;
      }

      return true;
    },

    async create(userId: string, type: string, title: string, message: string, metadata?: any) {
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          notification_type: type,
          title,
          message,
          action_data: metadata || {},
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating notification:", error);
        return null;
      }

      return data;
    },
  },

  // Wallets services
  wallets: {
    async listByUser(userId: string) {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching wallets:", error);
        return [];
      }

      return data;
    },

    async deductBalance(data: {
      userId: string;
      amount: number;
      reference: string;
    }) {
      const { data: result, error } = await supabase.functions.invoke(
        "deduct-wallet-balance",
        {
          body: data,
        }
      );

      if (error) throw error;
      return result;
    },
  },

  // Chat services
  chat: {
    async getUserChatRooms(userId: string) {
      const { data, error } = await supabase
        .from("user_chat_rooms_with_last_message")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching user chat rooms:", error);
        return [];
      }

      return data || [];
    },

    async getChatMessages(roomId: string) {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(
          `
          *,
          users!inner(first_name, last_name)
        `
        )
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching chat messages:", error);
        return [];
      }

      return data;
    },

    async sendMessage(roomId: string, userId: string, message: string) {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          room_id: roomId,
          sender_id: userId,
          message_text: message,
          message_type: "text",
        })
        .select()
        .single();

      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }

      return data;
    },
  },

  // Tokenizations services
  tokenizations: {
    async create(
      tokenizationData: Database["public"]["Tables"]["tokenizations"]["Insert"]
    ) {
      // Ensure we have valid auth before attempting insert
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Authentication required to create tokenization");
      }

      console.log("Creating tokenization with data:", tokenizationData);
      console.log("Authenticated user:", user.id);

      const { data, error } = await supabase
        .from("tokenizations")
        .insert({
          ...tokenizationData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating tokenization:", error);
        throw error;
      }

      return data;
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from("tokenizations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching tokenization:", error);
        throw error;
      }

      return data;
    },

    async getByPropertyId(propertyId: string) {
      const { data, error } = await supabase
        .from("tokenizations")
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tokenizations:", error);
        return [];
      }

      return data || [];
    },
  },

  // Payments services
  payments: {
    async initializePaystack(data: {
      amount: number;
      email: string;
      reference: string;
    }) {
      const { data: result, error } = await supabase.functions.invoke(
        "initialize-paystack-payment",
        {
          body: data,
        }
      );

      if (error) throw error;
      return result;
    },
  },
};
