-- =============================================================================
-- KredBook — Normalize order status values
-- Migration: 20260409_normalize_order_status
-- =============================================================================

-- Convert legacy "Unpaid" to "Pending"
UPDATE public.orders
SET status = 'Pending'
WHERE status = 'Unpaid';

-- Update default + constraint to current status set
ALTER TABLE public.orders
  ALTER COLUMN status SET DEFAULT 'Pending';

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('Pending', 'Partially Paid', 'Paid'));
