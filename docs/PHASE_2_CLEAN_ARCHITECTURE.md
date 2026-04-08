# Phase 2: Clean Architecture - Design Document

**Status:** Planning  
**Timeline:** Weeks 5-8  
**Last Updated:** April 8, 2026

---

## Overview

Phase 2 migrates KredBook from a dual-table architecture (`customers` + `suppliers`) to a unified `parties` table, removes unnecessary role/mode complexity, and adds core missing features (edit bills, profile management, image uploads).

### Goals

1. **Unified Data Model** - Single `parties` table replaces `customers` and `suppliers`
2. **Simplified Logic** - Remove `role` and `dashboard_mode` complexity from `profiles`
3. **Better UX** - Edit bills, manage profile, upload images
4. **Zero Downtime** - Backward-compatible migration with data preservation

---

## Part 1: Unified Parties Table

### Current Architecture Problems

**Problem 1: Dual Tables with Duplicate Fields**
```sql
-- Current (redundant)
customers (id, vendor_id, name, phone, address, created_at)
suppliers (id, vendor_id, name, phone, address, basket_mark, bank_name, account_number, ifsc_code, upi, created_at)
```

- Same entity (a business contact) stored in two places based on relationship type
- Cannot easily handle party that is BOTH customer AND supplier (e.g., wholesaler who buys some products and sells others)
- Complex queries when searching across all contacts

**Problem 2: Relationship Type as Table Name**
- Current: Table name determines relationship (`customers` vs `suppliers`)
- Better: Explicit `relationship_type` field in single table

**Problem 3: Missing Balance Tracking**
- Currently balance calculated on-the-fly from orders/payments
- Should cache balance for performance (millions of transactions in future)

### New Unified Schema

```sql
-- New unified parties table
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic info
  name TEXT NOT NULL,
  phone TEXT,  -- nullable (supplier might not have phone)
  address TEXT,
  
  -- Relationship type (can be both!)
  is_customer BOOLEAN NOT NULL DEFAULT FALSE,
  is_supplier BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Cached balances (for performance)
  customer_balance NUMERIC(10,2) NOT NULL DEFAULT 0,  -- positive = they owe vendor
  supplier_balance NUMERIC(10,2) NOT NULL DEFAULT 0,  -- positive = vendor owes them
  
  -- Supplier-specific fields (NULL when is_supplier=false)
  basket_mark TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  upi_id TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT parties_at_least_one_role CHECK (is_customer = TRUE OR is_supplier = TRUE),
  CONSTRAINT parties_vendor_phone_unique UNIQUE (vendor_id, phone)  -- same phone uniqueness as current
);

-- Indexes
CREATE INDEX idx_parties_vendor ON parties(vendor_id);
CREATE INDEX idx_parties_customer ON parties(vendor_id) WHERE is_customer = TRUE;
CREATE INDEX idx_parties_supplier ON parties(vendor_id) WHERE is_supplier = TRUE;
CREATE INDEX idx_parties_phone ON parties(phone);
CREATE INDEX idx_parties_name ON parties(vendor_id, name);
```

### Benefits

1. **Single Source of Truth** - One place to find all contacts
2. **Flexible Relationships** - Party can be customer, supplier, or both
3. **Better Search** - Single query to find any contact by name/phone
4. **Performance** - Cached balances eliminate expensive aggregations
5. **Simplified Code** - One set of React Query hooks instead of two

---

## Part 2: Database Migration Strategy

### Step 1: Create `parties` Table (New)

**File:** `supabase/migrations/20260408_create_parties_table.sql`

```sql
-- Create parties table
CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  is_customer BOOLEAN NOT NULL DEFAULT FALSE,
  is_supplier BOOLEAN NOT NULL DEFAULT FALSE,
  customer_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  supplier_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  basket_mark TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  upi_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT parties_at_least_one_role CHECK (is_customer = TRUE OR is_supplier = TRUE),
  CONSTRAINT parties_vendor_phone_unique UNIQUE (vendor_id, phone)
);

-- Indexes
CREATE INDEX idx_parties_vendor ON parties(vendor_id);
CREATE INDEX idx_parties_customer ON parties(vendor_id) WHERE is_customer = TRUE;
CREATE INDEX idx_parties_supplier ON parties(vendor_id) WHERE is_supplier = TRUE;
CREATE INDEX idx_parties_phone ON parties(phone);
CREATE INDEX idx_parties_name ON parties(vendor_id, name);

-- RLS
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can manage own parties" ON parties;
CREATE POLICY "Vendors can manage own parties" ON parties
  FOR ALL USING (vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_parties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER parties_updated_at
  BEFORE UPDATE ON parties
  FOR EACH ROW
  EXECUTE FUNCTION update_parties_updated_at();
```

### Step 2: Migrate Data from `customers` → `parties`

**File:** `supabase/migrations/20260408_migrate_customers_to_parties.sql`

```sql
-- Migrate all customers to parties table
INSERT INTO parties (
  id,  -- preserve UUIDs to avoid breaking foreign keys
  vendor_id,
  name,
  phone,
  address,
  is_customer,
  is_supplier,
  customer_balance,
  created_at,
  updated_at
)
SELECT 
  c.id,
  c.vendor_id,
  c.name,
  c.phone,
  c.address,
  TRUE,  -- is_customer
  FALSE, -- is_supplier
  COALESCE(
    (
      SELECT SUM(o.balance_due)
      FROM orders o
      WHERE o.customer_id = c.id
    ),
    0
  ) AS customer_balance,
  c.created_at,
  c.created_at AS updated_at
FROM customers c
ON CONFLICT (id) DO NOTHING;  -- safety: skip if already exists

-- Log migration stats
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count FROM parties WHERE is_customer = TRUE;
  RAISE NOTICE 'Migrated % customers to parties table', migrated_count;
END $$;
```

### Step 3: Migrate Data from `suppliers` → `parties`

**File:** `supabase/migrations/20260408_migrate_suppliers_to_parties.sql`

```sql
-- Migrate all suppliers to parties table
INSERT INTO parties (
  id,  -- preserve UUIDs
  vendor_id,
  name,
  phone,
  address,
  is_customer,
  is_supplier,
  supplier_balance,
  basket_mark,
  bank_name,
  account_number,
  ifsc_code,
  upi_id,
  created_at,
  updated_at
)
SELECT 
  s.id,
  s.vendor_id,
  s.name,
  s.phone,
  s.address,
  FALSE,  -- is_customer
  TRUE,   -- is_supplier
  COALESCE(
    (
      SELECT SUM(sd.total_amount) - COALESCE(SUM(pm.amount), 0)
      FROM supplier_deliveries sd
      LEFT JOIN payments_made pm ON pm.supplier_id = s.id
      WHERE sd.supplier_id = s.id
    ),
    0
  ) AS supplier_balance,
  s.basket_mark,
  s.bank_name,
  s.account_number,
  s.ifsc_code,
  s.upi,
  s.created_at,
  s.created_at AS updated_at
FROM suppliers s
ON CONFLICT (id) DO NOTHING;

-- Log migration stats
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count FROM parties WHERE is_supplier = TRUE;
  RAISE NOTICE 'Migrated % suppliers to parties table', migrated_count;
END $$;
```

### Step 4: Update Foreign Keys

**File:** `supabase/migrations/20260408_update_foreign_keys.sql`

```sql
-- orders.customer_id → parties.id (already compatible, customer UUIDs preserved)
-- No FK changes needed! Foreign keys still work because we preserved UUIDs

-- supplier_deliveries.supplier_id → parties.id (already compatible)
-- No FK changes needed!

-- Add helpful comments
COMMENT ON COLUMN orders.customer_id IS 'References parties.id (legacy: was customers.id)';
COMMENT ON COLUMN supplier_deliveries.supplier_id IS 'References parties.id (legacy: was suppliers.id)';
COMMENT ON COLUMN payments_made.supplier_id IS 'References parties.id (legacy: was suppliers.id)';
```

### Step 5: Create Views for Backward Compatibility (Optional)

**File:** `supabase/migrations/20260408_create_compatibility_views.sql`

```sql
-- Optional: Create views that mimic old customers/suppliers tables
-- Useful if you want gradual frontend migration

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
```

### Step 6: Deprecate Old Tables (DO NOT DROP YET!)

**File:** `supabase/migrations/20260408_deprecate_old_tables.sql`

```sql
-- Add comments marking tables as deprecated
COMMENT ON TABLE customers IS 'DEPRECATED: Use parties table instead. Will be dropped in Phase 3.';
COMMENT ON TABLE suppliers IS 'DEPRECATED: Use parties table instead. Will be dropped in Phase 3.';

-- DO NOT DROP TABLES YET - Keep as backup during Phase 2 testing
-- Will drop in Phase 3 after confirming parties table works perfectly
```

---

## Part 3: Frontend Migration

### Step 1: Create `useParties` Hook

**File:** `src/hooks/useParties.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Party = Database['public']['Tables']['parties']['Row'];
type PartyInsert = Database['public']['Tables']['parties']['Insert'];
type PartyUpdate = Database['public']['Tables']['parties']['Update'];

export function useParties(vendorId: string, type?: 'customer' | 'supplier' | 'all') {
  return useQuery({
    queryKey: ['parties', vendorId, type],
    queryFn: async () => {
      let query = supabase
        .from('parties')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('name');

      if (type === 'customer') {
        query = query.eq('is_customer', true);
      } else if (type === 'supplier') {
        query = query.eq('is_supplier', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Party[];
    },
  });
}

export function useParty(partyId: string) {
  return useQuery({
    queryKey: ['parties', partyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .eq('id', partyId)
        .single();
      if (error) throw error;
      return data as Party;
    },
  });
}

export function useCreateParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (party: PartyInsert) => {
      const { data, error } = await supabase
        .from('parties')
        .insert(party)
        .select()
        .single();
      if (error) throw error;
      return data as Party;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['parties', data.vendor_id] });
    },
  });
}

export function useUpdateParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PartyUpdate }) => {
      const { data, error } = await supabase
        .from('parties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Party;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['parties', data.vendor_id] });
      queryClient.invalidateQueries({ queryKey: ['parties', data.id] });
    },
  });
}

export function useDeleteParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partyId: string) => {
      const { error } = await supabase
        .from('parties')
        .delete()
        .eq('id', partyId);
      if (error) throw error;
    },
    onSuccess: (_, partyId) => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
    },
  });
}
```

### Step 2: Update Existing Components

**Strategy:** Gradual migration, backwards compatible

1. **Phase 2A (Weeks 5-6):** Database migration + new hooks
2. **Phase 2B (Week 7):** Update customer-facing screens to use `parties`
3. **Phase 2C (Week 8):** Update supplier-facing screens to use `parties`

**Example: Update Customer List Screen**

```typescript
// Before (app/(main)/customers/index.tsx)
import { useCustomers } from '@/hooks/useCustomers';

// After
import { useParties } from '@/hooks/useParties';

// Change query
// const { data: customers } = useCustomers(vendorId);
const { data: customers } = useParties(vendorId, 'customer');
```

---

## Part 4: Remove Role/Mode Complexity

### Current Problems

**Problem 1: Unused `role` Field**
```sql
-- profiles.role TEXT DEFAULT 'vendor'
```
- Always 'vendor' in current app
- No logic uses this field
- Adds unnecessary complexity

**Problem 2: Confusing `dashboard_mode`**
```sql
-- profiles.dashboard_mode TEXT DEFAULT 'both'
-- CHECK (dashboard_mode IN ('seller', 'distributor', 'both'))
```
- Current app doesn't use 'seller' vs 'distributor' modes
- All users effectively use 'both' mode
- PRD v5 doesn't mention mode switching

### Simplification Plan

**Step 1: Audit Usage**
```bash
# Search for role/dashboard_mode usage in codebase
grep -r "dashboard_mode" src/
grep -r "\.role" src/
```

**Step 2: Remove from Schema**
```sql
-- Migration: 20260408_remove_role_mode.sql
ALTER TABLE profiles DROP COLUMN IF EXISTS role;
ALTER TABLE profiles DROP COLUMN IF EXISTS dashboard_mode;
```

**Step 3: Update TypeScript Types**
```typescript
// Remove from Database type definitions
// Re-run Supabase type generation
npx supabase gen types typescript --project-id sfmoefgjmgkwvauyaiyz > src/types/supabase.ts
```

---

## Part 5: Edit Bill Flow

### Current Problem
- Bills can only be created, not edited
- Mistakes require deleting entire bill and recreating
- No audit trail of changes

### Solution: Add Edit Functionality

**Step 1: Add `edited_at` and `edit_count` to Orders**

```sql
-- Migration: 20260408_add_order_edit_tracking.sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS edit_count INTEGER NOT NULL DEFAULT 0;

-- Trigger to auto-update edited_at
CREATE OR REPLACE FUNCTION update_order_edited_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.* IS DISTINCT FROM NEW.* THEN
    NEW.edited_at = now();
    NEW.edit_count = OLD.edit_count + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_edited_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_edited_at();
```

**Step 2: Create Edit Screen**

**File:** `app/(main)/orders/[orderId]/edit.tsx`

```typescript
// Reuse most of the create.tsx logic
// Pre-populate form with existing order data
// Show "Editing Bill INV-001" instead of "Create New Bill"
// Add warning: "Changes will be reflected in customer's ledger"
```

**Step 3: Add Edit Button**

Update `app/(main)/orders/[orderId].tsx` to add "Edit Bill" button.

---

## Part 6: Profile Edit Screen

### Current Problem
- Bank details only editable during onboarding
- Business info only editable during onboarding
- No way to update GSTIN, UPI, etc. after signup

### Solution: Dedicated Profile Screen

**File:** `app/(main)/profile/index.tsx`

```typescript
// New profile screen with sections:
// 1. Personal Info (name, phone - read-only)
// 2. Business Details (business_name, billing_address, gstin, bill_number_prefix)
// 3. Bank Details (bank_name, account_number, ifsc_code)
// 4. Payment Details (upi_id)
// 5. Branding (business_logo_url - upload button)

// Edit mode vs View mode
// Save button updates profiles table
```

**Navigation:** Add to main tab bar or hamburger menu.

---

## Part 7: Image Upload System

### Requirements
1. **Business Logo** - Displayed on bills/invoices
2. **Product Images** - Optional for products catalog

### Implementation: Supabase Storage

**Step 1: Create Storage Buckets**

```sql
-- Via Supabase dashboard or SQL
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('business-logos', 'business-logos', true),
  ('product-images', 'product-images', true);

-- RLS policies for storage
CREATE POLICY "Users can upload own business logo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'business-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view business logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'business-logos');
```

**Step 2: Create Upload Utilities**

**File:** `src/utils/imageUpload.ts`

```typescript
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export async function uploadBusinessLogo(userId: string) {
  // Request permissions
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permission to access media library denied');
  }

  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1], // Square logo
    quality: 0.8,
  });

  if (result.canceled) return null;

  const uri = result.assets[0].uri;
  const fileExt = uri.split('.').pop();
  const fileName = `${userId}/logo.${fileExt}`;

  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('business-logos')
    .upload(fileName, decode(base64), {
      contentType: `image/${fileExt}`,
      upsert: true, // Replace if exists
    });

  if (error) throw error;

  // Get public URL
  const { data: publicData } = supabase.storage
    .from('business-logos')
    .getPublicUrl(fileName);

  return publicData.publicUrl;
}

function decode(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
```

**Step 3: Add Upload UI in Profile Screen**

```typescript
// In profile edit screen
<TouchableOpacity onPress={handleUploadLogo}>
  {businessLogoUrl ? (
    <Image source={{ uri: businessLogoUrl }} style={styles.logo} />
  ) : (
    <View style={styles.logoPlaceholder}>
      <Text>Upload Business Logo</Text>
    </View>
  )}
</TouchableOpacity>
```

**Step 4: Update Bill PDF Generator**

Update `src/utils/generateBillPDF.ts` to include logo if available:

```typescript
// Add logo to PDF header
if (vendorProfile.business_logo_url) {
  doc.addImage(
    vendorProfile.business_logo_url,
    'PNG',
    10, 10, 30, 30  // x, y, width, height
  );
}
```

---

## Implementation Timeline

### Week 5: Database Migration
- **Day 1-2:** Create and test `parties` table migration
- **Day 3-4:** Migrate data from customers/suppliers
- **Day 5:** Apply migrations to live database
- **Deliverable:** `parties` table live with all data migrated

### Week 6: Frontend Hooks & Testing
- **Day 1-2:** Create `useParties` hook
- **Day 3-4:** Update customer-facing screens
- **Day 5:** Test thoroughly, ensure backward compatibility
- **Deliverable:** All customer screens using `parties` table

### Week 7: Features (Edit Bills + Profile)
- **Day 1-2:** Build edit bill flow
- **Day 3-4:** Build profile edit screen
- **Day 5:** Testing and polish
- **Deliverable:** Users can edit bills and update profile

### Week 8: Image Upload + Cleanup
- **Day 1-2:** Implement image upload system
- **Day 3-4:** Remove role/mode complexity
- **Day 5:** Drop deprecated customers/suppliers tables
- **Deliverable:** Phase 2 complete, production-ready

---

## Risk Mitigation

### Risk 1: Data Loss During Migration
**Mitigation:** 
- Keep original tables until Phase 3
- Test migration on staging database first
- Export full database backup before applying migrations
- Verify row counts match before/after

### Risk 2: Foreign Key Breakage
**Mitigation:**
- Preserve UUIDs during migration (don't generate new ones)
- Test all foreign key relationships after migration
- Keep compatibility views as fallback

### Risk 3: App Downtime
**Mitigation:**
- Migrations are additive (add `parties`, don't drop `customers` yet)
- Frontend can gradually migrate (old code still works)
- Deploy frontend updates only after testing database migration

---

## Success Metrics

### Technical Metrics
- ✅ Zero data loss (all customers/suppliers migrated)
- ✅ All foreign keys valid
- ✅ All RLS policies working
- ✅ No regression in existing features

### User Metrics
- ✅ Users can edit bills without deleting
- ✅ Users can update business profile
- ✅ Users can upload business logo
- ✅ Bills show logo on PDF

### Performance Metrics
- ✅ Cached balances eliminate slow queries
- ✅ Single table search faster than dual-table joins
- ✅ App feels as fast or faster than Phase 1

---

## Next Steps

1. **Review this document** with team/stakeholders
2. **Create all migration SQL files** in `supabase/migrations/`
3. **Test migrations on local Supabase** instance
4. **Apply to live database** (Week 5, Day 5)
5. **Begin frontend development** (Week 6+)

**Ready to start implementation!** 🚀
