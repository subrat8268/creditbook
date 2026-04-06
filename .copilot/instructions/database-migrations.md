# Database Migrations Guide

## Migration File Structure

```sql
-- supabase/migrations/[timestamp]_[description].sql

-- Example:
-- supabase/migrations/20240407_add_audit_tables.sql

-- 1. Create tables
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
CREATE POLICY audit_log_vendor_isolation
  ON audit_log
  FOR SELECT
  USING (vendor_id = auth.uid());

-- 4. Create indexes
CREATE INDEX idx_audit_log_vendor ON audit_log(vendor_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
```

## Best Practices

### 1. Always Create Fresh

```sql
✅ Good:
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  balance NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

❌ Bad (using IF) - prevents clean schema on fresh install:
CREATE TABLE IF NOT EXISTS customers (
  -- ...
);
```

### 2. Always Enable RLS

```sql
-- After creating table:
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create at least one policy (allow reads, restrict writes):
CREATE POLICY customers_select
  ON customers
  FOR SELECT
  USING (vendor_id = auth.uid());

CREATE POLICY customers_insert
  ON customers
  FOR INSERT
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY customers_update
  ON customers
  FOR UPDATE
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY customers_delete
  ON customers
  FOR DELETE
  USING (vendor_id = auth.uid());
```

### 3. Always Add Timestamps

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  -- ... other columns ...
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP  -- For soft deletes
);
```

### 4. Add Indexes for Performance

```sql
-- Foreign key relationships
CREATE INDEX idx_customers_vendor ON customers(vendor_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);

-- Commonly filtered/sorted columns
CREATE INDEX idx_customers_active ON customers(deleted_at);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Search columns
CREATE INDEX idx_customers_name_gin ON customers USING GIN(to_tsvector('english', name));
```

### 5. Add Constraints

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT UNIQUE,  -- Unique constraint
  balance NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),  -- Check constraint
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Composite unique constraint
  UNIQUE(vendor_id, phone)
);
```

## Common Table Patterns

### Users/Vendors

```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_type TEXT,
  gst_number TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Master Data (with soft delete)

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  credit_limit NUMERIC(10,2),
  days_due SMALLINT DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP,  -- Soft delete
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Transactions (immutable)

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'open',  -- open, paid, cancelled
  reference_number TEXT UNIQUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  -- Don't include updated_at for immutable records

  CHECK (amount > 0)
);

-- Make immutable:
CREATE RULE orders_immutable AS
  ON UPDATE TO orders DO INSTEAD NOTHING;

CREATE RULE orders_no_delete AS
  ON DELETE TO orders DO INSTEAD NOTHING;
```

### Audit Trail

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  entity_type TEXT NOT NULL,  -- 'customer', 'order', 'payment'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,  -- 'created', 'updated', 'deleted'
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES vendors(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()

  -- Immutable
);
```

## Common Operations in Migrations

### Add Column to Existing Table

```sql
ALTER TABLE customers
ADD COLUMN category TEXT DEFAULT 'general';

-- Remove column
ALTER TABLE customers
DROP COLUMN category;

-- Change column type
ALTER TABLE orders
ALTER COLUMN amount TYPE NUMERIC(12,2);
```

### Rename Table or Column

```sql
ALTER TABLE customers RENAME TO customer_master;
ALTER TABLE customers RENAME COLUMN vendor_id TO owner_id;
```

### Create Index After Table

```sql
CREATE INDEX idx_customers_vendor ON customers(vendor_id);
```

### Create Trigger for Timestamps

```sql
-- For auto-updating updated_at:
CREATE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_timestamp
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```

## Testing Migrations

After writing migration:

1. **Test on fresh schema**

   ```bash
   supabase db reset  # Loads all migrations
   ```

2. **Test on existing schema**

   ```bash
   supabase db push  # Applies new migration
   ```

3. **Verify RLS policies**

   ```sql
   -- Check policies exist
   SELECT tablename, policyname FROM pg_policies
   WHERE tablename = 'customers';

   -- Test policy as vendor
   SET ROLE authenticated;
   SET jwt.claims.sub = '[vendor-id]';
   SELECT * FROM customers;  -- Should only see own customers
   ```

## Version Control

**Always commit migrations to git:**

```bash
git add supabase/migrations/
git commit -m "Add audit_log table with RLS policies"
```

**Never edit existing migrations** — create new ones instead:

```
✗ Dangerous:
Edit: 20240401_create_customers.sql
  (Breaks history, can't sync with other developers)

✓ Safe:
Create: 20240407_add_audit_fields_to_customers.sql
  (Extends schema safely)
```

---

**Migration checklist:**

- [ ] Create table
- [ ] Add columns with types
- [ ] Add constraints (NOT NULL, UNIQUE, CHECK, FK)
- [ ] Add timestamps (created_at, updated_at)
- [ ] Enable RLS
- [ ] Create RLS policies
- [ ] Add indexes
- [ ] Test on fresh schema
- [ ] Test on existing schema
- [ ] Commit to git
