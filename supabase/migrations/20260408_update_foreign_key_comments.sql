-- =============================================================================
-- Migration: Update Foreign Key Comments
-- Date: April 8, 2026
-- Phase: 2 - Clean Architecture
-- 
-- Purpose: Add documentation comments to clarify that foreign keys now point to parties table
-- 
-- Strategy:
--   - NO SCHEMA CHANGES (foreign keys still work because we preserved UUIDs)
--   - Add COMMENT annotations for developer clarity
--   - Document legacy table names for reference
-- 
-- Safety: Comments only, no data/schema changes
-- =============================================================================

-- Document that orders.customer_id now references parties table
COMMENT ON COLUMN orders.customer_id IS 
  'References parties.id (is_customer=true). Legacy: was customers.id before parties migration.';

-- Document that supplier_deliveries.supplier_id now references parties table
COMMENT ON COLUMN supplier_deliveries.supplier_id IS 
  'References parties.id (is_supplier=true). Legacy: was suppliers.id before parties migration.';

-- Document that payments_made.supplier_id now references parties table
COMMENT ON COLUMN payments_made.supplier_id IS 
  'References parties.id (is_supplier=true). Legacy: was suppliers.id before parties migration.';

-- Add helpful notices
DO $$
BEGIN
  RAISE NOTICE '=== FOREIGN KEY MIGRATION COMPLETE ===';
  RAISE NOTICE 'No schema changes required! All foreign keys still work because UUIDs were preserved.';
  RAISE NOTICE 'Added documentation comments to clarify new relationships.';
  RAISE NOTICE '';
  RAISE NOTICE 'Updated columns:';
  RAISE NOTICE '  - orders.customer_id → parties.id';
  RAISE NOTICE '  - supplier_deliveries.supplier_id → parties.id';
  RAISE NOTICE '  - payments_made.supplier_id → parties.id';
END $$;
