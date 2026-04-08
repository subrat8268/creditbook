-- =============================================================================
-- Migration: Add Order Edit Tracking
-- Date: April 8, 2026
-- Phase: 2 - Clean Architecture
-- 
-- Purpose: Allow bills/orders to be edited with audit trail
-- 
-- Changes:
--   1. Add edited_at column to track last edit timestamp
--   2. Add edit_count column to track number of edits
--   3. Create trigger to auto-update these fields on UPDATE
-- 
-- Safety: Additive migration, no data loss
-- =============================================================================

-- Add edit tracking columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS edit_count INTEGER NOT NULL DEFAULT 0;

-- Create trigger function to update edit tracking
CREATE OR REPLACE FUNCTION update_order_edit_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if actual data changed (not just timestamp updates)
  IF (
    OLD.customer_id IS DISTINCT FROM NEW.customer_id OR
    OLD.total_amount IS DISTINCT FROM NEW.total_amount OR
    OLD.amount_paid IS DISTINCT FROM NEW.amount_paid OR
    OLD.previous_balance IS DISTINCT FROM NEW.previous_balance OR
    OLD.loading_charge IS DISTINCT FROM NEW.loading_charge OR
    OLD.tax_percent IS DISTINCT FROM NEW.tax_percent OR
    OLD.status IS DISTINCT FROM NEW.status
  ) THEN
    NEW.edited_at = now();
    NEW.edit_count = OLD.edit_count + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS orders_edit_tracking ON orders;
CREATE TRIGGER orders_edit_tracking
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_edit_tracking();

-- Add helpful comments
COMMENT ON COLUMN orders.edited_at IS 'Timestamp of last edit (NULL if never edited)';
COMMENT ON COLUMN orders.edit_count IS 'Number of times this order has been edited (0 = never edited)';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '=== ORDER EDIT TRACKING ENABLED ===';
  RAISE NOTICE 'Added columns: edited_at, edit_count';
  RAISE NOTICE 'Created trigger: orders_edit_tracking';
  RAISE NOTICE 'Orders can now be edited with full audit trail';
END $$;
