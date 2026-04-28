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
      access_tokens: {
        Row: {
          access_count: number | null
          created_at: string | null
          customer_id: string
          expires_at: string | null
          id: string
          is_revoked: boolean | null
          last_accessed_at: string | null
          token: string
          vendor_id: string
        }
        Insert: {
          access_count?: number | null
          created_at?: string | null
          customer_id: string
          expires_at?: string | null
          id?: string
          is_revoked?: boolean | null
          last_accessed_at?: string | null
          token: string
          vendor_id: string
        }
        Update: {
          access_count?: number | null
          created_at?: string | null
          customer_id?: string
          expires_at?: string | null
          id?: string
          is_revoked?: boolean | null
          last_accessed_at?: string | null
          token?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_tokens_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_tokens_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_name: string
          quantity: number
          subtotal: number | null
          variant_id: string | null
          variant_name: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          product_name: string
          quantity: number
          subtotal?: number | null
          variant_id?: string | null
          variant_name?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          subtotal?: number | null
          variant_id?: string | null
          variant_name?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_paid: number
          balance_due: number | null
          bill_number: string | null
          created_at: string
          customer_id: string
          due_date: string | null
          edit_count: number
          edited_at: string | null
          id: string
          loading_charge: number
          note: string | null
          previous_balance: number
          status: string
          tax_percent: number
          total_amount: number
          vendor_id: string
        }
        Insert: {
          amount_paid?: number
          balance_due?: number | null
          bill_number?: string | null
          created_at?: string
          customer_id: string
          due_date?: string | null
          edit_count?: number
          edited_at?: string | null
          id?: string
          loading_charge?: number
          note?: string | null
          previous_balance?: number
          status?: string
          tax_percent?: number
          total_amount: number
          vendor_id: string
        }
        Update: {
          amount_paid?: number
          balance_due?: number | null
          bill_number?: string | null
          created_at?: string
          customer_id?: string
          due_date?: string | null
          edit_count?: number
          edited_at?: string | null
          id?: string
          loading_charge?: number
          note?: string | null
          previous_balance?: number
          status?: string
          tax_percent?: number
          total_amount?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          account_number: string | null
          address: string | null
          bank_name: string | null
          created_at: string
          customer_balance: number
          id: string
          ifsc_code: string | null
          is_customer: boolean
          name: string
          phone: string | null
          updated_at: string
          upi_id: string | null
          vendor_id: string
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          created_at?: string
          customer_balance?: number
          id?: string
          ifsc_code?: string | null
          is_customer?: boolean
          name: string
          phone?: string | null
          updated_at?: string
          upi_id?: string | null
          vendor_id: string
        }
        Update: {
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          created_at?: string
          customer_balance?: number
          id?: string
          ifsc_code?: string | null
          is_customer?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
          upi_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parties_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          id: string
          notes: string | null
          order_id: string
          payment_date: string
          payment_mode: string
          vendor_id: string
        }
        Insert: {
          amount: number
          id?: string
          notes?: string | null
          order_id: string
          payment_date?: string
          payment_mode?: string
          vendor_id: string
        }
        Update: {
          amount?: number
          id?: string
          notes?: string | null
          order_id?: string
          payment_date?: string
          payment_mode?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_vendor_fkey"
            columns: ["order_id", "vendor_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id", "vendor_id"]
          },
          {
            foreignKeyName: "payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_number: string
          avatar_url: string | null
          bank_name: string
          bill_number_prefix: string | null
          billing_address: string | null
          business_logo_url: string | null
          business_name: string | null
          created_at: string
          gstin: string | null
          id: string
          ifsc_code: string
          name: string
          onboarding_complete: boolean
          phone: string | null
          subscription_expiry: string | null
          subscription_plan: string | null
          upi_id: string | null
          user_id: string
        }
        Insert: {
          account_number?: string
          avatar_url?: string | null
          bank_name?: string
          bill_number_prefix?: string | null
          billing_address?: string | null
          business_logo_url?: string | null
          business_name?: string | null
          created_at?: string
          gstin?: string | null
          id?: string
          ifsc_code?: string
          name: string
          onboarding_complete?: boolean
          phone?: string | null
          subscription_expiry?: string | null
          subscription_plan?: string | null
          upi_id?: string | null
          user_id: string
        }
        Update: {
          account_number?: string
          avatar_url?: string | null
          bank_name?: string
          bill_number_prefix?: string | null
          billing_address?: string | null
          business_logo_url?: string | null
          business_name?: string | null
          created_at?: string
          gstin?: string | null
          id?: string
          ifsc_code?: string
          name?: string
          onboarding_complete?: boolean
          phone?: string | null
          subscription_expiry?: string | null
          subscription_plan?: string | null
          upi_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_link_customer_ledgers: {
        Args: { p_customer_id: string; p_phone: string }
        Returns: number
      }
      create_order_transaction: {
        Args: {
          p_amount_paid: number
          p_bill_prefix: string
          p_customer_id: string
          p_items: Json
          p_loading_charge: number
          p_payment_mode: string
          p_tax_percent: number
          p_vendor_id: string
        }
        Returns: Json
      }
      find_ledgers_by_phone: {
        Args: { p_phone: string }
        Returns: {
          access_token: string
          balance: number
          customer_id: string
          customer_name: string
          ledger_url: string
          vendor_business_name: string
          vendor_id: string
          vendor_name: string
        }[]
      }
      generate_access_token: { Args: never; Returns: string }
      get_customer_previous_balance: {
        Args: { customer_uuid: string; vendor_uuid: string }
        Returns: number
      }
      get_customer_statement: {
        Args: { p_customer_id: string }
        Returns: {
          amount: number
          bill_number: string
          created_at: string
          id: string
          item_count: number
          order_bill_number: string
          payment_mode: string
          running_balance: number
          status: string
          type: string
        }[]
      }
      get_dashboard_summary: {
        Args: never
        Returns: {
          overdue_customers_count: number
          top_overdue_customers: Json
          total_customers_count: number
          total_entries_count: number
          total_outstanding: number
          total_overdue: number
        }[]
      }
      get_ledger_by_token: {
        Args: { p_token: string }
        Returns: {
          current_balance: number
          customer_address: string
          customer_name: string
          customer_phone: string
          last_transaction_date: string
          total_payments: number
          total_sales: number
          transactions: Json
          vendor_address: string
          vendor_business_name: string
          vendor_gstin: string
          vendor_logo_url: string
          vendor_name: string
          vendor_phone: string
        }[]
      }
      get_next_bill_number:
        | { Args: { vendor_uuid: string }; Returns: string }
        | { Args: { prefix?: string; vendor_uuid: string }; Returns: string }
      get_or_create_access_token: {
        Args: { p_customer_id: string; p_vendor_id: string }
        Returns: string
      }
      track_token_access: { Args: { p_token: string }; Returns: undefined }
      update_order_transaction: {
        Args: {
          p_items: Json
          p_loading_charge: number
          p_order_id: string
          p_quick_amount: number
          p_tax_percent: number
          p_vendor_id: string
        }
        Returns: Json
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
