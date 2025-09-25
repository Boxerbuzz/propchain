import { supabase } from '@/integrations/supabase/client';
import { User, Tokenization, Property } from '@/types';

export const supabaseService = {
  // Auth services
  auth: {
    async getProfile(userId: string): Promise<User | null> {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data as unknown as User;
    },

    async upsertProfile(userId: string, profileData: Partial<User>): Promise<User | null> {
      // Convert Date fields to ISO strings for database
      const dbData = {
        id: userId,
        ...profileData,
      };
      
      // Convert Date objects to ISO strings if present
      if (dbData.date_of_birth instanceof Date) {
        (dbData as any).date_of_birth = dbData.date_of_birth.toISOString().split('T')[0];
      }
      if (dbData.created_at instanceof Date) {
        (dbData as any).created_at = dbData.created_at.toISOString();
      }
      if (dbData.updated_at instanceof Date) {
        (dbData as any).updated_at = dbData.updated_at.toISOString();
      }
      
      const { data, error } = await supabase
        .from('users')
        .upsert(dbData as any)
        .select()
        .single();
      
      if (error) {
        console.error('Error upserting profile:', error);
        return null;
      }
      
      return data as unknown as User;
    },
  },

  // Properties services
  properties: {
    async create(propertyData: any, userId: string) {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          title: propertyData.title,
          description: propertyData.description,
          property_type: propertyData.propertyType,
          location: {
            address: propertyData.address,
            city: propertyData.city,
            state: propertyData.state,
            country: propertyData.country,
          },
          estimated_value: parseFloat(propertyData.totalValue),
          owner_id: userId,
          approval_status: 'pending',
          listing_status: 'draft',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating property:', error);
        throw error;
      }

      return data;
    },

    async getOwnedProperties(userId: string) {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          tokenizations(*),
          property_images(
            id,
            image_url,
            is_primary,
            sort_order
          )
        `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching owned properties:', error);
        throw error;
      }

      return data;
    },

    async updateProperty(propertyId: string, updates: any) {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', propertyId)
        .select()
        .single();

      if (error) {
        console.error('Error updating property:', error);
        throw error;
      }

      return data;
    },

    async deleteProperty(propertyId: string) {
      const { error } = await supabase
        .from('properties')
        .update({ listing_status: 'deleted' })
        .eq('id', propertyId);

      if (error) {
        console.error('Error deleting property:', error);
        throw error;
      }
    },

    async getPropertyFinancials(propertyId: string) {
      // Get tokenization data and investment metrics
      const { data: tokenization, error: tokError } = await supabase
        .from('tokenizations')
        .select(`
          *,
          investments(
            amount_ngn,
            payment_status,
            created_at
          )
        `)
        .eq('property_id', propertyId)
        .single();

      if (tokError && tokError.code !== 'PGRST116') {
        console.error('Error fetching property financials:', tokError);
        throw tokError;
      }

      return tokenization || null;
    },

    async listActiveTokenizations(): Promise<Tokenization[]> {
      const { data, error } = await supabase
        .from('tokenizations')
        .select(`
          *,
          properties!inner(
            id,
            title,
            location,
            property_type,
            estimated_value
          )
        `)
        .in('status', ['upcoming', 'active', 'completed'])
        .eq('properties.approval_status', 'approved')
        .eq('properties.listing_status', 'active');
      
      if (error) {
        console.error('Error fetching tokenizations:', error);
        return [];
      }
      
      return data as unknown as Tokenization[];
    },

    async getTokenizationById(id: string): Promise<Tokenization | null> {
      const { data, error } = await supabase
        .from('tokenizations')
        .select(`
          *,
          properties!inner(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching tokenization:', error);
        return null;
      }
      
      return data as unknown as Tokenization;
    },

    async getPropertyById(id: string): Promise<Property | null> {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching property:', error);
        return null;
      }
      
      return data as unknown as Property;
    },

    async getPropertyImages(propertyId: string) {
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('sort_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching property images:', error);
        return [];
      }
      
      return data;
    },
  },

  // Investments services
  investments: {
    async create(investmentData: any) {
      const { data, error } = await supabase
        .from('investments')
        .insert(investmentData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating investment:', error);
        throw error;
      }
      
      return data;
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating investment:', error);
        throw error;
      }
      
      return data;
    },

    async listByUser(userId: string) {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          tokenizations!inner(
            *,
            properties!inner(*)
          )
        `)
        .eq('investor_id', userId);
      
      if (error) {
        console.error('Error fetching investments:', error);
        return [];
      }
      
      return data;
    },

    async getTokenHoldings(userId: string) {
      const { data, error } = await supabase
        .from('token_holdings')
        .select(`
          *,
          tokenizations!inner(
            *,
            properties!inner(*)
          )
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching token holdings:', error);
        return [];
      }
      
      return data;
    },
  },

  // Notifications services
  notifications: {
    async listUnreadByUser(userId: string) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .is('read_at', null)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
      
      return data;
    },

    async markAllAsRead(userId: string) {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null);
      
      if (error) {
        console.error('Error marking notifications as read:', error);
        return false;
      }
      
      return true;
    },
  },

  // Wallets services
  wallets: {
    async listByUser(userId: string) {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching wallets:', error);
        return [];
      }
      
      return data;
    },
  },

  // Chat services
  chat: {
    async getUserChatRooms(userId: string) {
      // Since user_chat_rooms_with_last_message is a view, we'll use the regular chat_rooms
      // and join the data we need
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_participants!inner(
            user_id,
            role,
            voting_power,
            joined_at,
            last_seen_at
          ),
          properties(
            title,
            location
          ),
          tokenizations(
            token_symbol,
            status
          )
        `)
        .eq('chat_participants.user_id', userId);
      
      if (error) {
        console.error('Error fetching chat rooms:', error);
        return [];
      }
      
      return data || [];
    },

    async getChatMessages(roomId: string) {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          users!inner(first_name, last_name)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching chat messages:', error);
        return [];
      }
      
      return data;
    },

    async sendMessage(roomId: string, userId: string, message: string) {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: userId,
          message_text: message,
          message_type: 'text'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      
      return data;
    },
  },
};