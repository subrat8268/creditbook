-- =============================================================================
-- KredBook — Schema Hardening & Performance Optimization
-- Migration: 20260409_schema_hardening
-- Date: April 9, 2026
-- =============================================================================

-- 1. Orders Status Hardening: 'Unpaid' -> 'Pending'
-- Migrate existing data
UPDATE public.orders SET status = 'Pending' WHERE status = 'Unpaid';

-- Update Default Value
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'Pending';

-- Update Check Constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('Pending', 'Partially Paid', 'Paid'));

-- 2. Performance Indexes
-- Orders: Filtered index for active debts
CREATE INDEX IF NOT EXISTS idx_orders_vendor_balance_due ON public.orders(vendor_id, balance_due) WHERE (balance_due > 0);

-- Order Items: Ensure foreign key index
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- Payments: Speed up order and vendor lookups
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_vendor ON public.payments(vendor_id);

-- 3. Storage Security Hardening
-- Ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public Read Policy for shared ledgers and business branding
DROP POLICY IF EXISTS "Public read for public buckets" ON storage.objects;
CREATE POLICY "Public read for public buckets"
ON storage.objects FOR SELECT TO public
USING (bucket_id IN ('avatars', 'business-logos'));

-- Refresh Authenticated Read Policies (Optional redundancy)
DROP POLICY IF EXISTS "Avatars read" ON storage.objects;
CREATE POLICY "Avatars read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Business logos read" ON storage.objects;
CREATE POLICY "Business logos read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'business-logos');

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '=== SCHEMA HARDENING COMPLETE ===';
  RAISE NOTICE 'Orders status: Unpaid -> Pending';
  RAISE NOTICE 'Performance indexes: Added for orders, items, and payments';
  RAISE NOTICE 'Storage: Public read policy enabled for avatars and business-logos';
END $$;
