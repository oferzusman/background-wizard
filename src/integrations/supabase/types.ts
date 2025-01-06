export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      file_history: {
        Row: {
          file_type: string
          file_url: string | null
          id: string
          is_url: boolean | null
          original_filename: string | null
          status: string | null
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          file_type: string
          file_url?: string | null
          id?: string
          is_url?: boolean | null
          original_filename?: string | null
          status?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          file_type?: string
          file_url?: string | null
          id?: string
          is_url?: boolean | null
          original_filename?: string | null
          status?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          file_content: Json | null
          file_type: string
          file_url: string | null
          id: string
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          file_content?: Json | null
          file_type: string
          file_url?: string | null
          id?: string
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          file_content?: Json | null
          file_type?: string
          file_url?: string | null
          id?: string
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      processed_images: {
        Row: {
          created_at: string | null
          id: string
          original_url: string
          processed_url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          original_url: string
          processed_url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          original_url?: string
          processed_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          link: string | null
          processed_image_url: string | null
          product_id: string | null
          product_type: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          image_url: string
          link?: string | null
          processed_image_url?: string | null
          product_id?: string | null
          product_type?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          link?: string | null
          processed_image_url?: string | null
          product_id?: string | null
          product_type?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "super_admin" | "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
