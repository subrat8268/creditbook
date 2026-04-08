-- =============================================================================
-- Migration: Create Compatibility Views (Optional)
-- Date: April 8, 2026
-- Phase: 2 - Clean Architecture
-- 
-- Purpose: Create views that mimic old customers/suppliers tables for backward compatibility
-- 
-- Use Case: Allows gradual frontend migration
--   - Old code can query customers_view/suppliers_view
--   - New code queries parties table directly
--   - Both work simultaneously during transition period
-- 
-- Safety: Views are read-only, additive (doesn't break anything)
-- =============================================================================

-- View that mimics old customers table
CREATE OR REPLACE VIEW customers_view AS
SELECT 
  id,
  vendor_id,
  name,
  phone,
  address,
  created_at
FROM parties
WHERE is_customer = TRUE;

COMMENT ON VIEW customers_view IS 
  'Backward-compatible view of parties table (customers only). Use parties table directly in new code.';

-- View that mimics old suppliers table
CREATE OR REPLACE VIEW suppliers_view AS
SELECT 
  id,
  vendor_id,
  name,
  phone,
  address,
  basket_mark,
  bank_name,
  account_number,
  ifsc_code,
  upi_id,
  created_at
FROM parties
WHERE is_supplier = TRUE;

COMMENT ON VIEW suppliers_view IS 
  'Backward-compatible view of parties table (suppliers only). Use parties table directly in new code.';

-- Log completion
DO $$
DECLARE
  customer_view_count INTEGER;
  supplier_view_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO customer_view_count FROM customers_view;
  SELECT COUNT(*) INTO supplier_view_count FROM suppliers_view;
  
  RAISE NOTICE '=== COMPATIBILITY VIEWS CREATED ===';
  RAISE NOTICE 'customers_view: % records', customer_view_count;
  RAISE NOTICE 'suppliers_view: % records', supplier_view_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Frontend can now use either:';
  RAISE NOTICE '  - SELECT * FROM customers_view (old way)';
  RAISE NOTICE '  - SELECT * FROM parties WHERE is_customer=true (new way)';
END $$;
