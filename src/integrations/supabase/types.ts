export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          restaurant_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          restaurant_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          restaurant_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          is_active: boolean | null
          is_base_currency: boolean | null
          name: string
          symbol: string
        }
        Insert: {
          code: string
          is_active?: boolean | null
          is_base_currency?: boolean | null
          name: string
          symbol: string
        }
        Update: {
          code?: string
          is_active?: boolean | null
          is_base_currency?: boolean | null
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          is_active: boolean | null
          is_primary: boolean | null
          name: string
          native_name: string
        }
        Insert: {
          code: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name: string
          native_name: string
        }
        Update: {
          code?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name?: string
          native_name?: string
        }
        Relationships: []
      }
      restaurant_profile: {
        Row: {
          address: string | null
          banner_url: string | null
          created_at: string
          description: string | null
          email: string | null
          google_reviews_embed: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          social_media_links: Json | null
          updated_at: string
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          google_reviews_embed?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          social_media_links?: Json | null
          updated_at?: string
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          google_reviews_embed?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          social_media_links?: Json | null
          updated_at?: string
          working_hours?: Json | null
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string | null
          business_registration_country: string | null
          business_registration_number: string | null
          city: string | null
          connection_status: string | null
          country: string | null
          created_at: string
          id: string
          last_connected_at: string | null
          name: string
          owner_email: string
          owner_full_name: string
          owner_phone: string | null
          postal_code: string | null
          supabase_anon_key: string
          supabase_service_role_key: string | null
          supabase_url: string
          timezone: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          address?: string | null
          business_registration_country?: string | null
          business_registration_number?: string | null
          city?: string | null
          connection_status?: string | null
          country?: string | null
          created_at?: string
          id?: string
          last_connected_at?: string | null
          name: string
          owner_email: string
          owner_full_name: string
          owner_phone?: string | null
          postal_code?: string | null
          supabase_anon_key: string
          supabase_service_role_key?: string | null
          supabase_url: string
          timezone?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          address?: string | null
          business_registration_country?: string | null
          business_registration_number?: string | null
          city?: string | null
          connection_status?: string | null
          country?: string | null
          created_at?: string
          id?: string
          last_connected_at?: string | null
          name?: string
          owner_email?: string
          owner_full_name?: string
          owner_phone?: string | null
          postal_code?: string | null
          supabase_anon_key?: string
          supabase_service_role_key?: string | null
          supabase_url?: string
          timezone?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
