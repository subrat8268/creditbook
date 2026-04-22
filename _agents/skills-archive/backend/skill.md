# Backend Skill

> Server-side logic, database operations, and API design for KredBook.

## When to Use

- Database queries
- API functions
- Server-side validation
- Business logic
- Database transactions

## Architecture

### Frontend ↔ Backend

```
React Native App
    ↓
Supabase (PostgreSQL)
    ↓
React Query (caching)
```

### Direct Database Access

Use Supabase Client for all DB operations:

```typescript
import { supabase } from '@/lib/supabase';

// Fetch
const { data } = await supabase
  .from('customers')
  .select('*');

// Insert
const { data, error } = await supabase
  .from('customers')
  .insert({ name: 'John' })
  .select()
  .single();

// Update  
const { data, error } = await supabase
  .from('customers')
  .update({ name: 'John' })
  .eq('id', id)
  .select()
  .single();

// Delete
const { error } = await supabase
  .from('customers')
  .delete()
  .eq('id', id);
```

### Queries

**Filtering:**
```typescript
supabase
  .from('orders')
  .select('*, customer:customers(*)')
  .eq('status', 'PENDING')
  .gte('amount', 1000)
  .order('created_at', { ascending: false })
  .range(0, 20);
```

**Joins:**
```typescript
supabase
  .from('orders')
  .select(`
    *,
    customer:customers(name, phone),
    items:order_items(*)
  `)
  .eq('customer_id', customerId);
```

**Aggregates:**
```typescript
// Group by in SQL (via RPC or view)
const { data } = await supabase
  .rpc('get_customer_summary', { p_customer_id: id });
```

### Transactions

Use RPC for multi-statement transactions:

```sql
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_customer_id UUID,
  p_items JSONB
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  -- Create order
  INSERT INTO orders (customer_id, status)
  VALUES (p_customer_id, 'PENDING')
  RETURNING id INTO v_order_id;
  
  -- Insert items
  INSERT INTO order_items (order_id, variant_id, quantity, price)
  SELECT v_order_id, item->>'variant_id', 
         (item->>'quantity')::INT, 
         (item->>'price')::DECIMAL
  FROM JSONB_ARRAY_ELEMENTS(p_items) AS item;
  
  RETURN v_order_id;
END;
$$;
```

### API Design

**Exposed via Supabase:**

```typescript
// Custom function for complex queries
export async function getDashboardSummary(userId: string) {
  const { data, error } = await supabase.rpc('get_dashboard_summary', {
    p_user_id: userId,
  });
  
  if (error) throw error;
  return data;
}
```

### Error Handling

**Database errors:**
```typescript
const { data, error } = await supabase.from('customers').select('*');

if (error) {
  // Handle gracefully
  throw new Error('Failed to fetch customers');
}
```

**RLS policy violations:**
```typescript
// Returns null or empty on RLS violation
// Check error?.message for specifics
```

### Caching Strategy

**React Query:**
```typescript
const queryClient = useQueryClient();

// Invalidation patterns
queryClient.invalidateQueries({ queryKey: ['customers'] });
queryClient.invalidateQueries({ queryKey: ['orders'] });
queryClient.invalidateQueries({ queryKey: ['dashboard'] });

// Optimistic update
queryClient.setQueryData(['customer', id], (old) => ({
  ...old,
  name: updatedName,
}));
```

### Offline Support

**With MMKV + Sync Queue:**
```typescript
// 1. Save to local storage
const queue = getSyncQueue();
queue.add({ table: 'orders', operation: 'insert', data: newOrder });

// 2. Sync when online
if (isConnected) {
  await syncQueue.process();
}
```

### Database Functions

**Common RPCs to create:**

| Function | Purpose |
|----------|---------|
| `get_customer_summary` | Dashboard stats |
| `get_order_items` | Order details |
| `calculate_balance` | Outstanding amount |
| `get_net_position` | Net position report |
| `auto_link_ledgers` | Link related orders |

### Validation

**Database level:**
```sql
-- Check constraints
ALTER TABLE orders 
ADD CONSTRAINT positive_amount 
CHECK (amount > 0);

-- Partial index for performance
CREATE INDEX idx_active_orders ON orders(user_id) 
WHERE status != 'PAID';
```

### Performance

**Indexes:**
```sql
-- For frequently queried columns
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

**Views:**
```sql
-- For complex joins
CREATE VIEW customer_summary AS
SELECT 
  c.*,
  COUNT(o.id) AS order_count,
  SUM(o.amount) AS total_amount
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id;
```

## Anti-Patterns

- ❌ Raw SQL queries (use Supabase client)
- ❌ N+1 queries (use joins)
- ❌ Missing indexes on foreign keys
- ❌ Missing RLS policies
- ❌ No error handling
- ❌ No validation

## Output Format

```
## Backend Change: [Description]

### Query/Operation
[Type: select/insert/update/delete/rpc]

### Payload
[Parameters]

### Response
[Expected return]

### Cache Invalidation
[Query keys to invalidate]
```

---

*Loaded when: "backend", "database", "query", "API", "Supabase"*
