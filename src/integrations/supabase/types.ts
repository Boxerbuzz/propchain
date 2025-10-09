export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_category: string | null
          activity_type: string
          created_at: string | null
          description: string
          hcs_transaction_id: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          property_id: string | null
          tokenization_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_category?: string | null
          activity_type: string
          created_at?: string | null
          description: string
          hcs_transaction_id?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          property_id?: string | null
          tokenization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_category?: string | null
          activity_type?: string
          created_at?: string | null
          description?: string
          hcs_transaction_id?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          property_id?: string | null
          tokenization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_tokenization_id_fkey"
            columns: ["tokenization_id"]
            isOneToOne: false
            referencedRelation: "tokenizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          is_pinned: boolean | null
          message_text: string | null
          message_type: string | null
          metadata: Json | null
          reactions: Json | null
          reply_to_id: string | null
          room_id: string | null
          sender_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          message_text?: string | null
          message_type?: string | null
          metadata?: Json | null
          reactions?: Json | null
          reply_to_id?: string | null
          room_id?: string | null
          sender_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          message_text?: string | null
          message_type?: string | null
          metadata?: Json | null
          reactions?: Json | null
          reply_to_id?: string | null
          room_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          id: string
          is_muted: boolean | null
          joined_at: string | null
          last_seen_at: string | null
          notifications_enabled: boolean | null
          role: string | null
          room_id: string | null
          user_id: string | null
          voting_power: number | null
        }
        Insert: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_seen_at?: string | null
          notifications_enabled?: boolean | null
          role?: string | null
          room_id?: string | null
          user_id?: string | null
          voting_power?: number | null
        }
        Update: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_seen_at?: string | null
          notifications_enabled?: boolean | null
          role?: string | null
          room_id?: string | null
          user_id?: string | null
          voting_power?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          ai_assistant_enabled: boolean | null
          auto_join_investors: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          max_participants: number | null
          moderation_enabled: boolean | null
          name: string
          property_id: string | null
          room_type: string | null
          tokenization_id: string | null
          updated_at: string | null
        }
        Insert: {
          ai_assistant_enabled?: boolean | null
          auto_join_investors?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          moderation_enabled?: boolean | null
          name: string
          property_id?: string | null
          room_type?: string | null
          tokenization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_assistant_enabled?: boolean | null
          auto_join_investors?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          moderation_enabled?: boolean | null
          name?: string
          property_id?: string | null
          room_type?: string | null
          tokenization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_tokenization_id_fkey"
            columns: ["tokenization_id"]
            isOneToOne: false
            referencedRelation: "tokenizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dividend_distributions: {
        Row: {
          created_at: string | null
          created_by: string | null
          distribution_date: string
          distribution_period: string | null
          failed_payments: number | null
          hcs_record_id: string | null
          id: string
          payment_status: string | null
          per_token_amount: number
          property_id: string | null
          successful_payments: number | null
          tokenization_id: string | null
          total_amount_ngn: number
          total_amount_usd: number | null
          total_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          distribution_date: string
          distribution_period?: string | null
          failed_payments?: number | null
          hcs_record_id?: string | null
          id?: string
          payment_status?: string | null
          per_token_amount: number
          property_id?: string | null
          successful_payments?: number | null
          tokenization_id?: string | null
          total_amount_ngn: number
          total_amount_usd?: number | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          distribution_date?: string
          distribution_period?: string | null
          failed_payments?: number | null
          hcs_record_id?: string | null
          id?: string
          payment_status?: string | null
          per_token_amount?: number
          property_id?: string | null
          successful_payments?: number | null
          tokenization_id?: string | null
          total_amount_ngn?: number
          total_amount_usd?: number | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dividend_distributions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividend_distributions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividend_distributions_tokenization_id_fkey"
            columns: ["tokenization_id"]
            isOneToOne: false
            referencedRelation: "tokenizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dividend_payments: {
        Row: {
          amount_ngn: number
          amount_usd: number | null
          created_at: string | null
          distribution_id: string | null
          id: string
          net_amount: number | null
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          recipient_id: string | null
          tax_withheld: number | null
          tokenization_id: string | null
          tokens_held: number
        }
        Insert: {
          amount_ngn: number
          amount_usd?: number | null
          created_at?: string | null
          distribution_id?: string | null
          id?: string
          net_amount?: number | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          recipient_id?: string | null
          tax_withheld?: number | null
          tokenization_id?: string | null
          tokens_held: number
        }
        Update: {
          amount_ngn?: number
          amount_usd?: number | null
          created_at?: string | null
          distribution_id?: string | null
          id?: string
          net_amount?: number | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          recipient_id?: string | null
          tax_withheld?: number | null
          tokenization_id?: string | null
          tokens_held?: number
        }
        Relationships: [
          {
            foreignKeyName: "dividend_payments_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "dividend_distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividend_payments_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividend_payments_tokenization_id_fkey"
            columns: ["tokenization_id"]
            isOneToOne: false
            referencedRelation: "tokenizations"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_proposals: {
        Row: {
          approval_threshold: number | null
          budget_ngn: number | null
          budget_usd: number | null
          created_at: string | null
          description: string
          execution_date: string | null
          execution_notes: string | null
          execution_status: string | null
          hcs_record_id: string | null
          id: string
          property_id: string | null
          proposal_type: string
          proposer_id: string | null
          quorum_required: number | null
          status: string | null
          supporting_documents: Json | null
          title: string
          tokenization_id: string | null
          total_votes_cast: number | null
          updated_at: string | null
          votes_abstain: number | null
          votes_against: number | null
          votes_for: number | null
          voting_end: string
          voting_start: string
        }
        Insert: {
          approval_threshold?: number | null
          budget_ngn?: number | null
          budget_usd?: number | null
          created_at?: string | null
          description: string
          execution_date?: string | null
          execution_notes?: string | null
          execution_status?: string | null
          hcs_record_id?: string | null
          id?: string
          property_id?: string | null
          proposal_type: string
          proposer_id?: string | null
          quorum_required?: number | null
          status?: string | null
          supporting_documents?: Json | null
          title: string
          tokenization_id?: string | null
          total_votes_cast?: number | null
          updated_at?: string | null
          votes_abstain?: number | null
          votes_against?: number | null
          votes_for?: number | null
          voting_end: string
          voting_start: string
        }
        Update: {
          approval_threshold?: number | null
          budget_ngn?: number | null
          budget_usd?: number | null
          created_at?: string | null
          description?: string
          execution_date?: string | null
          execution_notes?: string | null
          execution_status?: string | null
          hcs_record_id?: string | null
          id?: string
          property_id?: string | null
          proposal_type?: string
          proposer_id?: string | null
          quorum_required?: number | null
          status?: string | null
          supporting_documents?: Json | null
          title?: string
          tokenization_id?: string | null
          total_votes_cast?: number | null
          updated_at?: string | null
          votes_abstain?: number | null
          votes_against?: number | null
          votes_for?: number | null
          voting_end?: string
          voting_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_proposals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_proposals_proposer_id_fkey"
            columns: ["proposer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_proposals_tokenization_id_fkey"
            columns: ["tokenization_id"]
            isOneToOne: false
            referencedRelation: "tokenizations"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_documents: {
        Row: {
          created_at: string
          document_number: string
          document_type: string
          document_url: string
          generated_at: string
          id: string
          investment_id: string
          metadata: Json | null
          property_id: string
          tokenization_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_number: string
          document_type: string
          document_url: string
          generated_at?: string
          id?: string
          investment_id: string
          metadata?: Json | null
          property_id: string
          tokenization_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_number?: string
          document_type?: string
          document_url?: string
          generated_at?: string
          id?: string
          investment_id?: string
          metadata?: Json | null
          property_id?: string
          tokenization_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_documents_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_documents_tokenization_id_fkey"
            columns: ["tokenization_id"]
            isOneToOne: false
            referencedRelation: "tokenizations"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          amount_ngn: number
          amount_usd: number | null
          created_at: string | null
          exchange_rate: number | null
          id: string
          investment_source: string | null
          investor_id: string | null
          payment_confirmed_at: string | null
          payment_method: string | null
          payment_status: string | null
          paystack_reference: string | null
          percentage_ownership: number | null
          refund_amount: number | null
          refund_processed_at: string | null
          reservation_expires_at: string | null
          reservation_status: string | null
          tokenization_id: string | null
          tokens_allocated: number | null
          tokens_requested: number
          updated_at: string | null
        }
        Insert: {
          amount_ngn: number
          amount_usd?: number | null
          created_at?: string | null
          exchange_rate?: number | null
          id?: string
          investment_source?: string | null
          investor_id?: string | null
          payment_confirmed_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          paystack_reference?: string | null
          percentage_ownership?: number | null
          refund_amount?: number | null
          refund_processed_at?: string | null
          reservation_expires_at?: string | null
          reservation_status?: string | null
          tokenization_id?: string | null
          tokens_allocated?: number | null
          tokens_requested: number
          updated_at?: string | null
        }
        Update: {
          amount_ngn?: number
          amount_usd?: number | null
          created_at?: string | null
          exchange_rate?: number | null
          id?: string
          investment_source?: string | null
          investor_id?: string | null
          payment_confirmed_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          paystack_reference?: string | null
          percentage_ownership?: number | null
          refund_amount?: number | null
          refund_processed_at?: string | null
          reservation_expires_at?: string | null
          reservation_status?: string | null
          tokenization_id?: string | null
          tokens_allocated?: number | null
          tokens_requested?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_tokenization_id_fkey"
            columns: ["tokenization_id"]
            isOneToOne: false
            referencedRelation: "tokenizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_drafts: {
        Row: {
          completed_steps: string[] | null
          created_at: string | null
          current_step: string
          document_image_url: string | null
          expires_at: string | null
          form_data: Json
          id: string
          proof_of_address_url: string | null
          selfie_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: string
          document_image_url?: string | null
          expires_at?: string | null
          form_data?: Json
          id?: string
          proof_of_address_url?: string | null
          selfie_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: string
          document_image_url?: string | null
          expires_at?: string | null
          form_data?: Json
          id?: string
          proof_of_address_url?: string | null
          selfie_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          address: string | null
          adverse_media_check: boolean | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          expires_at: string | null
          first_name: string | null
          id: string
          id_document_back_url: string | null
          id_document_front_url: string | null
          id_expiry_date: string | null
          id_number: string | null
          id_type: string | null
          investment_limit_ngn: number | null
          kyc_level: string
          last_name: string | null
          nationality: string | null
          pep_check: boolean | null
          phone_number: string | null
          postal_code: string | null
          proof_of_address_url: string | null
          provider: string | null
          provider_reference_id: string | null
          provider_response: Json | null
          rejection_reason: string | null
          sanction_check: boolean | null
          selfie_url: string | null
          state: string | null
          status: string
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address?: string | null
          adverse_media_check?: boolean | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          expires_at?: string | null
          first_name?: string | null
          id?: string
          id_document_back_url?: string | null
          id_document_front_url?: string | null
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          investment_limit_ngn?: number | null
          kyc_level?: string
          last_name?: string | null
          nationality?: string | null
          pep_check?: boolean | null
          phone_number?: string | null
          postal_code?: string | null
          proof_of_address_url?: string | null
          provider?: string | null
          provider_reference_id?: string | null
          provider_response?: Json | null
          rejection_reason?: string | null
          sanction_check?: boolean | null
          selfie_url?: string | null
          state?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: string | null
          adverse_media_check?: boolean | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          expires_at?: string | null
          first_name?: string | null
          id?: string
          id_document_back_url?: string | null
          id_document_front_url?: string | null
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          investment_limit_ngn?: number | null
          kyc_level?: string
          last_name?: string | null
          nationality?: string | null
          pep_check?: boolean | null
          phone_number?: string | null
          postal_code?: string | null
          proof_of_address_url?: string | null
          provider?: string | null
          provider_reference_id?: string | null
          provider_response?: Json | null
          rejection_reason?: string | null
          sanction_check?: boolean | null
          selfie_url?: string | null
          state?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_verifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_data: Json | null
          action_url: string | null
          created_at: string | null
          delivery_status: Json | null
          expires_at: string | null
          id: string
          message: string
          notification_type: string
          priority: string | null
          read_at: string | null
          sent_via: string[] | null
          title: string
          user_id: string | null
        }
        Insert: {
          action_data?: Json | null
          action_url?: string | null
          created_at?: string | null
          delivery_status?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          notification_type: string
          priority?: string | null
          read_at?: string | null
          sent_via?: string[] | null
          title: string
          user_id?: string | null
        }
        Update: {
          action_data?: Json | null
          action_url?: string | null
          created_at?: string | null
          delivery_status?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          sent_via?: string[] | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          amenities: Json | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          bathrooms: number | null
          bedrooms: number | null
          built_up_area: number | null
          condition: string | null
          created_at: string | null
          description: string | null
          estimated_value: number
          favorites_count: number | null
          featured: boolean | null
          hcs_topic_id: string | null
          hfs_file_ids: Json | null
          id: string
          land_size: number | null
          listing_status: string | null
          location: Json
          market_value: number | null
          owner_id: string | null
          property_manager_id: string | null
          property_subtype: string | null
          property_type: string
          rental_income_monthly: number | null
          rental_yield: number | null
          title: string
          updated_at: string | null
          verification_score: number | null
          views_count: number | null
          year_built: number | null
        }
        Insert: {
          amenities?: Json | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_up_area?: number | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          estimated_value: number
          favorites_count?: number | null
          featured?: boolean | null
          hcs_topic_id?: string | null
          hfs_file_ids?: Json | null
          id?: string
          land_size?: number | null
          listing_status?: string | null
          location: Json
          market_value?: number | null
          owner_id?: string | null
          property_manager_id?: string | null
          property_subtype?: string | null
          property_type: string
          rental_income_monthly?: number | null
          rental_yield?: number | null
          title: string
          updated_at?: string | null
          verification_score?: number | null
          views_count?: number | null
          year_built?: number | null
        }
        Update: {
          amenities?: Json | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_up_area?: number | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          estimated_value?: number
          favorites_count?: number | null
          featured?: boolean | null
          hcs_topic_id?: string | null
          hfs_file_ids?: Json | null
          id?: string
          land_size?: number | null
          listing_status?: string | null
          location?: Json
          market_value?: number | null
          owner_id?: string | null
          property_manager_id?: string | null
          property_subtype?: string | null
          property_type?: string
          rental_income_monthly?: number | null
          rental_yield?: number | null
          title?: string
          updated_at?: string | null
          verification_score?: number | null
          views_count?: number | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_property_manager_id_fkey"
            columns: ["property_manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      property_documents: {
        Row: {
          document_name: string
          document_type: string
          expiry_date: string | null
          file_hash: string | null
          file_size: number | null
          file_url: string | null
          hfs_file_id: string | null
          id: string
          mime_type: string | null
          property_id: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_hash?: string | null
          file_size?: number | null
          file_url?: string | null
          hfs_file_id?: string | null
          id?: string
          mime_type?: string | null
          property_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_hash?: string | null
          file_size?: number | null
          file_url?: string | null
          hfs_file_id?: string | null
          id?: string
          mime_type?: string | null
          property_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      property_events: {
        Row: {
          amount_ngn: number | null
          amount_usd: number | null
          conducted_by: string | null
          conducted_by_company: string | null
          conducted_by_name: string | null
          created_at: string | null
          created_by: string | null
          documents: Json | null
          event_date: string
          event_details: Json
          event_status: string | null
          event_type: string
          hcs_sequence_number: string | null
          hcs_topic_id: string | null
          hcs_transaction_id: string | null
          id: string
          notes: string | null
          photos: Json | null
          property_event_id: string | null
          property_id: string
          summary: string | null
          updated_at: string | null
        }
        Insert: {
          amount_ngn?: number | null
          amount_usd?: number | null
          conducted_by?: string | null
          conducted_by_company?: string | null
          conducted_by_name?: string | null
          created_at?: string | null
          created_by?: string | null
          documents?: Json | null
          event_date: string
          event_details: Json
          event_status?: string | null
          event_type: string
          hcs_sequence_number?: string | null
          hcs_topic_id?: string | null
          hcs_transaction_id?: string | null
          id?: string
          notes?: string | null
          photos?: Json | null
          property_event_id?: string | null
          property_id: string
          summary?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_ngn?: number | null
          amount_usd?: number | null
          conducted_by?: string | null
          conducted_by_company?: string | null
          conducted_by_name?: string | null
          created_at?: string | null
          created_by?: string | null
          documents?: Json | null
          event_date?: string
          event_details?: Json
          event_status?: string | null
          event_type?: string
          hcs_sequence_number?: string | null
          hcs_topic_id?: string | null
          hcs_transaction_id?: string | null
          id?: string
          notes?: string | null
          photos?: Json | null
          property_event_id?: string | null
          property_id?: string
          summary?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_events_conducted_by_fkey"
            columns: ["conducted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_events_property_event_id_fkey"
            columns: ["property_event_id"]
            isOneToOne: false
            referencedRelation: "property_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          caption: string | null
          created_at: string | null
          hfs_file_id: string | null
          id: string
          image_type: string | null
          image_url: string
          is_primary: boolean | null
          property_id: string | null
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          hfs_file_id?: string | null
          id?: string
          image_type?: string | null
          image_url: string
          is_primary?: boolean | null
          property_id?: string | null
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          hfs_file_id?: string | null
          id?: string
          image_type?: string | null
          image_url?: string
          is_primary?: boolean | null
          property_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_inspections: {
        Row: {
          created_at: string | null
          electrical_status: string | null
          estimated_repair_cost: number | null
          foundation_status: string | null
          hcs_transaction_id: string | null
          id: string
          inspection_date: string
          inspection_photos: Json | null
          inspection_report_url: string | null
          inspection_type: string
          inspector_company: string | null
          inspector_id: string | null
          inspector_license: string | null
          inspector_name: string | null
          issues_found: Json | null
          market_value_estimate: number | null
          overall_rating: number | null
          plumbing_status: string | null
          property_event_id: string | null
          property_id: string | null
          rental_value_estimate: number | null
          required_repairs: Json | null
          roof_status: string | null
          room_assessments: Json | null
          structural_condition: string | null
          updated_at: string | null
          walls_status: string | null
        }
        Insert: {
          created_at?: string | null
          electrical_status?: string | null
          estimated_repair_cost?: number | null
          foundation_status?: string | null
          hcs_transaction_id?: string | null
          id?: string
          inspection_date: string
          inspection_photos?: Json | null
          inspection_report_url?: string | null
          inspection_type: string
          inspector_company?: string | null
          inspector_id?: string | null
          inspector_license?: string | null
          inspector_name?: string | null
          issues_found?: Json | null
          market_value_estimate?: number | null
          overall_rating?: number | null
          plumbing_status?: string | null
          property_event_id?: string | null
          property_id?: string | null
          rental_value_estimate?: number | null
          required_repairs?: Json | null
          roof_status?: string | null
          room_assessments?: Json | null
          structural_condition?: string | null
          updated_at?: string | null
          walls_status?: string | null
        }
        Update: {
          created_at?: string | null
          electrical_status?: string | null
          estimated_repair_cost?: number | null
          foundation_status?: string | null
          hcs_transaction_id?: string | null
          id?: string
          inspection_date?: string
          inspection_photos?: Json | null
          inspection_report_url?: string | null
          inspection_type?: string
          inspector_company?: string | null
          inspector_id?: string | null
          inspector_license?: string | null
          inspector_name?: string | null
          issues_found?: Json | null
          market_value_estimate?: number | null
          overall_rating?: number | null
          plumbing_status?: string | null
          property_event_id?: string | null
          property_id?: string | null
          rental_value_estimate?: number | null
          required_repairs?: Json | null
          roof_status?: string | null
          room_assessments?: Json | null
          structural_condition?: string | null
          updated_at?: string | null
          walls_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_inspections_property_event_id_fkey"
            columns: ["property_event_id"]
            isOneToOne: false
            referencedRelation: "property_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_inspections_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_maintenance: {
        Row: {
          actual_cost_ngn: number | null
          after_photos: Json | null
          before_photos: Json | null
          completion_date: string | null
          contractor_company: string | null
          contractor_license: string | null
          contractor_name: string | null
          contractor_phone: string | null
          created_at: string | null
          created_by: string | null
          estimated_cost_ngn: number | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          hcs_transaction_id: string | null
          id: string
          invoice_url: string | null
          issue_category: string | null
          issue_description: string
          issue_severity: string | null
          maintenance_date: string
          maintenance_status: string | null
          maintenance_type: string
          notes: string | null
          parts_replaced: Json | null
          payment_method: string | null
          payment_status: string | null
          property_event_id: string | null
          property_id: string | null
          updated_at: string | null
          warranty_expiry_date: string | null
          warranty_info: string | null
          work_performed: string | null
        }
        Insert: {
          actual_cost_ngn?: number | null
          after_photos?: Json | null
          before_photos?: Json | null
          completion_date?: string | null
          contractor_company?: string | null
          contractor_license?: string | null
          contractor_name?: string | null
          contractor_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          estimated_cost_ngn?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          hcs_transaction_id?: string | null
          id?: string
          invoice_url?: string | null
          issue_category?: string | null
          issue_description: string
          issue_severity?: string | null
          maintenance_date: string
          maintenance_status?: string | null
          maintenance_type: string
          notes?: string | null
          parts_replaced?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          property_event_id?: string | null
          property_id?: string | null
          updated_at?: string | null
          warranty_expiry_date?: string | null
          warranty_info?: string | null
          work_performed?: string | null
        }
        Update: {
          actual_cost_ngn?: number | null
          after_photos?: Json | null
          before_photos?: Json | null
          completion_date?: string | null
          contractor_company?: string | null
          contractor_license?: string | null
          contractor_name?: string | null
          contractor_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          estimated_cost_ngn?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          hcs_transaction_id?: string | null
          id?: string
          invoice_url?: string | null
          issue_category?: string | null
          issue_description?: string
          issue_severity?: string | null
          maintenance_date?: string
          maintenance_status?: string | null
          maintenance_type?: string
          notes?: string | null
          parts_replaced?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          property_event_id?: string | null
          property_id?: string | null
          updated_at?: string | null
          warranty_expiry_date?: string | null
          warranty_info?: string | null
          work_performed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_maintenance_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_maintenance_property_event_id_fkey"
            columns: ["property_event_id"]
            isOneToOne: false
            referencedRelation: "property_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_maintenance_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_purchases: {
        Row: {
          agreement_signed: boolean | null
          buyer_email: string | null
          buyer_id_number: string | null
          buyer_name: string | null
          buyer_phone: string | null
          buyer_user_id: string | null
          completion_date: string | null
          created_at: string | null
          created_by: string | null
          down_payment_ngn: number | null
          hcs_transaction_id: string | null
          id: string
          payment_method: string | null
          payment_plan: string | null
          percentage_sold: number | null
          property_event_id: string | null
          property_id: string | null
          purchase_price_ngn: number
          purchase_price_usd: number | null
          remaining_balance_ngn: number | null
          sale_agreement_url: string | null
          seller_name: string | null
          seller_user_id: string | null
          signed_at: string | null
          title_transfer_doc_url: string | null
          tokens_involved: number | null
          transaction_status: string | null
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          agreement_signed?: boolean | null
          buyer_email?: string | null
          buyer_id_number?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          buyer_user_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          created_by?: string | null
          down_payment_ngn?: number | null
          hcs_transaction_id?: string | null
          id?: string
          payment_method?: string | null
          payment_plan?: string | null
          percentage_sold?: number | null
          property_event_id?: string | null
          property_id?: string | null
          purchase_price_ngn: number
          purchase_price_usd?: number | null
          remaining_balance_ngn?: number | null
          sale_agreement_url?: string | null
          seller_name?: string | null
          seller_user_id?: string | null
          signed_at?: string | null
          title_transfer_doc_url?: string | null
          tokens_involved?: number | null
          transaction_status?: string | null
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          agreement_signed?: boolean | null
          buyer_email?: string | null
          buyer_id_number?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          buyer_user_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          created_by?: string | null
          down_payment_ngn?: number | null
          hcs_transaction_id?: string | null
          id?: string
          payment_method?: string | null
          payment_plan?: string | null
          percentage_sold?: number | null
          property_event_id?: string | null
          property_id?: string | null
          purchase_price_ngn?: number
          purchase_price_usd?: number | null
          remaining_balance_ngn?: number | null
          sale_agreement_url?: string | null
          seller_name?: string | null
          seller_user_id?: string | null
          signed_at?: string | null
          title_transfer_doc_url?: string | null
          tokens_involved?: number | null
          transaction_status?: string | null
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_purchases_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_purchases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_purchases_property_event_id_fkey"
            columns: ["property_event_id"]
            isOneToOne: false
            referencedRelation: "property_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_purchases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_purchases_seller_user_id_fkey"
            columns: ["seller_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      property_rentals: {
        Row: {
          agency_fee_ngn: number | null
          agreement_signed: boolean | null
          amount_paid_ngn: number | null
          created_at: string | null
          created_by: string | null
          distributed_at: string | null
          distribution_id: string | null
          distribution_status: string | null
          end_date: string
          hcs_transaction_id: string | null
          id: string
          lease_agreement_url: string | null
          lease_duration_months: number | null
          legal_fee_ngn: number | null
          monthly_rent_ngn: number
          payment_method: string | null
          payment_status: string | null
          property_event_id: string | null
          property_id: string | null
          rental_status: string | null
          rental_type: string | null
          security_deposit_ngn: number | null
          signed_at: string | null
          special_terms: string | null
          start_date: string
          tenant_email: string | null
          tenant_id_number: string | null
          tenant_name: string
          tenant_phone: string | null
          updated_at: string | null
          utilities_included: Json | null
        }
        Insert: {
          agency_fee_ngn?: number | null
          agreement_signed?: boolean | null
          amount_paid_ngn?: number | null
          created_at?: string | null
          created_by?: string | null
          distributed_at?: string | null
          distribution_id?: string | null
          distribution_status?: string | null
          end_date: string
          hcs_transaction_id?: string | null
          id?: string
          lease_agreement_url?: string | null
          lease_duration_months?: number | null
          legal_fee_ngn?: number | null
          monthly_rent_ngn: number
          payment_method?: string | null
          payment_status?: string | null
          property_event_id?: string | null
          property_id?: string | null
          rental_status?: string | null
          rental_type?: string | null
          security_deposit_ngn?: number | null
          signed_at?: string | null
          special_terms?: string | null
          start_date: string
          tenant_email?: string | null
          tenant_id_number?: string | null
          tenant_name: string
          tenant_phone?: string | null
          updated_at?: string | null
          utilities_included?: Json | null
        }
        Update: {
          agency_fee_ngn?: number | null
          agreement_signed?: boolean | null
          amount_paid_ngn?: number | null
          created_at?: string | null
          created_by?: string | null
          distributed_at?: string | null
          distribution_id?: string | null
          distribution_status?: string | null
          end_date?: string
          hcs_transaction_id?: string | null
          id?: string
          lease_agreement_url?: string | null
          lease_duration_months?: number | null
          legal_fee_ngn?: number | null
          monthly_rent_ngn?: number
          payment_method?: string | null
          payment_status?: string | null
          property_event_id?: string | null
          property_id?: string | null
          rental_status?: string | null
          rental_type?: string | null
          security_deposit_ngn?: number | null
          signed_at?: string | null
          special_terms?: string | null
          start_date?: string
          tenant_email?: string | null
          tenant_id_number?: string | null
          tenant_name?: string
          tenant_phone?: string | null
          updated_at?: string | null
          utilities_included?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "property_rentals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_rentals_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "dividend_distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_rentals_property_event_id_fkey"
            columns: ["property_event_id"]
            isOneToOne: false
            referencedRelation: "property_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_rentals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_type: string | null
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_type?: string | null
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_type?: string | null
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      token_holdings: {
        Row: {
          acquisition_date: string | null
          average_purchase_price: number | null
          balance: number
          id: string
          last_dividend_received_at: string | null
          locked_balance: number | null
          property_id: string | null
          realized_returns_ngn: number | null
          token_id: string
          tokenization_id: string | null
          total_invested_ngn: number | null
          unrealized_returns_ngn: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          acquisition_date?: string | null
          average_purchase_price?: number | null
          balance?: number
          id?: string
          last_dividend_received_at?: string | null
          locked_balance?: number | null
          property_id?: string | null
          realized_returns_ngn?: number | null
          token_id: string
          tokenization_id?: string | null
          total_invested_ngn?: number | null
          unrealized_returns_ngn?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          acquisition_date?: string | null
          average_purchase_price?: number | null
          balance?: number
          id?: string
          last_dividend_received_at?: string | null
          locked_balance?: number | null
          property_id?: string | null
          realized_returns_ngn?: number | null
          token_id?: string
          tokenization_id?: string | null
          total_invested_ngn?: number | null
          unrealized_returns_ngn?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_holdings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_holdings_tokenization_id_fkey"
            columns: ["tokenization_id"]
            isOneToOne: false
            referencedRelation: "tokenizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_holdings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tokenizations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          auto_refund: boolean | null
          created_at: string | null
          created_by: string | null
          current_raise: number | null
          dividend_frequency: string | null
          expected_roi_annual: number | null
          id: string
          interest_rate: number | null
          investment_window_end: string
          investment_window_start: string
          investor_count: number | null
          loan_term_months: number | null
          ltv_ratio: number | null
          management_fee_percentage: number | null
          max_investment: number | null
          max_tokens_per_purchase: number | null
          min_investment: number
          min_tokens_per_purchase: number | null
          minimum_raise: number
          minted_at: string | null
          minting_transaction_id: string | null
          platform_fee_percentage: number | null
          price_per_token: number
          property_id: string | null
          revenue_share_percentage: number | null
          status: string | null
          target_raise: number | null
          token_id: string | null
          token_name: string | null
          token_symbol: string | null
          tokenization_type: string
          tokens_sold: number | null
          total_supply: number
          type_specific_terms: Json | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          auto_refund?: boolean | null
          created_at?: string | null
          created_by?: string | null
          current_raise?: number | null
          dividend_frequency?: string | null
          expected_roi_annual?: number | null
          id?: string
          interest_rate?: number | null
          investment_window_end: string
          investment_window_start: string
          investor_count?: number | null
          loan_term_months?: number | null
          ltv_ratio?: number | null
          management_fee_percentage?: number | null
          max_investment?: number | null
          max_tokens_per_purchase?: number | null
          min_investment: number
          min_tokens_per_purchase?: number | null
          minimum_raise: number
          minted_at?: string | null
          minting_transaction_id?: string | null
          platform_fee_percentage?: number | null
          price_per_token: number
          property_id?: string | null
          revenue_share_percentage?: number | null
          status?: string | null
          target_raise?: number | null
          token_id?: string | null
          token_name?: string | null
          token_symbol?: string | null
          tokenization_type?: string
          tokens_sold?: number | null
          total_supply: number
          type_specific_terms?: Json | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          auto_refund?: boolean | null
          created_at?: string | null
          created_by?: string | null
          current_raise?: number | null
          dividend_frequency?: string | null
          expected_roi_annual?: number | null
          id?: string
          interest_rate?: number | null
          investment_window_end?: string
          investment_window_start?: string
          investor_count?: number | null
          loan_term_months?: number | null
          ltv_ratio?: number | null
          management_fee_percentage?: number | null
          max_investment?: number | null
          max_tokens_per_purchase?: number | null
          min_investment?: number
          min_tokens_per_purchase?: number | null
          minimum_raise?: number
          minted_at?: string | null
          minting_transaction_id?: string | null
          platform_fee_percentage?: number | null
          price_per_token?: number
          property_id?: string | null
          revenue_share_percentage?: number | null
          status?: string | null
          target_raise?: number | null
          token_id?: string | null
          token_name?: string | null
          token_symbol?: string | null
          tokenization_type?: string
          tokens_sold?: number | null
          total_supply?: number
          type_specific_terms?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tokenizations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokenizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokenizations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          property_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_status: string | null
          annual_income: number | null
          auto_convert_to_usdc: boolean | null
          created_at: string | null
          daily_withdrawal_limit_ngn: number | null
          date_of_birth: string | null
          email: string
          email_verified_at: string | null
          first_name: string
          hedera_account_id: string | null
          id: string
          investment_experience: string | null
          kyc_level: string | null
          kyc_status: string | null
          last_name: string
          monthly_withdrawal_limit_ngn: number | null
          nationality: string | null
          occupation: string | null
          phone: string | null
          phone_verified_at: string | null
          referral_code: string | null
          referred_by: string | null
          state_of_residence: string | null
          updated_at: string | null
          usdc_associated: boolean | null
          wallet_type: string | null
        }
        Insert: {
          account_status?: string | null
          annual_income?: number | null
          auto_convert_to_usdc?: boolean | null
          created_at?: string | null
          daily_withdrawal_limit_ngn?: number | null
          date_of_birth?: string | null
          email: string
          email_verified_at?: string | null
          first_name: string
          hedera_account_id?: string | null
          id?: string
          investment_experience?: string | null
          kyc_level?: string | null
          kyc_status?: string | null
          last_name: string
          monthly_withdrawal_limit_ngn?: number | null
          nationality?: string | null
          occupation?: string | null
          phone?: string | null
          phone_verified_at?: string | null
          referral_code?: string | null
          referred_by?: string | null
          state_of_residence?: string | null
          updated_at?: string | null
          usdc_associated?: boolean | null
          wallet_type?: string | null
        }
        Update: {
          account_status?: string | null
          annual_income?: number | null
          auto_convert_to_usdc?: boolean | null
          created_at?: string | null
          daily_withdrawal_limit_ngn?: number | null
          date_of_birth?: string | null
          email?: string
          email_verified_at?: string | null
          first_name?: string
          hedera_account_id?: string | null
          id?: string
          investment_experience?: string | null
          kyc_level?: string | null
          kyc_status?: string | null
          last_name?: string
          monthly_withdrawal_limit_ngn?: number | null
          nationality?: string | null
          occupation?: string | null
          phone?: string | null
          phone_verified_at?: string | null
          referral_code?: string | null
          referred_by?: string | null
          state_of_residence?: string | null
          updated_at?: string | null
          usdc_associated?: boolean | null
          wallet_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          cast_at: string | null
          id: string
          proposal_id: string | null
          vote_choice: string
          vote_reason: string | null
          vote_transaction_id: string | null
          vote_weight: number | null
          voter_id: string | null
          voting_power: number
        }
        Insert: {
          cast_at?: string | null
          id?: string
          proposal_id?: string | null
          vote_choice: string
          vote_reason?: string | null
          vote_transaction_id?: string | null
          vote_weight?: number | null
          voter_id?: string | null
          voting_power: number
        }
        Update: {
          cast_at?: string | null
          id?: string
          proposal_id?: string | null
          vote_choice?: string
          vote_reason?: string | null
          vote_transaction_id?: string | null
          vote_weight?: number | null
          voter_id?: string | null
          voting_power?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "governance_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          backup_completed: boolean | null
          balance_hbar: number | null
          balance_ngn: number | null
          balance_usd: number | null
          balance_usdc: number | null
          created_at: string | null
          hedera_account_id: string | null
          id: string
          is_primary: boolean | null
          last_sync_at: string | null
          private_key_encrypted: string | null
          public_key: string | null
          security_level: string | null
          updated_at: string | null
          usdc_token_association_tx: string | null
          user_id: string | null
          wallet_name: string | null
          wallet_type: string
        }
        Insert: {
          backup_completed?: boolean | null
          balance_hbar?: number | null
          balance_ngn?: number | null
          balance_usd?: number | null
          balance_usdc?: number | null
          created_at?: string | null
          hedera_account_id?: string | null
          id?: string
          is_primary?: boolean | null
          last_sync_at?: string | null
          private_key_encrypted?: string | null
          public_key?: string | null
          security_level?: string | null
          updated_at?: string | null
          usdc_token_association_tx?: string | null
          user_id?: string | null
          wallet_name?: string | null
          wallet_type: string
        }
        Update: {
          backup_completed?: boolean | null
          balance_hbar?: number | null
          balance_ngn?: number | null
          balance_usd?: number | null
          balance_usdc?: number | null
          created_at?: string | null
          hedera_account_id?: string | null
          id?: string
          is_primary?: boolean | null
          last_sync_at?: string | null
          private_key_encrypted?: string | null
          public_key?: string | null
          security_level?: string | null
          updated_at?: string | null
          usdc_token_association_tx?: string | null
          user_id?: string | null
          wallet_name?: string | null
          wallet_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          amount_ngn: number
          amount_usd: number | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_code: string | null
          bank_name: string | null
          created_at: string | null
          failure_reason: string | null
          hedera_transaction_id: string | null
          id: string
          net_amount_ngn: number | null
          processed_at: string | null
          processed_by: string | null
          processing_fee_ngn: number | null
          recipient_hedera_account: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          wallet_id: string
          withdrawal_method: string
        }
        Insert: {
          amount_ngn: number
          amount_usd?: number | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_code?: string | null
          bank_name?: string | null
          created_at?: string | null
          failure_reason?: string | null
          hedera_transaction_id?: string | null
          id?: string
          net_amount_ngn?: number | null
          processed_at?: string | null
          processed_by?: string | null
          processing_fee_ngn?: number | null
          recipient_hedera_account?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          wallet_id: string
          withdrawal_method: string
        }
        Update: {
          amount_ngn?: number
          amount_usd?: number | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_code?: string | null
          bank_name?: string | null
          created_at?: string | null
          failure_reason?: string | null
          hedera_transaction_id?: string | null
          id?: string
          net_amount_ngn?: number | null
          processed_at?: string | null
          processed_by?: string | null
          processing_fee_ngn?: number | null
          recipient_hedera_account?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_id?: string
          withdrawal_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_requests_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      cron_job_status: {
        Row: {
          active: boolean | null
          command: string | null
          database: string | null
          jobid: number | null
          jobname: string | null
          nodename: string | null
          nodeport: number | null
          schedule: string | null
          username: string | null
        }
        Insert: {
          active?: boolean | null
          command?: string | null
          database?: string | null
          jobid?: number | null
          jobname?: string | null
          nodename?: string | null
          nodeport?: number | null
          schedule?: string | null
          username?: string | null
        }
        Update: {
          active?: boolean | null
          command?: string | null
          database?: string | null
          jobid?: number | null
          jobname?: string | null
          nodename?: string | null
          nodeport?: number | null
          schedule?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_chat_rooms_with_last_message: {
        Row: {
          joined_at: string | null
          last_message: string | null
          last_message_at: string | null
          last_message_type: string | null
          last_seen_at: string | null
          last_sender_first_name: string | null
          last_sender_last_name: string | null
          property_location: Json | null
          property_title: string | null
          role: string | null
          room_description: string | null
          room_id: string | null
          room_name: string | null
          room_type: string | null
          token_symbol: string | null
          tokenization_status: string | null
          unread_count: number | null
          user_id: string | null
          voting_power: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_user_to_chat_room: {
        Args: { p_room_id: string; p_user_id: string; p_voting_power?: number }
        Returns: undefined
      }
      cast_vote: {
        Args: {
          p_proposal_id: string
          p_vote_choice: string
          p_voter_id: string
          p_voting_power: number
        }
        Returns: Json
      }
      cleanup_expired_kyc_drafts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_token_reservations: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_chat_room_for_tokenization: {
        Args: { p_tokenization_id: string }
        Returns: string
      }
      create_governance_proposal: {
        Args: {
          p_budget_ngn: number
          p_description: string
          p_property_id: string
          p_proposal_type: string
          p_proposer_id: string
          p_title: string
          p_tokenization_id: string
          p_voting_period_days?: number
        }
        Returns: string
      }
      create_investment_with_reservation: {
        Args: {
          p_amount_ngn: number
          p_investor_id: string
          p_reservation_minutes?: number
          p_tokenization_id: string
          p_tokens_requested: number
        }
        Returns: Json
      }
      get_user_voting_power: {
        Args: { p_property_id: string; p_user_id: string }
        Returns: number
      }
      increment_tokenization_raise: {
        Args: { p_investment_id: string }
        Returns: undefined
      }
      reserve_tokens_with_timeout: {
        Args: {
          p_investment_id: string
          p_tokenization_id: string
          p_tokens_requested: number
        }
        Returns: Json
      }
      upsert_token_holdings: {
        Args: {
          p_amount_invested: number
          p_property_id: string
          p_token_id: string
          p_tokenization_id: string
          p_tokens_to_add: number
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      investment_phase:
        | "reservation"
        | "confirmed"
        | "minted"
        | "distributed"
        | "refunded"
        | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      investment_phase: [
        "reservation",
        "confirmed",
        "minted",
        "distributed",
        "refunded",
        "failed",
      ],
    },
  },
} as const
