-- =============================================================================
-- KredBook App - Full Database Schema
-- Version: 1.9 (synced to live DB March 16, 2026)
-- Last Updated: March 16, 2026
--
-- SYNC NOTE: Schema verified against live Supabase introspection on March 16, 2026.
-- Diffs from v1.8 (local) vs live DB are documented in the INCREMENTAL MIGRATIONS
-- section at the bottom. Run this file only on a fresh DB; for live updates use
-- the ALTER statements in the INCREMENTAL MIGRATIONS section.
-- =============================================================================


-- =============================================================================
-- TABLES
-- =============================================================================

-- Profiles table (extends Supabase auth.users 1-to-1)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,                -- NOT NULL in live DB (no default — set by onboarding)
  phone TEXT UNIQUE,                 -- UNIQUE constraint (profiles_phone_unique) exists in live
  role TEXT DEFAULT 'vendor',
  dashboard_mode TEXT DEFAULT 'both'
    CHECK (dashboard_mode IN ('seller', 'distributor', 'both')),
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,

  -- Business details
  business_name TEXT,
  billing_address TEXT,              -- live column name is billing_address (not business_address)
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
  subscription_expiry DATE,          -- live type is DATE (not TIMESTAMPTZ)

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
  base_price NUMERIC(10,2),                -- nullable: NULL = variant-only product (no single base price)
  variants JSONB,                    -- live has this column (pos 6); legacy variant storage
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
  bill_number TEXT,                  -- nullable in live (added later via ALTER)

  -- Financial details
  total_amount NUMERIC(10,2) NOT NULL,   -- itemsTotal + tax + loadingCharge (no DEFAULT in live)
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(10,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,

  -- Indian billing specific fields
  previous_balance NUMERIC(10,2) NOT NULL DEFAULT 0,  -- customer's outstanding at order time
  loading_charge NUMERIC(10,2) NOT NULL DEFAULT 0,    -- transport/delivery (not taxed)
  tax_percent NUMERIC(5,2) NOT NULL DEFAULT 0,        -- GST % applied to items only

  -- Status: 'Unpaid' is the column default for new rows.
  -- CHECK constraint orders_status_check enforces the allowed value set.
  -- Applied via migration: apply_orders_constraints.sql
  status TEXT NOT NULL DEFAULT 'Unpaid',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Per-vendor bill number uniqueness (NULLs are allowed — Postgres treats them as distinct).
  -- Applied via migration: apply_orders_constraints.sql
  CONSTRAINT orders_status_check CHECK (status IN ('Unpaid', 'Pending', 'Partially Paid', 'Paid')),
  CONSTRAINT orders_vendor_bill_unique UNIQUE (vendor_id, bill_number)
);

-- -----------------------------------------------------------------------------

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,  -- NOT NULL in live; use ON DELETE RESTRICT
  product_name TEXT NOT NULL,
  variant_name TEXT,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),     -- CHECK (quantity > 0) exists in live
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
  payment_mode TEXT NOT NULL DEFAULT 'Cash'
    CHECK (payment_mode IN ('Cash', 'UPI', 'NEFT', 'Draft', 'Cheque')),
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  notes TEXT
  -- NOTE: created_at is NOT in the live DB (was in v1.8 schema.sql but never applied)
  -- To add it: ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
);


-- =============================================================================
-- INDEXES
-- =============================================================================

-- customers
CREATE INDEX IF NOT EXISTS idx_customers_vendor           ON customers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone               ON customers(phone);
-- customers_phone_idx (global UNIQUE on phone) has been dropped — it blocked legitimate
-- inserts where two vendors share a customer. See migration: drop_global_customers_phone_idx.sql
CREATE UNIQUE INDEX IF NOT EXISTS customers_vendor_phone_idx ON customers(vendor_id, phone); -- unique phone per vendor (correct constraint)

-- products
CREATE INDEX IF NOT EXISTS idx_products_vendor            ON products(vendor_id);
CREATE INDEX IF NOT EXISTS products_vendor_name_idx       ON products(vendor_id, name);  -- live: composite for name search

-- product_variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product   ON product_variants(product_id);

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_vendor              ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer            ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status              ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at          ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_vendor_customer_idx     ON orders(vendor_id, customer_id); -- live: composite for customer order lookup

-- order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order          ON order_items(order_id);
-- NOTE: live also has 'order_items_order_idx' (plain duplicate of above) — redundant, candidate for DROP

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_order             ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_vendor            ON payments(vendor_id);
-- NOTE: live also has 'payments_order_idx' (plain duplicate of idx_payments_order) — redundant, candidate for DROP

-- supplier domain (added March 8, 2026)
CREATE INDEX IF NOT EXISTS idx_supplier_deliveries_supplier ON supplier_deliveries(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payments_made_supplier       ON payments_made(supplier_id);



-- =============================================================================
-- MIGRATION HELPERS (run these if upgrading an existing database)
-- =============================================================================
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dashboard_mode TEXT;

-- =============================================================================
-- AUTO-CREATE PROFILE ON SIGN-UP TRIGGER
-- Creates a profiles row automatically whenever a new user is created in
-- auth.users. This makes signup work even when email confirmation is enabled.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, onboarding_complete)
  VALUES (NEW.id, '', FALSE)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- =============================================================================

ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments                ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_made           ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_deliveries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_delivery_items ENABLE ROW LEVEL SECURITY;

-- ------------ profiles -------------------------------------------------------
-- Drop all known names (including live duplicates) before (re)creating
DROP POLICY IF EXISTS "Users can view own profile"       ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"     ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile"     ON profiles;
DROP POLICY IF EXISTS "Allow phone lookup before login"  ON profiles;
DROP POLICY IF EXISTS "Vendors can view own profile"     ON profiles;
DROP POLICY IF EXISTS "Vendors can update own profile"   ON profiles;
DROP POLICY IF EXISTS "select_own_profile"               ON profiles;
DROP POLICY IF EXISTS "update_own_profile"               ON profiles;
DROP POLICY IF EXISTS "phone_lookup_before_login"        ON profiles;

CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
-- NOTE: The open "Allow phone lookup before login" SELECT USING (true) policy has been removed.
-- Phone OTP login is not used in this app. All three remaining policies are scoped to
-- auth.uid() = user_id and are safe.

-- ------------ customers ------------------------------------------------------
DROP POLICY IF EXISTS "Vendors can view own customers"   ON customers;
DROP POLICY IF EXISTS "Vendors can insert own customers" ON customers;
DROP POLICY IF EXISTS "Vendors can update own customers" ON customers;
DROP POLICY IF EXISTS "Vendors can delete own customers" ON customers;
DROP POLICY IF EXISTS "select_own_customers"             ON customers;
DROP POLICY IF EXISTS "insert_own_customers"             ON customers;
DROP POLICY IF EXISTS "update_own_customers"             ON customers;
DROP POLICY IF EXISTS "delete_own_customers"             ON customers;

CREATE POLICY "Vendors can view own customers"   ON customers FOR SELECT USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can insert own customers" ON customers FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can update own customers" ON customers FOR UPDATE USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can delete own customers" ON customers FOR DELETE USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ products -------------------------------------------------------
DROP POLICY IF EXISTS "Vendors can view own products"   ON products;
DROP POLICY IF EXISTS "Vendors can insert own products" ON products;
DROP POLICY IF EXISTS "Vendors can update own products" ON products;
DROP POLICY IF EXISTS "Vendors can delete own products" ON products;
DROP POLICY IF EXISTS "select_own_products"             ON products;
DROP POLICY IF EXISTS "insert_own_products"             ON products;
DROP POLICY IF EXISTS "update_own_products"             ON products;
DROP POLICY IF EXISTS "delete_own_products"             ON products;

CREATE POLICY "Vendors can view own products"   ON products FOR SELECT USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can insert own products" ON products FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can update own products" ON products FOR UPDATE USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can delete own products" ON products FOR DELETE USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ product_variants -----------------------------------------------
DROP POLICY IF EXISTS "Vendors can view own variants"           ON product_variants;
DROP POLICY IF EXISTS "Vendors can insert own variants"         ON product_variants;
DROP POLICY IF EXISTS "Vendors can update own variants"         ON product_variants;
DROP POLICY IF EXISTS "Vendors can delete own variants"         ON product_variants;
DROP POLICY IF EXISTS "Vendors can view own product variants"   ON product_variants;
DROP POLICY IF EXISTS "Vendors can insert own product variants" ON product_variants;
DROP POLICY IF EXISTS "Vendors can update own product variants" ON product_variants;
DROP POLICY IF EXISTS "Vendors can delete own product variants" ON product_variants;

CREATE POLICY "Vendors can view own product variants"   ON product_variants FOR SELECT USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can insert own product variants" ON product_variants FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can update own product variants" ON product_variants FOR UPDATE USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can delete own product variants" ON product_variants FOR DELETE USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ orders ---------------------------------------------------------
DROP POLICY IF EXISTS "Vendors can view own orders"   ON orders;
DROP POLICY IF EXISTS "Vendors can insert own orders" ON orders;
DROP POLICY IF EXISTS "Vendors can update own orders" ON orders;
DROP POLICY IF EXISTS "Vendors can delete own orders" ON orders;
DROP POLICY IF EXISTS "select_own_orders"             ON orders;
DROP POLICY IF EXISTS "insert_own_orders"             ON orders;
DROP POLICY IF EXISTS "update_own_orders"             ON orders;
DROP POLICY IF EXISTS "delete_own_orders"             ON orders;

CREATE POLICY "Vendors can view own orders"   ON orders FOR SELECT USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can insert own orders" ON orders FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can update own orders" ON orders FOR UPDATE USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can delete own orders" ON orders FOR DELETE USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ order_items ----------------------------------------------------
DROP POLICY IF EXISTS "Vendors can view own order items"   ON order_items;
DROP POLICY IF EXISTS "Vendors can insert own order items" ON order_items;
DROP POLICY IF EXISTS "Vendors can update own order items" ON order_items;
DROP POLICY IF EXISTS "Vendors can delete own order items" ON order_items;
DROP POLICY IF EXISTS "select_own_order_items"             ON order_items;
DROP POLICY IF EXISTS "insert_own_order_items"             ON order_items;
DROP POLICY IF EXISTS "update_own_order_items"             ON order_items;
DROP POLICY IF EXISTS "delete_own_order_items"             ON order_items;

CREATE POLICY "Vendors can view own order items"   ON order_items FOR SELECT USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can insert own order items" ON order_items FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can update own order items" ON order_items FOR UPDATE USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can delete own order items" ON order_items FOR DELETE USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ payments -------------------------------------------------------
DROP POLICY IF EXISTS "Vendors can view own payments"   ON payments;
DROP POLICY IF EXISTS "Vendors can insert own payments" ON payments;
DROP POLICY IF EXISTS "Vendors can update own payments" ON payments;
DROP POLICY IF EXISTS "Vendors can delete own payments" ON payments;
DROP POLICY IF EXISTS "select_own_payments"             ON payments;
DROP POLICY IF EXISTS "insert_own_payments"             ON payments;
DROP POLICY IF EXISTS "update_own_payments"             ON payments;
DROP POLICY IF EXISTS "delete_own_payments"             ON payments;

CREATE POLICY "Vendors can view own payments"   ON payments FOR SELECT USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can insert own payments" ON payments FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can update own payments" ON payments FOR UPDATE USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can delete own payments" ON payments FOR DELETE USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ payments_made --------------------------------------------------
DROP POLICY IF EXISTS "Vendors can manage own payments made" ON payments_made;
DROP POLICY IF EXISTS "Vendors manage own payments made"     ON payments_made;

CREATE POLICY "Vendors manage own payments made" ON payments_made FOR ALL
  USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ suppliers ------------------------------------------------------
DROP POLICY IF EXISTS "Vendors can manage own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Vendors manage own suppliers"     ON suppliers;

CREATE POLICY "Vendors manage own suppliers" ON suppliers FOR ALL
  USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ supplier_deliveries --------------------------------------------
DROP POLICY IF EXISTS "Vendors can manage own deliveries" ON supplier_deliveries;
DROP POLICY IF EXISTS "Vendors manage own deliveries"     ON supplier_deliveries;

CREATE POLICY "Vendors manage own deliveries" ON supplier_deliveries FOR ALL
  USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ supplier_delivery_items ----------------------------------------
DROP POLICY IF EXISTS "Vendors can manage own delivery items" ON supplier_delivery_items;
DROP POLICY IF EXISTS "Vendors manage own delivery items"     ON supplier_delivery_items;

CREATE POLICY "Vendors manage own delivery items" ON supplier_delivery_items FOR ALL
  USING      (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));


-- =============================================================================
-- SQL FUNCTIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- get_next_bill_number
--   Returns the next sequential bill number for a vendor using a given prefix.
--   Examples: INV-001, INV-002 / BILL-001 / CB-001
--   Different prefixes count independently (INV-003 and BILL-001 can coexist).
--   NOTE: The live DB also retains an older overload (hardcoded 'INV-' prefix)
--         which was superseded by this version. Both exist due to CREATE OR REPLACE.
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

-- -----------------------------------------------------------------------------
-- handle_new_user
--   Called by trigger on_auth_user_created (AFTER INSERT ON auth.users).
--   Auto-creates a profiles row for every new signup. Errors are swallowed
--   so an auth.users insert is never rolled back due to a profile failure.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
    BEGIN
    INSERT INTO public.profiles (user_id, name, onboarding_complete)
    VALUES (NEW.id, '', FALSE)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
    EXCEPTION
    -- Never let a profile-insert failure block auth.users creation.
    -- The app will create/fetch the profile row after login if needed.
    WHEN OTHERS THEN
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- link_user_profile
--   Called by trigger link_profile_after_signup (AFTER INSERT ON auth.users).
--   If a profile row with a matching phone already exists (pre-created by an
--   admin / invite flow) and has no user_id yet, this links the two rows.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION link_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET user_id = NEW.id
  WHERE phone = NEW.phone
    AND user_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- update_order_status
--   Recalculates amount_paid and status on the parent order whenever a payment
--   row is inserted or updated. Fires via trigger on public.payments.
--   NOTE: The corresponding trigger was not found in the live triggers query
--   (which only scanned auth.users triggers). If the trigger is missing from
--   live, create it with the statement in the INCREMENTAL MIGRATIONS section.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_order_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET amount_paid = (
        SELECT COALESCE(SUM(amount), 0)
        FROM payments
        WHERE order_id = NEW.order_id
      ),
      status = CASE
        WHEN (
          SELECT COALESCE(SUM(amount), 0)
          FROM payments
          WHERE order_id = NEW.order_id
        ) >= orders.total_amount THEN 'Paid'
        WHEN (
          SELECT COALESCE(SUM(amount), 0)
          FROM payments
          WHERE order_id = NEW.order_id
        ) > 0 THEN 'Partially Paid'
        ELSE 'Pending'
      END
  WHERE id = NEW.order_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-create a profile row whenever a new user signs up via Supabase Auth.
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Link a pre-existing profile (created by invite/admin) to a newly signed-up
-- auth.users row if the phone numbers match.
CREATE OR REPLACE TRIGGER link_profile_after_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION link_user_profile();

-- Recalculate parent order's amount_paid + status after any payment change.
-- Applied via migration: apply_orders_constraints.sql (includes existence guard).
CREATE OR REPLACE TRIGGER on_payment_upsert
  AFTER INSERT OR UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_order_status();


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

-- v1.8 — Dashboard mode preference on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dashboard_mode TEXT DEFAULT 'both'
  CHECK (dashboard_mode IN ('seller', 'distributor', 'both'));

-- v2.0 — Onboarding flow: new users start with false; existing rows set to true
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT false;
UPDATE profiles SET onboarding_complete = true WHERE created_at < NOW();

-- v2.4 — Auto-create profile trigger for self-signup
-- Run the handle_new_user function + trigger block above if not already applied.

-- v3.0 — March 8-9, 2026 fixes (run in Supabase SQL Editor)
-- Fix stale dashboard_mode values written by old role screen:
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_dashboard_mode_check;
UPDATE profiles SET dashboard_mode = 'seller'      WHERE dashboard_mode IN ('vendor', 'retailer', 'user');
UPDATE profiles SET dashboard_mode = 'distributor' WHERE dashboard_mode IN ('receiver', 'wholesaler');
UPDATE profiles SET dashboard_mode = 'both'        WHERE dashboard_mode IS NULL OR dashboard_mode NOT IN ('seller', 'distributor', 'both');
ALTER TABLE profiles ADD CONSTRAINT profiles_dashboard_mode_check
  CHECK (dashboard_mode IN ('seller', 'distributor', 'both'));

-- Supplier RLS: already correct in this schema; applied via SQL Editor March 8.
-- Supplier indexes: already present above (idx_supplier_deliveries_supplier, etc.)

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
  upi              TEXT,             -- live has this column (pos 11)
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
DROP POLICY IF EXISTS "Vendors can manage own suppliers" ON suppliers;
CREATE POLICY "Vendors can manage own suppliers" ON suppliers
  FOR ALL USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- supplier_deliveries
DROP POLICY IF EXISTS "Vendors can manage own deliveries" ON supplier_deliveries;
CREATE POLICY "Vendors can manage own deliveries" ON supplier_deliveries
  FOR ALL USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- supplier_delivery_items
DROP POLICY IF EXISTS "Vendors can manage own delivery items" ON supplier_delivery_items;
CREATE POLICY "Vendors can manage own delivery items" ON supplier_delivery_items
  FOR ALL USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- payments_made
DROP POLICY IF EXISTS "Vendors can manage own payments made" ON payments_made;
CREATE POLICY "Vendors can manage own payments made" ON payments_made
  FOR ALL USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));


-- =============================================================================
-- v1.9 — INCREMENTAL MIGRATIONS
-- Diffs discovered March 16, 2026 by introspecting live DB via SQL Editor.
-- Run these against the live DB ONLY if you are on the old schema (pre-v1.9).
-- All statements are safe to re-run on any DB (IF NOT EXISTS / IF EXISTS guards).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles table fixes
-- -----------------------------------------------------------------------------

-- 1. name was nullable in schema.sql but is NOT NULL in live — safe if all rows have names
--    already set via onboarding. If any row has NULL name, set '' first:
-- UPDATE profiles SET name = '' WHERE name IS NULL;
-- ALTER TABLE profiles ALTER COLUMN name SET NOT NULL;

-- 2. Column was created as billing_address in live (schema.sql said business_address)
--    Only run this if you have a column called business_address that needs renaming:
-- ALTER TABLE profiles RENAME COLUMN business_address TO billing_address;

-- 3. subscription_expiry type mismatch: live is DATE, schema said TIMESTAMPTZ
ALTER TABLE profiles ALTER COLUMN subscription_expiry TYPE DATE
  USING subscription_expiry::DATE;

-- 4. role column: live has DEFAULT 'vendor', ensure it exists
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'vendor';

-- -----------------------------------------------------------------------------
-- products table: add variants column (legacy JSONB field present in live)
-- -----------------------------------------------------------------------------
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB;

-- -----------------------------------------------------------------------------
-- orders table fixes
-- -----------------------------------------------------------------------------

-- 5. bill_number is nullable in live (was applied via ALTER, never NOT NULL in live)
ALTER TABLE orders ALTER COLUMN bill_number DROP NOT NULL;

-- 6. total_amount has no DEFAULT in live (remove the default)
ALTER TABLE orders ALTER COLUMN total_amount DROP DEFAULT;

-- 7. orders_status_check and orders_vendor_bill_unique are now applied via
--    migration: apply_orders_constraints.sql (includes duplicate-detection
--    query, remediation helper, and idempotent DO $$ existence guards).

-- -----------------------------------------------------------------------------
-- order_items table: product_id is NOT NULL in live
-- -----------------------------------------------------------------------------

-- 8. product_id is NOT NULL in live — remove SET NULL behaviour.
--    Only safe if no order_item rows have NULL product_id:
-- UPDATE order_items SET product_id = NULL WHERE product_id NOT IN (SELECT id FROM products);
-- ALTER TABLE order_items ALTER COLUMN product_id SET NOT NULL;

-- -----------------------------------------------------------------------------
-- payments table: created_at column is NOT in live DB
-- -----------------------------------------------------------------------------

-- 9. Drop created_at from payments if it was accidentally added in an old migration:
-- ALTER TABLE payments DROP COLUMN IF EXISTS created_at;
--
-- OR add it to bring live in line with best practice:
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- -----------------------------------------------------------------------------
-- suppliers table: add upi column (present in live, missing from v1.8 schema)
-- -----------------------------------------------------------------------------
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS upi TEXT;

-- -----------------------------------------------------------------------------
-- Functions & triggers added in v1.9 (sync to live)
-- -----------------------------------------------------------------------------

-- link_user_profile: links pre-created profile rows to newly signed-up users
-- (Function defined above in SQL FUNCTIONS section.)

-- on_payment_upsert trigger: was not found in the live trigger scan
-- (scan only covered auth.users table — check public.payments triggers manually).
-- If missing, create it:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_payment_upsert'
      AND event_object_schema = 'public'
      AND event_object_table  = 'payments'
  ) THEN
    EXECUTE '
      CREATE TRIGGER on_payment_upsert
        AFTER INSERT OR UPDATE ON public.payments
        FOR EACH ROW EXECUTE FUNCTION update_order_status()
    ';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- Added April 5: Phase 1 Hardening RPCs
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION create_order_transaction(
  p_vendor_id UUID,
  p_customer_id UUID,
  p_items JSONB,
  p_amount_paid NUMERIC,
  p_payment_mode TEXT,
  p_loading_charge NUMERIC,
  p_tax_percent NUMERIC,
  p_bill_prefix TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_bill_number TEXT;
  v_previous_balance NUMERIC;
  v_items_total NUMERIC := 0;
  v_tax_amount NUMERIC := 0;
  v_total_amount NUMERIC := 0;
  v_order_id UUID;
  v_item JSONB;
BEGIN
  IF p_amount_paid < 0 THEN
      RAISE EXCEPTION 'amount_paid cannot be negative';
  END IF;

  v_bill_number := get_next_bill_number(p_vendor_id, p_bill_prefix);
  v_previous_balance := get_customer_previous_balance(p_customer_id, p_vendor_id);

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_items_total := v_items_total + (COALESCE((v_item->>'price')::NUMERIC, 0) * COALESCE((v_item->>'quantity')::NUMERIC, 0));
  END LOOP;

  v_tax_amount := ROUND((v_items_total * p_tax_percent) / 100.0, 2);
  v_total_amount := v_items_total + v_tax_amount + COALESCE(p_loading_charge, 0);

  INSERT INTO orders (
    vendor_id,
    customer_id,
    bill_number,
    total_amount,
    amount_paid,
    previous_balance,
    loading_charge,
    tax_percent,
    status
  ) VALUES (
    p_vendor_id,
    p_customer_id,
    v_bill_number,
    v_total_amount,
    0,
    v_previous_balance,
    p_loading_charge,
    p_tax_percent,
    'Pending'
  ) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      vendor_id,
      product_id,
      product_name,
      variant_name,
      price,
      quantity
    ) VALUES (
      v_order_id,
      p_vendor_id,
      (NULLIF(v_item->>'product_id', ''))::UUID,
      v_item->>'product_name',
      NULLIF(v_item->>'variant_name', ''),
      (v_item->>'price')::NUMERIC,
      (v_item->>'quantity')::INTEGER
    );
  END LOOP;

  IF p_amount_paid > 0 THEN
    INSERT INTO payments (
      order_id,
      vendor_id,
      amount,
      payment_mode
    ) VALUES (
      v_order_id,
      p_vendor_id,
      p_amount_paid,
      COALESCE(p_payment_mode, 'Cash')
    );
  END IF;

  RETURN jsonb_build_object('order_id', v_order_id);
END;
$$;

CREATE OR REPLACE FUNCTION get_customer_statement(p_customer_id UUID)
RETURNS TABLE (
  id UUID,
  type TEXT,
  created_at TIMESTAMPTZ,
  amount NUMERIC,
  running_balance NUMERIC,
  bill_number TEXT,
  status TEXT,
  item_count BIGINT,
  payment_mode TEXT,
  order_bill_number TEXT
)
LANGUAGE sql
SECURITY INVOKER
AS $$
WITH combined_events AS (
  SELECT 
    o.id,
    'bill' AS type,
    o.created_at,
    o.total_amount AS amount,
    o.bill_number,
    o.status,
    (SELECT count(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count,
    NULL::TEXT AS payment_mode,
    NULL::TEXT AS order_bill_number
  FROM orders o
  WHERE o.customer_id = p_customer_id
  
  UNION ALL
  
  SELECT 
    p.id,
    'payment' AS type,
    p.payment_date AS created_at,
    p.amount,
    NULL::TEXT AS bill_number,
    NULL::TEXT AS status,
    0::BIGINT AS item_count,
    p.payment_mode,
    o.bill_number AS order_bill_number
  FROM payments p
  JOIN orders o ON p.order_id = o.id
  WHERE o.customer_id = p_customer_id
)
SELECT 
  id,
  type,
  created_at,
  amount,
  GREATEST(SUM(CASE WHEN type = 'bill' THEN amount ELSE -amount END) OVER (ORDER BY created_at ASC, type ASC), 0) AS running_balance,
  bill_number,
  status,
  item_count,
  payment_mode,
  order_bill_number
FROM combined_events 
ORDER BY created_at DESC;
$$;
