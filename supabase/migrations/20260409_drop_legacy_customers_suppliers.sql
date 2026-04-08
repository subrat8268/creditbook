-- =============================================================================
-- KredBook — Drop legacy tables and redirect foreign keys
-- Migration: 20260409_drop_legacy_customers_suppliers
-- Date: April 9, 2026
-- =============================================================================

-- 1. Redirect Foreign Keys to parties(id)
-- Orders
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE public.orders ADD CONSTRAINT orders_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES public.parties(id) ON DELETE CASCADE;

-- Access Tokens
ALTER TABLE public.access_tokens DROP CONSTRAINT IF EXISTS access_tokens_customer_id_fkey;
ALTER TABLE public.access_tokens ADD CONSTRAINT access_tokens_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES public.parties(id) ON DELETE CASCADE;

-- Supplier Deliveries
ALTER TABLE public.supplier_deliveries DROP CONSTRAINT IF EXISTS supplier_deliveries_supplier_id_fkey;
ALTER TABLE public.supplier_deliveries ADD CONSTRAINT supplier_deliveries_supplier_id_fkey 
  FOREIGN KEY (supplier_id) REFERENCES public.parties(id) ON DELETE CASCADE;

-- Payments Made
ALTER TABLE public.payments_made DROP CONSTRAINT IF EXISTS payments_made_supplier_id_fkey;
ALTER TABLE public.payments_made ADD CONSTRAINT payments_made_supplier_id_fkey 
  FOREIGN KEY (supplier_id) REFERENCES public.parties(id) ON DELETE CASCADE;

-- 2. Drop Legacy Views & Tables
DROP VIEW IF EXISTS public.customers_view;
DROP VIEW IF EXISTS public.suppliers_view;

DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;

-- Log Completion
DO $$
BEGIN
  RAISE NOTICE '=== LEGACY CLEANUP COMPLETE ===';
  RAISE NOTICE 'Foreign keys redirected to parties(id)';
  RAISE NOTICE 'Legacy customers and suppliers tables dropped';
END $$;
