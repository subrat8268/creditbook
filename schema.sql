-- =============================================================================
-- KredBook App - Full Database Schema
-- Version: 3.0 (Parties & Clean Architecture Refactor)
-- Last Updated: April 08, 2026
--
-- SYNC NOTE: Schema reflects the Unified Parties Model and Phase 2 Clean Architecture.
-- Consolidated 'customers' and 'suppliers' into the 'parties' table.
-- Removed legacy 'role' and 'dashboard_mode' fields from profiles.
-- =============================================================================


-- =============================================================================
-- TABLES
-- =============================================================================

-- Profiles table (extends Supabase auth.users 1-to-1)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,

  -- Business details
  business_name TEXT,
  billing_address TEXT,
  gstin TEXT,
  upi_id TEXT,

  -- Bank details
  bank_name TEXT NOT NULL DEFAULT '',
  account_number TEXT NOT NULL DEFAULT '',
  ifsc_code TEXT NOT NULL DEFAULT '',

  -- Bill settings
  bill_number_prefix TEXT DEFAULT 'INV',

  -- Images
  avatar_url TEXT,
  business_logo_url TEXT,

  -- Subscription details
  subscription_plan TEXT DEFAULT 'free',
  subscription_expiry DATE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------

-- Parties Table (Unified Customers & Suppliers)
-- Replaces separate customers and suppliers tables.
CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  
  -- Role flags (a party can be both)
  is_customer BOOLEAN NOT NULL DEFAULT TRUE,
  is_supplier BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Cached balances for performance
  customer_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  supplier_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  -- Supplier specific details
  basket_mark TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  upi_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------

-- DEPRECATED: Customers table (Moved to parties table)
-- Kept as backup during Phase 2 transition.
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE customers IS 'DEPRECATED: Use parties table instead (is_customer=true).';

-- DEPRECATED: Suppliers table (Moved to parties table)
-- Kept as backup during Phase 2 transition.
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
  upi              TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE suppliers IS 'DEPRECATED: Use parties table instead (is_supplier=true).';

-- -----------------------------------------------------------------------------

-- Public Access Tokens (Shared Ledger System)
CREATE TABLE IF NOT EXISTS access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  
  expires_at TIMESTAMP WITH TIME ZONE,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_active_token UNIQUE (vendor_id, customer_id)
);
COMMENT ON COLUMN access_tokens.customer_id IS 'References parties.id (is_customer=true). Legacy: was customers.id.';

-- -----------------------------------------------------------------------------

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  base_price NUMERIC(10,2),
  variants JSONB,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'General',
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

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,

  bill_number TEXT,
  total_amount NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(10,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,

  previous_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  loading_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_percent NUMERIC(5,2) NOT NULL DEFAULT 0,

  status TEXT NOT NULL DEFAULT 'Unpaid',
  
  -- Audit fields
  edited_at TIMESTAMPTZ,
  edit_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT orders_status_check CHECK (status IN ('Unpaid', 'Pending', 'Partially Paid', 'Paid')),
  CONSTRAINT orders_vendor_bill_unique UNIQUE (vendor_id, bill_number)
);
COMMENT ON COLUMN orders.customer_id IS 'References parties.id (is_customer=true). Legacy: was customers.id.';

-- -----------------------------------------------------------------------------

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
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
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------

-- Supplier deliveries
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
COMMENT ON COLUMN supplier_deliveries.supplier_id IS 'References parties.id (is_supplier=true). Legacy: was suppliers.id.';

-- Supplier delivery items
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

-- Payments made to supplier
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
COMMENT ON COLUMN payments_made.supplier_id IS 'References parties.id (is_supplier=true). Legacy: was suppliers.id.';


-- =============================================================================
-- INDEXES
-- =============================================================================

-- parties
CREATE INDEX IF NOT EXISTS idx_parties_vendor        ON parties(vendor_id);
CREATE INDEX IF NOT EXISTS idx_parties_phone         ON parties(phone);
CREATE INDEX IF NOT EXISTS idx_parties_roles         ON parties(is_customer, is_supplier);
CREATE UNIQUE INDEX IF NOT EXISTS parties_vendor_phone_idx ON parties(vendor_id, phone);

-- products
CREATE INDEX IF NOT EXISTS idx_products_vendor            ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_vendor_category   ON products(vendor_id, category);

-- access_tokens
CREATE INDEX IF NOT EXISTS idx_access_tokens_token        ON access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_access_tokens_vendor       ON access_tokens(vendor_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_customer     ON access_tokens(customer_id);

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_vendor              ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer            ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at          ON orders(created_at DESC);

-- supplier domain
CREATE INDEX IF NOT EXISTS idx_supplier_deliveries_supplier ON supplier_deliveries(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payments_made_supplier       ON payments_made(supplier_id);


-- =============================================================================
-- COMPATIBILITY VIEWS
-- =============================================================================

-- View that mimics old customers table
CREATE OR REPLACE VIEW customers_view AS
SELECT 
  id,
  vendor_id,
  name,
  phone,
  address,
  created_at
FROM parties
WHERE is_customer = TRUE;

-- View that mimics old suppliers table
CREATE OR REPLACE VIEW suppliers_view AS
SELECT 
  id,
  vendor_id,
  name,
  phone,
  address,
  basket_mark,
  bank_name,
  account_number,
  ifsc_code,
  upi_id,
  created_at
FROM parties
WHERE is_supplier = TRUE;


-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments                ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_made           ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_deliveries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_tokens           ENABLE ROW LEVEL SECURITY;

-- ------------ profiles -------------------------------------------------------
CREATE POLICY "Users view own profile"   ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ------------ parties --------------------------------------------------------
CREATE POLICY "Vendors manage own parties" ON parties FOR ALL
  USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ products -------------------------------------------------------
CREATE POLICY "Vendors manage own products" ON products FOR ALL
  USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ orders ---------------------------------------------------------
CREATE POLICY "Vendors manage own orders" ON orders FOR ALL
  USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ order_items ----------------------------------------------------
CREATE POLICY "Vendors manage own order items" ON order_items FOR ALL
  USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ payments -------------------------------------------------------
CREATE POLICY "Vendors manage own payments" ON payments FOR ALL
  USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ------------ access_tokens --------------------------------------------------
CREATE POLICY "Public read via valid token" ON access_tokens FOR SELECT 
  USING ((is_revoked = FALSE) AND ((expires_at IS NULL) OR (expires_at > NOW())));

CREATE POLICY "Vendors manage own tokens" ON access_tokens FOR ALL
  USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));


-- =============================================================================
-- SQL FUNCTIONS & TRIGGERS
-- =============================================================================

-- Auto-update order status when payments change
CREATE OR REPLACE FUNCTION update_order_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET amount_paid = (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE order_id = NEW.order_id),
      status = CASE
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE order_id = NEW.order_id) >= orders.total_amount THEN 'Paid'
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE order_id = NEW.order_id) > 0 THEN 'Partially Paid'
        ELSE 'Pending'
      END
  WHERE id = NEW.order_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_payment_upsert
  AFTER INSERT OR UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_order_status();

-- Order Edit Tracking Trigger
CREATE OR REPLACE FUNCTION update_order_edit_tracking()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.total_amount IS DISTINCT FROM NEW.total_amount OR OLD.amount_paid IS DISTINCT FROM NEW.amount_paid OR OLD.status IS DISTINCT FROM NEW.status) THEN
    NEW.edited_at = now();
    NEW.edit_count = OLD.edit_count + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER orders_edit_tracking
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_order_edit_tracking();
