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
      customers: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          phone: string
          vendor_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          phone: string
          vendor_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_vendor_id_fkey"
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
          product_id: string
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
          product_id: string
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
          product_id?: string
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
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
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
          id: string
          loading_charge: number
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
          id?: string
          loading_charge?: number
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
          id?: string
          loading_charge?: number
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
            referencedRelation: "customers"
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
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
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
      payments_made: {
        Row: {
          amount: number
          created_at: string
          delivery_id: string | null
          id: string
          notes: string | null
          payment_mode: string
          supplier_id: string
          vendor_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          delivery_id?: string | null
          id?: string
          notes?: string | null
          payment_mode?: string
          supplier_id: string
          vendor_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          delivery_id?: string | null
          id?: string
          notes?: string | null
          payment_mode?: string
          supplier_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_made_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "supplier_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_made_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_made_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string | null
          id: string
          price: number
          product_id: string
          variant_name: string
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          price: number
          product_id: string
          variant_name: string
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          price?: number
          product_id?: string
          variant_name?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number | null
          category: string
          created_at: string
          id: string
          image_url: string | null
          name: string
          variants: Json | null
          vendor_id: string
        }
        Insert: {
          base_price?: number | null
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          variants?: Json | null
          vendor_id: string
        }
        Update: {
          base_price?: number | null
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          variants?: Json | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
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
          dashboard_mode: string | null
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
          dashboard_mode?: string | null
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
          dashboard_mode?: string | null
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
      supplier_deliveries: {
        Row: {
          advance_paid: number
          created_at: string
          delivery_date: string
          id: string
          loading_charge: number
          notes: string | null
          supplier_id: string
          total_amount: number
          vendor_id: string
        }
        Insert: {
          advance_paid?: number
          created_at?: string
          delivery_date?: string
          id?: string
          loading_charge?: number
          notes?: string | null
          supplier_id: string
          total_amount?: number
          vendor_id: string
        }
        Update: {
          advance_paid?: number
          created_at?: string
          delivery_date?: string
          id?: string
          loading_charge?: number
          notes?: string | null
          supplier_id?: string
          total_amount?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_deliveries_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_deliveries_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_delivery_items: {
        Row: {
          created_at: string
          delivery_id: string
          id: string
          item_name: string
          quantity: number
          rate: number
          subtotal: number | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          delivery_id: string
          id?: string
          item_name: string
          quantity?: number
          rate?: number
          subtotal?: number | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          delivery_id?: string
          id?: string
          item_name?: string
          quantity?: number
          rate?: number
          subtotal?: number | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_delivery_items_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "supplier_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_delivery_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          account_number: string | null
          address: string | null
          bank_name: string | null
          basket_mark: string | null
          created_at: string
          id: string
          ifsc_code: string | null
          name: string
          phone: string | null
          upi: string | null
          vendor_id: string
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          basket_mark?: string | null
          created_at?: string
          id?: string
          ifsc_code?: string | null
          name: string
          phone?: string | null
          upi?: string | null
          vendor_id: string
        }
        Update: {
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          basket_mark?: string | null
          created_at?: string
          id?: string
          ifsc_code?: string | null
          name?: string
          phone?: string | null
          upi?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_customer_previous_balance: {
        Args: { customer_uuid: string; vendor_uuid: string }
        Returns: number
      }
      get_next_bill_number:
        | { Args: { vendor_uuid: string }; Returns: string }
        | { Args: { prefix?: string; vendor_uuid: string }; Returns: string }
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

