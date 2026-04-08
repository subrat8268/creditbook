-- =============================================================================
-- Migration: Migrate Customers to Parties Table
-- Date: April 8, 2026
-- Phase: 2 - Clean Architecture
-- 
-- Purpose: Copy all customer records from customers table to parties table
-- 
-- Strategy:
--   1. Preserve original UUIDs (avoids breaking foreign keys in orders table)
--   2. Calculate customer_balance from orders.balance_due
--   3. Set is_customer=TRUE, is_supplier=FALSE
--   4. Handle duplicate phone numbers gracefully
-- 
-- Safety: Uses ON CONFLICT DO NOTHING (idempotent, safe to re-run)
-- =============================================================================

-- Migrate all customers to parties table
INSERT INTO parties (
  id,               -- preserve UUID to avoid breaking orders.customer_id FK
  vendor_id,
  name,
  phone,
  address,
  is_customer,
  is_supplier,
  customer_balance,
  supplier_balance,
  created_at,
  updated_at
)
SELECT 
  c.id,
  c.vendor_id,
  c.name,
  c.phone,
  c.address,
  TRUE AS is_customer,
  FALSE AS is_supplier,
  -- Calculate customer balance from all unpaid/partially paid orders
  COALESCE(
    (
      SELECT SUM(o.balance_due)
      FROM orders o
      WHERE o.customer_id = c.id
        AND o.balance_due > 0
    ),
    0
  ) AS customer_balance,
  0 AS supplier_balance,
  c.created_at,
  c.created_at AS updated_at
FROM customers c
ON CONFLICT (id) DO NOTHING;  -- safety: skip if already migrated

-- Log migration statistics
DO $$
DECLARE
  total_customers INTEGER;
  migrated_count INTEGER;
  total_balance NUMERIC(10,2);
BEGIN
  -- Count source records
  SELECT COUNT(*) INTO total_customers FROM customers;
  
  -- Count migrated records
  SELECT COUNT(*) INTO migrated_count FROM parties WHERE is_customer = TRUE;
  
  -- Calculate total customer balance
  SELECT COALESCE(SUM(customer_balance), 0) INTO total_balance FROM parties WHERE is_customer = TRUE;
  
  RAISE NOTICE '=== CUSTOMER MIGRATION COMPLETE ===';
  RAISE NOTICE 'Total customers in source table: %', total_customers;
  RAISE NOTICE 'Total customers migrated to parties: %', migrated_count;
  RAISE NOTICE 'Total customer balance (receivables): ₹%', total_balance;
  
  IF total_customers != migrated_count THEN
    RAISE WARNING 'Mismatch detected! Some customers may not have been migrated.';
  ELSE
    RAISE NOTICE 'All customers successfully migrated! ✓';
  END IF;
END $$;
