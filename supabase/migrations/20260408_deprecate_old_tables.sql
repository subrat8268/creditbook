-- =============================================================================
-- Migration: Deprecate Old Tables (DO NOT DROP YET!)
-- Date: April 8, 2026
-- Phase: 2 - Clean Architecture
-- 
-- Purpose: Mark customers/suppliers tables as deprecated but keep as backup
-- 
-- Strategy:
--   - Add COMMENT annotations to warn developers
--   - Keep tables intact for Phase 2 safety
--   - Will drop in Phase 3 after confirming parties table works perfectly
-- 
-- Safety: No schema changes, comments only
-- =============================================================================

-- Mark customers table as deprecated
COMMENT ON TABLE customers IS 
  'DEPRECATED (Phase 2): Use parties table instead (WHERE is_customer=true). 
   This table is kept as backup during Phase 2 migration. 
   Will be dropped in Phase 3 after thorough testing.';

-- Mark suppliers table as deprecated
COMMENT ON TABLE suppliers IS 
  'DEPRECATED (Phase 2): Use parties table instead (WHERE is_supplier=true). 
   This table is kept as backup during Phase 2 migration. 
   Will be dropped in Phase 3 after thorough testing.';

-- Log deprecation notice
DO $$
DECLARE
  customers_count INTEGER;
  suppliers_count INTEGER;
  parties_customer_count INTEGER;
  parties_supplier_count INTEGER;
BEGIN
  -- Verify data integrity
  SELECT COUNT(*) INTO customers_count FROM customers;
  SELECT COUNT(*) INTO suppliers_count FROM suppliers;
  SELECT COUNT(*) INTO parties_customer_count FROM parties WHERE is_customer = TRUE;
  SELECT COUNT(*) INTO parties_supplier_count FROM parties WHERE is_supplier = TRUE;
  
  RAISE NOTICE '=== TABLES MARKED AS DEPRECATED ===';
  RAISE NOTICE '';
  RAISE NOTICE 'Data integrity verification:';
  RAISE NOTICE '  customers table: % records', customers_count;
  RAISE NOTICE '  parties (is_customer=true): % records', parties_customer_count;
  
  IF customers_count = parties_customer_count THEN
    RAISE NOTICE '  ✓ Customer counts match!';
  ELSE
    RAISE WARNING '  ✗ Customer counts do NOT match! Review migration.';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '  suppliers table: % records', suppliers_count;
  RAISE NOTICE '  parties (is_supplier=true): % records', parties_supplier_count;
  
  IF suppliers_count = parties_supplier_count THEN
    RAISE NOTICE '  ✓ Supplier counts match!';
  ELSE
    RAISE WARNING '  ✗ Supplier counts do NOT match! Review migration.';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Tables customers and suppliers are now DEPRECATED.';
  RAISE NOTICE 'They are kept as backup during Phase 2.';
  RAISE NOTICE 'Will be dropped in Phase 3 after successful migration verification.';
  RAISE NOTICE '';
  RAISE NOTICE 'To drop in Phase 3 (NOT NOW!):';
  RAISE NOTICE '  DROP TABLE customers CASCADE;';
  RAISE NOTICE '  DROP TABLE suppliers CASCADE;';
END $$;
