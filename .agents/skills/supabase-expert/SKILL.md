---
name: supabase-expert
description: Database design, RLS policies, migrations, and Supabase integration for KredBook.
---

# Supabase Expert Skill

> Database design, RLS policies, migrations, and Supabase integration for KredBook.

## When to Use

- Database schema changes
- Creating new tables
- RLS policy design
- Migration files
- Supabase queries
- Auth integration
- Storage setup

## Core Principles

### 1. MUST Use Supabase MCP

**ALWAYS use Supabase MCP for:**
- Schema queries
- RLS policy checks
- Data operations
- Auth workflows
- Storage operations

Do not guess table/column names from memory or docs.

**First step for any DB work:** use Supabase MCP to inspect the current schema.

### 2. Schema design (patterns)

**Tables should have:**
- `id` - UUID, primary key
- `created_at` - timestamptz, default now()
- `updated_at` - timestamptz
- Row-level security (RLS) enabled

Use migrations under `supabase/migrations/`.

Always:
- enable RLS
- add indexes for common filters
- add constraints that prevent invalid money values

### 3. RLS policy patterns

Prefer vendor/user ownership patterns consistent with the existing schema.

**Insert policy:**
```sql
CREATE POLICY "Users can create customers"
ON public.customers
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Update policy:**
```sql
CREATE POLICY "Users can update own customers"
ON public.customers
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### 4. Migration File Structure

```sql
-- supabase/migrations/YYYYMMDD_description.sql

-- Create table
CREATE TABLE public.table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- columns
);

-- Enable RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "..." ON public.table_name FOR SELECT USING (...);

-- Indexes (if needed)
CREATE INDEX idx_table_name_user_id ON public.table_name(user_id);
```

### 5. Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Tables | snake_case, plural | `customers`, `orders` |
| Columns | snake_case | `created_at`, `user_id` |
| Policies | Descriptive | `users_can_view_own_orders` |
| Indexes | `idx_table_column` | `idx_orders_user_id` |
| Functions | `verb_table` | `get_customer_summary` |

### 6. Types (schema integration)

If your change adds/changes columns, update the app types (where the repo keeps them).

```typescript
export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}
```

### 7. Queries (app code)

Use TanStack Query for server state and invalidate query keys on success.

```typescript
// Query hook
export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Customer[];
    },
  });
}

// Mutation
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customer: Omit<Customer, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
```

### 8. Storage

**Upload file:**
```typescript
const { data, error } = await supabase.storage
  .from('receipts')
  .upload(`${userId}/${fileName}`, file);
```

**Get public URL:**
```typescript
const { data: { publicUrl } } = supabase.storage
  .from('receipts')
  .getPublicUrl(path);
```

### 9. Auth

**Sign up:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { phone } },
});
```

**Sign in:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

**Sign out:**
```typescript
await supabase.auth.signOut();
```

### 10. Realtime

**Subscribe to changes:**
```typescript
supabase
  .channel('customers')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'customers' 
  }, (payload) => {
    // handle change
  })
  .subscribe();
```

## Anti-Patterns

- âŒ Creating tables without RLS
- âŒ Hardcoding table names
- âŒ Using db.on(...) instead of MCP
- âŒ Raw SQL without migration file
- âŒ Creating indexes on every column
- âŒ NOT NULL without default

## Migrations Location

All migrations go in:
```
supabase/migrations/
```

Migration naming: `YYYYMMDD_description.sql`

## Output Format

```
## Schema Change: [Description]

### Table
[Table name]

### Changes
- [Change 1]
- [Change 2]

### RLS Policies
- [Policy 1]
- [Policy 2]

### Verification
[How to verify]
```

---

*Loaded when: "database", "supabase", "migration", "schema", "RLS", "policy"*
