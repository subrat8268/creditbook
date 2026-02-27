-- CreditBook App Database Schema
-- Run this in your Supabase SQL Editor

-- Profiles table (extends auth.users)
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
  
  -- Bank details (mandatory for Indian billing)
  bank_name TEXT NOT NULL DEFAULT '',
  account_number TEXT NOT NULL DEFAULT '',
  ifsc_code TEXT NOT NULL DEFAULT '',
  
  -- Images
  avatar_url TEXT,
  business_logo_url TEXT,
  
  -- Subscription details
  subscription_plan TEXT DEFAULT 'free',
  subscription_expiry TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  base_price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  variant_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table (with Indian billing enhancements)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  
  -- Bill numbering (sequential per vendor)
  bill_number TEXT NOT NULL,
  
  -- Financial details
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(10,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  
  -- Indian billing specific fields
  previous_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  loading_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('Paid', 'Pending', 'Partially Paid')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique bill numbers per vendor
  UNIQUE(vendor_id, bill_number)
);

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

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('Cash', 'Online')),
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_vendor ON customers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Customers policies
CREATE POLICY "Vendors can view own customers" ON customers
  FOR SELECT USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can insert own customers" ON customers
  FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own customers" ON customers
  FOR UPDATE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can delete own customers" ON customers
  FOR DELETE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Products policies
CREATE POLICY "Vendors can view own products" ON products
  FOR SELECT USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can insert own products" ON products
  FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own products" ON products
  FOR UPDATE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can delete own products" ON products
  FOR DELETE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Product variants policies
CREATE POLICY "Vendors can view own product variants" ON product_variants
  FOR SELECT USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can insert own product variants" ON product_variants
  FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own product variants" ON product_variants
  FOR UPDATE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can delete own product variants" ON product_variants
  FOR DELETE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Orders policies
CREATE POLICY "Vendors can view own orders" ON orders
  FOR SELECT USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can insert own orders" ON orders
  FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own orders" ON orders
  FOR UPDATE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can delete own orders" ON orders
  FOR DELETE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Order items policies
CREATE POLICY "Vendors can view own order items" ON order_items
  FOR SELECT USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can insert own order items" ON order_items
  FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own order items" ON order_items
  FOR UPDATE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can delete own order items" ON order_items
  FOR DELETE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Payments policies
CREATE POLICY "Vendors can view own payments" ON payments
  FOR SELECT USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can insert own payments" ON payments
  FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own payments" ON payments
  FOR UPDATE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can delete own payments" ON payments
  FOR DELETE USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Function to get next bill number for a vendor
CREATE OR REPLACE FUNCTION get_next_bill_number(vendor_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  bill_num TEXT;
BEGIN
  -- Get the highest bill number for this vendor
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(bill_number FROM 5) AS INTEGER)),
    0
  ) INTO next_num
  FROM orders
  WHERE vendor_id = vendor_uuid
  AND bill_number ~ '^INV-[0-9]+$';
  
  -- Increment and format
  next_num := next_num + 1;
  bill_num := 'INV-' || LPAD(next_num::TEXT, 3, '0');
  
  RETURN bill_num;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate customer's previous balance
CREATE OR REPLACE FUNCTION get_customer_previous_balance(
  customer_uuid UUID,
  vendor_uuid UUID
)
RETURNS NUMERIC AS $$
DECLARE
  prev_balance NUMERIC;
BEGIN
  -- Sum of all unpaid amounts from previous orders
  SELECT COALESCE(SUM(total_amount - amount_paid), 0)
  INTO prev_balance
  FROM orders
  WHERE customer_id = customer_uuid
  AND vendor_id = vendor_uuid;
  
  RETURN prev_balance;
END;
$$ LANGUAGE plpgsql;
