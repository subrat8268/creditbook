# KredBook Project: Global Conventions & Best Practices

This guide documents how KredBook code is written. Copilot uses this to understand conventions and generate code that matches your style.

## Table of Contents

1. [Project Context](#project-context)
2. [Code Style](#code-style)
3. [Component Patterns](#component-patterns)
4. [API Patterns](#api-patterns)
5. [Database Conventions](#database-conventions)
6. [Common Mistakes](#common-mistakes)

---

## Project Context

**KredBook** is a React Native + Expo mobile app for business credit management:

- **Users**: Vendors tracking customer credit, orders, payments
- **Platform**: iOS + Android via Expo
- **Backend**: Supabase (PostgreSQL)
- **Data**: Real business data (financial transactions, amounts in INR)

### Critical Files

- `src/utils/theme.ts` — Single source of color/spacing truth
- `schema.sql` — Database schema
- `/docs/design-system.md` — UI design tokens
- `/docs/ux-context.md` — Screen layouts & flows

---

## Code Style

### Colors

❌ **DON'T hardcode color values:**

```tsx
const styles = StyleSheet.create({
  danger: { color: "#EF4444" }, // Bad
});
```

✅ **DO use theme.ts:**

```tsx
import { theme } from "@/utils/theme";

const styles = StyleSheet.create({
  danger: { color: theme.colors.danger }, // Good
});
```

### Icons

❌ **DON'T use @expo/vector-icons:**

```tsx
import { Ionicons } from "@expo/vector-icons";
<Ionicons name="close" size={24} />;
```

✅ **DO use lucide-react-native:**

```tsx
import { X } from "lucide-react-native";
<X size={24} color={theme.colors.text} />;
```

### Imports

✅ **DO use absolute imports (configured in tsconfig.json):**

```tsx
import { useCustomer } from "@/hooks/useCustomer";
import { theme } from "@/utils/theme";
import { CustomerCard } from "@/components/customers/CustomerCard";
```

❌ **DON'T use relative imports:**

```tsx
import { useCustomer } from "../../../hooks/useCustomer"; // Bad
```

### Error Handling

✅ **DO wrap API calls in try-catch + Sentry:**

```tsx
try {
  const customer = await api.customer.get(id);
  setCustomer(customer);
} catch (error) {
  Sentry.captureException(error);
  showErrorToast("Failed to load customer");
}
```

❌ **DON'T ignore errors silently:**

```tsx
const customer = await api.customer.get(id); // What if it fails?
```

### Async/Await vs Promises

✅ **DO use async/await for clarity:**

```tsx
async function loadCustomer() {
  const customer = await api.customer.get(id);
  return customer;
}
```

❌ **DON'T chain .then() unnecessarily:**

```tsx
api.customer.get(id).then(c => { ... })  // Less clear
```

---

## Component Patterns

### Component Structure

```tsx
// src/components/customers/CustomerCard.tsx

import { View, Text, StyleSheet } from "react-native";
import { theme } from "@/utils/theme";
import { Customer } from "@/types/customers";

interface CustomerCardProps {
  customer: Customer;
  onPress?: () => void;
}

export function CustomerCard({ customer, onPress }: CustomerCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{customer.name}</Text>
      <Text style={styles.phone}>{customer.phone}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  phone: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
});
```

### Props Interface

```tsx
// Always define props interface
interface [ComponentName]Props {
  [prop1]: [type];
  [prop2]?: [type];  // Optional
  onPress?: () => void;
}

export function [ComponentName](props: [ComponentName]Props) {
  // ...
}
```

### State Management

✅ **DO use React hooks + TanStack Query for fetching:**

```tsx
import { useCustomers } from "@/hooks/useCustomers";

export function CustomersList() {
  const { data: customers, isLoading } = useCustomers();

  if (isLoading) return <LoadingSpinner />;

  return (
    <FlatList
      data={customers}
      renderItem={({ item }) => <CustomerCard customer={item} />}
      keyExtractor={(item) => item.id}
    />
  );
}
```

❌ **DON'T fetch in useEffect without caching:**

```tsx
useEffect(() => {
  api.customers.list().then(setCustomers); // No caching, reloads every time
}, []);
```

---

## API Patterns

### API File Structure

```typescript
// src/api/customers.ts

import { supabaseQuery } from "@/lib/supabaseQuery";

export const customerApi = {
  // Queries (GET)
  list: async () => {
    const { data, error } = await supabaseQuery("customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  get: async (id: string) => {
    const { data, error } = await supabaseQuery("customers")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  // Mutations (POST, PUT, DELETE)
  create: async (customer: CustomerInput) => {
    const { data, error } = await supabaseQuery("customers")
      .insert([customer])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, customer: Partial<Customer>) => {
    const { data, error } = await supabaseQuery("customers")
      .update(customer)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabaseQuery("customers").delete().eq("id", id);
    if (error) throw error;
  },
};
```

### Error Handling

Always throw errors for catch blocks:

```typescript
try {
  const customers = await customerApi.list();
} catch (error) {
  Sentry.captureException(error);
  // Handle error appropriately
}
```

---

## Database Conventions

### Column Naming

- `id` — Primary key (UUID)
- `vendor_id` — Foreign key (vendor who owns this record)
- `created_at` — Creation timestamp
- `updated_at` — Last update timestamp
- `deleted_at` — Soft delete timestamp (nullable)
- `is_active` — Boolean flags

### RLS Policies

Every table should have Row Level Security:

```sql
-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Vendors see only their own customers
CREATE POLICY customers_vendor_isolation
  ON customers
  FOR SELECT
  USING (vendor_id = auth.uid());
```

---

## Common Mistakes to Avoid

### 1. Hardcoded Colors

❌ `color: '#22C55E'`  
✅ `color: theme.colors.success`

### 2. Missing Error Handling

❌ No try-catch  
✅ Wrap in try-catch + Sentry

### 3. Mixing Icon Libraries

❌ `import { Ionicons } from '@expo/vector-icons'`  
✅ `import { Icon } from 'lucide-react-native'`

### 4. Relative Imports

❌ `import from '../../../utils'`  
✅ `import from '@/utils'`

### 5. No RLS on Tables

❌ Tables without Row Level Security  
✅ Every table has RLS policy

### 6. Uncaught Errors

❌ Silent failures  
✅ Sentry.captureException()

### 7. No Tests

❌ New code without tests  
✅ TDD workflow: test first, code second

---

## Key Resources

- **Colors & Spacing**: `src/utils/theme.ts`
- **Icons**: `lucide-react-native` (not @expo/vector-icons)
- **Design System**: `/docs/design-system.md`
- **Screen Layouts**: `/docs/ux-context.md`
- **Database**: `schema.sql`
- **UX**: `/docs/prd.md`

---

**When in doubt:** Look at existing code in the same folder. Follow its patterns.

**Before implementing:** Check the instructions guide for your task type:

- Building a screen? → `screen-development.md`
- Creating API function? → `api-development.md`
- Database change? → `database-migrations.md`
- React component? → `react-native-components.md`
