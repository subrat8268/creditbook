-- =============================================================================
-- CreditBook App - Full Database Schema
-- Version: 1.6
-- Last Updated: March 1, 2026
-- 
-- Run this entire file in your Supabase SQL Editor to set up or reset the DB.
-- For incremental migrations on an existing DB, see the ALTER TABLE statements
-- at the very bottom of this file.
-- =============================================================================


-- =============================================================================
-- TABLES
-- =============================================================================

-- Profiles table (extends Supabase auth.users 1-to-1)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT,

  -- Business details
  business_name TEXT,
  business_address TEXT,
  gstin TEXT,
  upi_id TEXT,

  -- Bank details (mandatory for Indian billing — displayed on every invoice)
  bank_name TEXT NOT NULL DEFAULT '',
  account_number TEXT NOT NULL DEFAULT '',
  ifsc_code TEXT NOT NULL DEFAULT '',

  -- Bill settings
  bill_number_prefix TEXT DEFAULT 'INV',   -- e.g. INV, BILL, CB → INV-001, BILL-001

  -- Images
  avatar_url TEXT,
  business_logo_url TEXT,

  -- Subscription details
  subscription_plan TEXT DEFAULT 'free',
  subscription_expiry TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  base_price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  variant_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------

-- Orders table (with all Indian billing enhancements)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,

  -- Sequential bill number (unique per vendor, supports custom prefix)
  bill_number TEXT NOT NULL,

  -- Financial details
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,   -- itemsTotal + tax + loadingCharge
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(10,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,

  -- Indian billing specific fields
  previous_balance NUMERIC(10,2) NOT NULL DEFAULT 0,  -- customer's outstanding at order time
  loading_charge NUMERIC(10,2) NOT NULL DEFAULT 0,    -- transport/delivery (not taxed)
  tax_percent NUMERIC(5,2) NOT NULL DEFAULT 0,        -- GST % applied to items only

  -- Status
  status TEXT NOT NULL CHECK (status IN ('Paid', 'Pending', 'Partially Paid')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Bill numbers must be unique per vendor
  UNIQUE(vendor_id, bill_number)
);

-- -----------------------------------------------------------------------------

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal NUMERIC(10,2) GENERATED ALWAYS AS (price * quantity) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('Cash', 'UPI', 'NEFT', 'Draft', 'Cheque')),
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_customers_vendor     ON customers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone      ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_products_vendor      ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor        ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer      ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order    ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order       ON payments(order_id);


-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments       ENABLE ROW LEVEL SECURITY;

-- ------------ profiles -------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ------------ customers ------------------------------------------------------
DROP POLICY IF EXISTS "Vendors can view own customers"   ON customers;
DROP POLICY IF EXISTS "Vendors can insert own customers" ON customers;
DROP POLICY IF EXISTS "Vendors can update own customers" ON customers;
DROP POLICY IF EXISTS "Vendors can delete own customers" ON customers;

CREATE POLICY "Vendors can view own customers"   ON customers FOR SELECT USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can insert own customers" ON customers FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can update own customers" ON customers FOR UPDATE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can delete own customers" ON customers FOR DELETE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ products -------------------------------------------------------
DROP POLICY IF EXISTS "Vendors can view own products"   ON products;
DROP POLICY IF EXISTS "Vendors can insert own products" ON products;
DROP POLICY IF EXISTS "Vendors can update own products" ON products;
DROP POLICY IF EXISTS "Vendors can delete own products" ON products;

CREATE POLICY "Vendors can view own products"   ON products FOR SELECT USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can insert own products" ON products FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can update own products" ON products FOR UPDATE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can delete own products" ON products FOR DELETE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ product_variants -----------------------------------------------
DROP POLICY IF EXISTS "Vendors can view own variants"   ON product_variants;
DROP POLICY IF EXISTS "Vendors can insert own variants" ON product_variants;
DROP POLICY IF EXISTS "Vendors can update own variants" ON product_variants;
DROP POLICY IF EXISTS "Vendors can delete own variants" ON product_variants;

CREATE POLICY "Vendors can view own variants"   ON product_variants FOR SELECT USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can insert own variants" ON product_variants FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can update own variants" ON product_variants FOR UPDATE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can delete own variants" ON product_variants FOR DELETE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ orders ---------------------------------------------------------
DROP POLICY IF EXISTS "Vendors can view own orders"   ON orders;
DROP POLICY IF EXISTS "Vendors can insert own orders" ON orders;
DROP POLICY IF EXISTS "Vendors can update own orders" ON orders;
DROP POLICY IF EXISTS "Vendors can delete own orders" ON orders;

CREATE POLICY "Vendors can view own orders"   ON orders FOR SELECT USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can insert own orders" ON orders FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can update own orders" ON orders FOR UPDATE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can delete own orders" ON orders FOR DELETE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ order_items ----------------------------------------------------
DROP POLICY IF EXISTS "Vendors can view own order items"   ON order_items;
DROP POLICY IF EXISTS "Vendors can insert own order items" ON order_items;
DROP POLICY IF EXISTS "Vendors can update own order items" ON order_items;
DROP POLICY IF EXISTS "Vendors can delete own order items" ON order_items;

CREATE POLICY "Vendors can view own order items"   ON order_items FOR SELECT USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can insert own order items" ON order_items FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can update own order items" ON order_items FOR UPDATE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can delete own order items" ON order_items FOR DELETE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ payments -------------------------------------------------------
DROP POLICY IF EXISTS "Vendors can view own payments"   ON payments;
DROP POLICY IF EXISTS "Vendors can insert own payments" ON payments;
DROP POLICY IF EXISTS "Vendors can update own payments" ON payments;
DROP POLICY IF EXISTS "Vendors can delete own payments" ON payments;

CREATE POLICY "Vendors can view own payments"   ON payments FOR SELECT USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can insert own payments" ON payments FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can update own payments" ON payments FOR UPDATE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can delete own payments" ON payments FOR DELETE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));


-- =============================================================================
-- SQL FUNCTIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- get_next_bill_number
--   Returns the next sequential bill number for a vendor using a given prefix.
--   Examples: INV-001, INV-002 / BILL-001 / CB-001
--   Different prefixes count independently (INV-003 and BILL-001 can coexist).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_next_bill_number(
  vendor_uuid UUID,
  prefix TEXT DEFAULT 'INV'
)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  bill_num TEXT;
  prefix_offset INTEGER;
BEGIN
  -- prefix_offset: skip "PREFIX-" to reach the numeric part (1-based SUBSTRING)
  prefix_offset := LENGTH(prefix) + 2;

  -- Find the highest existing number for this vendor + prefix combination
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(bill_number FROM prefix_offset) AS INTEGER)),
    0
  ) INTO next_num
  FROM orders
  WHERE vendor_id = vendor_uuid
    AND bill_number ~ ('^' || prefix || '-[0-9]+$');

  -- Increment and zero-pad to at least 3 digits (INV-001, INV-042, INV-1000)
  next_num := next_num + 1;
  bill_num  := prefix || '-' || LPAD(next_num::TEXT, 3, '0');

  RETURN bill_num;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- get_customer_previous_balance
--   Returns the total outstanding balance across ALL orders for a customer.
--   Used when creating a new order to show the seller what the customer owes.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_customer_previous_balance(
  customer_uuid UUID,
  vendor_uuid UUID
)
RETURNS NUMERIC AS $$
DECLARE
  prev_balance NUMERIC;
BEGIN
  SELECT COALESCE(SUM(total_amount - amount_paid), 0)
  INTO prev_balance
  FROM orders
  WHERE customer_id = customer_uuid
    AND vendor_id   = vendor_uuid;

  RETURN prev_balance;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- INCREMENTAL MIGRATIONS
-- Run these ALTER TABLE statements if the DB already exists and you are 
-- applying v1.1 → v1.4 enhancements without a full reset.
-- =============================================================================

-- v1.1 — Indian billing fields on orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bill_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS previous_balance NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loading_charge NUMERIC(10,2) NOT NULL DEFAULT 0;

-- v1.1 — Bank details on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_name TEXT NOT NULL DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_number TEXT NOT NULL DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ifsc_code TEXT NOT NULL DEFAULT '';

-- v1.4 — Tax/GST support on orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_percent NUMERIC(5,2) NOT NULL DEFAULT 0;

-- v1.4 — Custom bill number prefix on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bill_number_prefix TEXT DEFAULT 'INV';

-- v1.5 — Expand payment_mode to Cash, UPI, NEFT, Draft, Cheque
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_mode_check;
UPDATE payments SET payment_mode = 'UPI' WHERE payment_mode = 'Online';
ALTER TABLE payments ADD CONSTRAINT payments_payment_mode_check
  CHECK (payment_mode IN ('Cash', 'UPI', 'NEFT', 'Draft', 'Cheque'));

-- =============================================================================
-- v1.7 — SUPPLIER / DISTRIBUTOR SYSTEM
-- New tables: suppliers, supplier_deliveries, supplier_delivery_items,
--             payments_made (payments from vendor to supplier)
-- =============================================================================

-- Suppliers master table
CREATE TABLE IF NOT EXISTS suppliers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  phone            TEXT,
  address          TEXT,
  basket_mark      TEXT,
  bank_name        TEXT,
  account_number   TEXT,
  ifsc_code        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supplier deliveries (goods received from supplier)
CREATE TABLE IF NOT EXISTS supplier_deliveries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  supplier_id      UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  delivery_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  loading_charge   NUMERIC(10,2) NOT NULL DEFAULT 0,
  advance_paid     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual line items in a delivery
CREATE TABLE IF NOT EXISTS supplier_delivery_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id      UUID NOT NULL REFERENCES supplier_deliveries(id) ON DELETE CASCADE,
  vendor_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_name        TEXT NOT NULL,
  quantity         NUMERIC(10,3) NOT NULL DEFAULT 0,
  rate             NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal         NUMERIC(10,2) GENERATED ALWAYS AS (quantity * rate) STORED,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments made by vendor to supplier
CREATE TABLE IF NOT EXISTS payments_made (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  supplier_id      UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  delivery_id      UUID REFERENCES supplier_deliveries(id) ON DELETE SET NULL,
  amount           NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  payment_mode     TEXT NOT NULL DEFAULT 'Cash'
                     CHECK (payment_mode IN ('Cash', 'UPI', 'NEFT', 'Draft', 'Cheque')),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Row Level Security for supplier tables
-- -----------------------------------------------------------------------------

ALTER TABLE suppliers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_deliveries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_made        ENABLE ROW LEVEL SECURITY;

-- suppliers
DROP POLICY IF EXISTS "Vendors manage own suppliers" ON suppliers;
CREATE POLICY "Vendors manage own suppliers" ON suppliers
  FOR ALL USING (vendor_id = auth.uid()) WITH CHECK (vendor_id = auth.uid());

-- supplier_deliveries
DROP POLICY IF EXISTS "Vendors manage own deliveries" ON supplier_deliveries;
CREATE POLICY "Vendors manage own deliveries" ON supplier_deliveries
  FOR ALL USING (vendor_id = auth.uid()) WITH CHECK (vendor_id = auth.uid());

-- supplier_delivery_items
DROP POLICY IF EXISTS "Vendors manage own delivery items" ON supplier_delivery_items;
CREATE POLICY "Vendors manage own delivery items" ON supplier_delivery_items
  FOR ALL USING (vendor_id = auth.uid()) WITH CHECK (vendor_id = auth.uid());

-- payments_made
DROP POLICY IF EXISTS "Vendors manage own payments made" ON payments_made;
CREATE POLICY "Vendors manage own payments made" ON payments_made
  FOR ALL USING (vendor_id = auth.uid()) WITH CHECK (vendor_id = auth.uid());
