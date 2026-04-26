-- =============================================================================
-- KredBook App - Full Database Schema
-- Version: 5.0 (Architecture Cleanup Complete)
-- Last Updated: April 09, 2026
--
-- SYNC NOTE: Legacy customers and suppliers tables have been removed.
-- All entities redirected to the unified 'parties' table.
-- Consolidated performance indexes and storage security hardening.
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
  
  -- Role flag
  is_customer BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Cached balances for performance
  customer_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------

-- Public Access Tokens (Shared Ledger System)
CREATE TABLE IF NOT EXISTS access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES parties(id) ON DELETE CASCADE NOT NULL,
  
  expires_at TIMESTAMP WITH TIME ZONE,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_active_token UNIQUE (vendor_id, customer_id)
);
COMMENT ON COLUMN access_tokens.customer_id IS 'References parties.id (is_customer=true).';

-- -----------------------------------------------------------------------------

-- Products table
-- NOTE: Product catalog is out of scope (legacy). Product tables removed.

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES parties(id) ON DELETE CASCADE NOT NULL,

  bill_number TEXT,
  total_amount NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(10,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,

  previous_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  loading_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_percent NUMERIC(5,2) NOT NULL DEFAULT 0,

  status TEXT NOT NULL DEFAULT 'Pending',
  
  -- Audit fields
  edited_at TIMESTAMPTZ,
  edit_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT orders_status_check CHECK (status IN ('Pending', 'Partially Paid', 'Paid')),
  CONSTRAINT orders_vendor_bill_unique UNIQUE (vendor_id, bill_number),
  CONSTRAINT orders_total_amount_nonnegative CHECK (total_amount >= 0),
  CONSTRAINT orders_amount_paid_nonnegative CHECK (amount_paid >= 0),
  CONSTRAINT orders_amount_paid_lte_total CHECK (amount_paid <= total_amount)
);
COMMENT ON COLUMN orders.customer_id IS 'References parties.id (is_customer=true). Legacy: was customers.id.';

-- -----------------------------------------------------------------------------

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID,
  variant_id UUID,
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

-- NOTE: Supplier-ledger tables removed (out of strict single-mode scope).


-- =============================================================================
-- INDEXES
-- =============================================================================

-- parties
CREATE INDEX IF NOT EXISTS idx_parties_vendor        ON parties(vendor_id);
CREATE INDEX IF NOT EXISTS idx_parties_phone         ON parties(phone);
-- Role index retained for compatibility; parties are customer-only.
CREATE INDEX IF NOT EXISTS idx_parties_roles         ON parties(is_customer);
CREATE UNIQUE INDEX IF NOT EXISTS parties_vendor_phone_idx ON parties(vendor_id, phone);

-- products
-- (removed)

-- access_tokens
CREATE INDEX IF NOT EXISTS idx_access_tokens_token        ON access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_access_tokens_vendor       ON access_tokens(vendor_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_customer     ON access_tokens(customer_id);

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_vendor              ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer            ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at          ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_balance_due   ON orders(vendor_id, balance_due) WHERE balance_due > 0;

-- order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order           ON order_items(order_id);

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_order              ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_vendor             ON payments(vendor_id);

-- (removed)


-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments                ENABLE ROW LEVEL SECURITY;
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

-- ------------ storage --------------------------------------------------------
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for public buckets" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id IN ('product-images', 'business-logos'));

CREATE POLICY "Product images upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Product images read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Business logos upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'business-logos');

CREATE POLICY "Business logos read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'business-logos');

CREATE POLICY "Business logos update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'business-logos');


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

-- Atomic update: order + items with validations
CREATE OR REPLACE FUNCTION public.update_order_transaction(
  p_order_id UUID,
  p_vendor_id UUID,
  p_items JSONB,
  p_loading_charge NUMERIC,
  p_tax_percent NUMERIC,
  p_quick_amount NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_amount_paid NUMERIC;
  v_items_total NUMERIC := 0;
  v_tax_amount NUMERIC := 0;
  v_total_amount NUMERIC := 0;
  v_item JSONB;
  v_has_items BOOLEAN := FALSE;
BEGIN
  IF p_loading_charge IS NULL THEN p_loading_charge := 0; END IF;
  IF p_tax_percent IS NULL THEN p_tax_percent := 0; END IF;
  IF p_quick_amount IS NULL THEN p_quick_amount := 0; END IF;

  IF p_loading_charge < 0 THEN RAISE EXCEPTION 'loading_charge cannot be negative'; END IF;
  IF p_tax_percent < 0 OR p_tax_percent > 100 THEN RAISE EXCEPTION 'tax_percent must be between 0 and 100'; END IF;

  SELECT amount_paid INTO v_amount_paid
  FROM public.orders
  WHERE id = p_order_id AND vendor_id = p_vendor_id;

  IF NOT FOUND THEN RAISE EXCEPTION 'order not found'; END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_has_items := TRUE;
    v_items_total := v_items_total + (COALESCE((v_item->>'price')::NUMERIC, 0) * COALESCE((v_item->>'quantity')::NUMERIC, 0));
  END LOOP;

  IF v_has_items THEN
    v_tax_amount := ROUND((v_items_total * p_tax_percent) / 100.0, 2);
    v_total_amount := v_items_total + v_tax_amount + p_loading_charge;
  ELSE
    v_total_amount := p_quick_amount;
  END IF;

  IF v_total_amount <= 0 THEN RAISE EXCEPTION 'total_amount must be greater than zero'; END IF;
  IF v_total_amount < v_amount_paid THEN RAISE EXCEPTION 'total_amount cannot be less than amount already paid'; END IF;

  -- Replace items (transactional)
  DELETE FROM public.order_items
  WHERE order_id = p_order_id AND vendor_id = p_vendor_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (
      order_id,
      vendor_id,
      product_id,
      variant_id,
      product_name,
      variant_name,
      price,
      quantity
    ) VALUES (
      p_order_id,
      p_vendor_id,
      NULLIF(v_item->>'product_id', '')::UUID,
      NULLIF(v_item->>'variant_id', '')::UUID,
      v_item->>'product_name',
      NULLIF(v_item->>'variant_name', ''),
      (v_item->>'price')::NUMERIC,
      (v_item->>'quantity')::INTEGER
    );
  END LOOP;

  UPDATE public.orders
  SET total_amount = v_total_amount,
      loading_charge = CASE WHEN v_has_items THEN p_loading_charge ELSE 0 END,
      tax_percent = CASE WHEN v_has_items THEN p_tax_percent ELSE 0 END,
      status = CASE
        WHEN v_amount_paid >= v_total_amount THEN 'Paid'
        WHEN v_amount_paid > 0 THEN 'Partially Paid'
        ELSE 'Pending'
      END
  WHERE id = p_order_id AND vendor_id = p_vendor_id;

  RETURN jsonb_build_object('order_id', p_order_id, 'total_amount', v_total_amount);
END;
$$;
