-- Add category column to products table
-- Existing rows default to 'General'; new rows also default to 'General'.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'General';

-- Optional index: allows fast filtering by category per vendor
CREATE INDEX IF NOT EXISTS idx_products_vendor_category
  ON products (vendor_id, category);
