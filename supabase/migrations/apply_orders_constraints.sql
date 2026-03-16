-- =============================================================================
-- KredBook — Apply pending orders constraints + verify on_payment_upsert
-- Migration: apply_orders_constraints
-- Apply: Run in Supabase SQL Editor.
--
-- CONTAINS:
--   1. Duplicate-detection query (run manually FIRST — read instructions below)
--   2. Duplicate bill_number remediation helper (run only if step 1 finds rows)
--   3. orders_status_check  CHECK constraint
--   4. orders_vendor_bill_unique  UNIQUE constraint
--   5. on_payment_upsert trigger guard (creates trigger if missing)
--
-- =============================================================================
-- STEP 0 — RUN THIS QUERY FIRST IN A SEPARATE SQL EDITOR TAB.
--           Do NOT proceed to steps 1-5 if it returns any rows.
-- =============================================================================
--
-- SELECT vendor_id, bill_number, COUNT(*) AS cnt
-- FROM orders
-- WHERE bill_number IS NOT NULL
-- GROUP BY vendor_id, bill_number
-- HAVING COUNT(*) > 1;
--
-- If rows are returned, use this helper to inspect duplicates:
--
-- SELECT id, vendor_id, bill_number, created_at, status, total_amount
-- FROM   orders
-- WHERE  (vendor_id, bill_number) IN (
--   SELECT vendor_id, bill_number
--   FROM   orders
--   WHERE  bill_number IS NOT NULL
--   GROUP BY vendor_id, bill_number
--   HAVING COUNT(*) > 1
-- )
-- ORDER BY vendor_id, bill_number, created_at;
--
-- Remediation: keep the earliest row per (vendor_id, bill_number), NULL out the
-- bill_number on later duplicates so the UNIQUE constraint can be applied cleanly.
-- Run this UPDATE only after confirming the rows above are genuine duplicates:
--
-- UPDATE orders o
-- SET    bill_number = NULL
-- WHERE  id IN (
--   SELECT id FROM (
--     SELECT id,
--           ROW_NUMBER() OVER (
--             PARTITION BY vendor_id, bill_number
--             ORDER BY created_at ASC
--           ) AS rn
--     FROM   orders
--     WHERE  bill_number IS NOT NULL
--   ) ranked
--   WHERE rn > 1
-- );
--
-- =============================================================================
-- STEP 1 — orders_status_check
-- Allowed values: 'Unpaid' (DB default for new rows), 'Pending', 'Partially Paid', 'Paid'
-- NOTE: The API layer writes 'Pending' / 'Partially Paid' / 'Paid' only.
--       'Unpaid' is the column DEFAULT and may exist on older rows.
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   information_schema.table_constraints
    WHERE  constraint_name  = 'orders_status_check'
      AND  table_schema     = 'public'
      AND  table_name       = 'orders'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_status_check
      CHECK (status IN ('Unpaid', 'Pending', 'Partially Paid', 'Paid'));
  END IF;
END $$;

-- =============================================================================
-- STEP 2 — orders_vendor_bill_unique
-- UNIQUE(vendor_id, bill_number) — one bill number per vendor.
-- NULL bill_numbers are treated as distinct by Postgres and are not blocked.
-- PREREQUISITE: Run the duplicate-detection query above first.
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   information_schema.table_constraints
    WHERE  constraint_name  = 'orders_vendor_bill_unique'
      AND  table_schema     = 'public'
      AND  table_name       = 'orders'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_vendor_bill_unique
      UNIQUE (vendor_id, bill_number);
  END IF;
END $$;

-- =============================================================================
-- STEP 3 — Ensure on_payment_upsert trigger exists on public.payments
-- The trigger calls update_order_status() which recalculates amount_paid and
-- status on the parent order row after any INSERT or UPDATE on payments.
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   information_schema.triggers
    WHERE  trigger_name        = 'on_payment_upsert'
      AND  event_object_schema = 'public'
      AND  event_object_table  = 'payments'
  ) THEN
    EXECUTE '
      CREATE TRIGGER on_payment_upsert
        AFTER INSERT OR UPDATE ON public.payments
        FOR EACH ROW EXECUTE FUNCTION public.update_order_status()
    ';
  END IF;
END $$;
