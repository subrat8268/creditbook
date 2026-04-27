-- Drop legacy supplier/product tables.
--
-- Context:
-- These tables were legacy/transitional and are out of active product scope.
-- This migration is written defensively (IF EXISTS) so it can be applied safely
-- even if the tables were already removed manually in the Supabase SQL editor.

-- Step 1: Drop child tables first (respect FK hierarchy)
DROP TABLE IF EXISTS public.supplier_delivery_items;
DROP TABLE IF EXISTS public.payments_made;
DROP TABLE IF EXISTS public.supplier_deliveries;

-- Step 2: Drop product chain
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_variant_id_fkey;
DROP TABLE IF EXISTS public.product_variants;
DROP TABLE IF EXISTS public.products;

-- NOTE:
-- `public.order_items.product_id` / `public.order_items.variant_id` columns are
-- intentionally not dropped here; they remain nullable legacy columns.
