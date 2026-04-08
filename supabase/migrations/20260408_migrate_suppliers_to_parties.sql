-- =============================================================================
-- Migration: Migrate Suppliers to Parties Table
-- Date: April 8, 2026
-- Phase: 2 - Clean Architecture
-- 
-- Purpose: Copy all supplier records from suppliers table to parties table
-- 
-- Strategy:
--   1. Preserve original UUIDs (avoids breaking FKs in supplier_deliveries, payments_made)
--   2. Calculate supplier_balance from deliveries and payments
--   3. Set is_customer=FALSE, is_supplier=TRUE
--   4. Copy supplier-specific fields (basket_mark, bank details)
--   5. Handle edge case: party might already exist as customer (merge scenario)
-- 
-- Safety: Handles duplicates by updating is_supplier flag if party already exists
-- =============================================================================

-- Migrate all suppliers to parties table
INSERT INTO parties (
  id,               -- preserve UUID to avoid breaking supplier_deliveries.supplier_id FK
  vendor_id,
  name,
  phone,
  address,
  is_customer,
  is_supplier,
  customer_balance,
  supplier_balance,
  basket_mark,
  bank_name,
  account_number,
  ifsc_code,
  upi_id,
  created_at,
  updated_at
)
SELECT 
  s.id,
  s.vendor_id,
  s.name,
  s.phone,
  s.address,
  FALSE AS is_customer,
  TRUE AS is_supplier,
  0 AS customer_balance,
  -- Calculate supplier balance (total deliveries - total payments made)
  COALESCE(
    (
      SELECT SUM(sd.total_amount)
      FROM supplier_deliveries sd
      WHERE sd.supplier_id = s.id
    ),
    0
  ) - COALESCE(
    (
      SELECT SUM(pm.amount)
      FROM payments_made pm
      WHERE pm.supplier_id = s.id
    ),
    0
  ) AS supplier_balance,
  s.basket_mark,
  s.bank_name,
  s.account_number,
  s.ifsc_code,
  s.upi AS upi_id,
  s.created_at,
  s.created_at AS updated_at
FROM suppliers s
ON CONFLICT (id) DO UPDATE SET
  -- If party already exists (edge case: same person is customer AND supplier)
  is_supplier = TRUE,
  supplier_balance = EXCLUDED.supplier_balance,
  basket_mark = EXCLUDED.basket_mark,
  bank_name = EXCLUDED.bank_name,
  account_number = EXCLUDED.account_number,
  ifsc_code = EXCLUDED.ifsc_code,
  upi_id = EXCLUDED.upi_id,
  updated_at = now();

-- Log migration statistics
DO $$
DECLARE
  total_suppliers INTEGER;
  migrated_count INTEGER;
  dual_role_count INTEGER;
  total_balance NUMERIC(10,2);
BEGIN
  -- Count source records
  SELECT COUNT(*) INTO total_suppliers FROM suppliers;
  
  -- Count migrated records
  SELECT COUNT(*) INTO migrated_count FROM parties WHERE is_supplier = TRUE;
  
  -- Count parties with BOTH roles (interesting edge case!)
  SELECT COUNT(*) INTO dual_role_count FROM parties WHERE is_customer = TRUE AND is_supplier = TRUE;
  
  -- Calculate total supplier balance (payables)
  SELECT COALESCE(SUM(supplier_balance), 0) INTO total_balance FROM parties WHERE is_supplier = TRUE;
  
  RAISE NOTICE '=== SUPPLIER MIGRATION COMPLETE ===';
  RAISE NOTICE 'Total suppliers in source table: %', total_suppliers;
  RAISE NOTICE 'Total suppliers migrated to parties: %', migrated_count;
  RAISE NOTICE 'Parties with BOTH customer & supplier roles: %', dual_role_count;
  RAISE NOTICE 'Total supplier balance (payables): ₹%', total_balance;
  
  IF total_suppliers != migrated_count THEN
    RAISE WARNING 'Mismatch detected! Some suppliers may not have been migrated.';
  ELSE
    RAISE NOTICE 'All suppliers successfully migrated! ✓';
  END IF;
  
  IF dual_role_count > 0 THEN
    RAISE NOTICE 'Found % parties that are BOTH customers AND suppliers! This is expected and handled correctly.', dual_role_count;
  END IF;
END $$;
