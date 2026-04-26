/**
 * Party types - Unified business relationship model
 * 
 * Replaces separate Customer and Supplier types
 */

export interface Party {
  id: string;
  vendor_id: string;
  
  // Basic info
  name: string;
  phone: string | null;
  address: string | null;
  
  // Relationship type
  is_customer: boolean;
  
  // Cached balances
  customer_balance: number;  // positive = they owe vendor
  
  // Supplier-specific fields
  basket_mark: string | null;
  bank_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  upi_id: string | null;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface PartyInsert {
  id?: string;
  vendor_id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  is_customer: boolean;
  customer_balance?: number;
  basket_mark?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  upi_id?: string | null;
}

export interface PartyUpdate {
  name?: string;
  phone?: string | null;
  address?: string | null;
  is_customer?: boolean;
  customer_balance?: number;
  basket_mark?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  upi_id?: string | null;
}

export type PartyType = 'customer' | 'all';
