-- =============================================================================
-- Migration: Create Unified Parties Table
-- Date: April 8, 2026
-- Phase: 2 - Clean Architecture
-- 
-- Purpose: Replace separate customers/suppliers tables with unified parties table
-- 
-- Benefits:
--   1. Single source of truth for all business contacts
--   2. Supports parties that are both customer AND supplier
--   3. Cached balances for performance (no expensive aggregations)
--   4. Simpler queries and frontend code
-- 
-- Safety: This is an ADDITIVE migration (does not drop existing tables)
-- =============================================================================

-- Create parties table
CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic contact info
  name TEXT NOT NULL,
  phone TEXT,  -- nullable (supplier might not have phone)
  address TEXT,
  
  -- Relationship type (party can be customer, supplier, or BOTH!)
  is_customer BOOLEAN NOT NULL DEFAULT FALSE,
  is_supplier BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Cached balances for performance (updated via triggers)
  -- customer_balance: positive = party owes money to vendor (accounts receivable)
  -- supplier_balance: positive = vendor owes money to party (accounts payable)
  customer_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  supplier_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  
  -- Supplier-specific fields (NULL when is_supplier=false)
  basket_mark TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  upi_id TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT parties_at_least_one_role CHECK (is_customer = TRUE OR is_supplier = TRUE),
  CONSTRAINT parties_vendor_phone_unique UNIQUE (vendor_id, phone)
);

-- Indexes for performance
CREATE INDEX idx_parties_vendor ON parties(vendor_id);
CREATE INDEX idx_parties_customer ON parties(vendor_id) WHERE is_customer = TRUE;
CREATE INDEX idx_parties_supplier ON parties(vendor_id) WHERE is_supplier = TRUE;
CREATE INDEX idx_parties_phone ON parties(phone);
CREATE INDEX idx_parties_name ON parties(vendor_id, name);

-- Row Level Security
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can manage own parties" ON parties;
CREATE POLICY "Vendors can manage own parties" ON parties
  FOR ALL USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_parties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER parties_updated_at
  BEFORE UPDATE ON parties
  FOR EACH ROW
  EXECUTE FUNCTION update_parties_updated_at();

-- Add helpful comment
COMMENT ON TABLE parties IS 'Unified table for all business relationships (customers and suppliers). Replaces separate customers/suppliers tables.';
COMMENT ON COLUMN parties.is_customer IS 'TRUE if this party buys from the vendor (accounts receivable)';
COMMENT ON COLUMN parties.is_supplier IS 'TRUE if this party sells to the vendor (accounts payable)';
COMMENT ON COLUMN parties.customer_balance IS 'Amount party owes to vendor (positive = receivable)';
COMMENT ON COLUMN parties.supplier_balance IS 'Amount vendor owes to party (positive = payable)';
