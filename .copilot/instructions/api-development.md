# API Development Guide

## API File Organization

```typescript
// src/api/customers.ts - One file per domain

import { supabaseQuery } from "@/lib/supabaseQuery";
import { Customer, CustomerInput } from "@/types/customers";

export const customerApi = {
  // QUERIES (GET) - read-only operations
  list: async (filters?: { page?: number }) => {
    // ...
  },

  get: async (id: string) => {
    // ...
  },

  // MUTATIONS (POST, PUT, DELETE) - modify data
  create: async (customer: CustomerInput) => {
    // ...
  },

  update: async (id: string, customer: Partial<Customer>) => {
    // ...
  },

  delete: async (id: string) => {
    // ...
  },
};
```

## Query Pattern

```typescript
export const customerApi = {
  list: async () => {
    const { data, error } = await supabaseQuery("customers")
      .select("*")
      .eq("vendor_id", getCurrentVendorId()) // Respect RLS
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }

    return data as Customer[];
  },

  get: async (id: string) => {
    const { data, error } = await supabaseQuery("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch customer: ${error.message}`);
    }

    return data as Customer;
  },
};
```

## Mutation Pattern

```typescript
export const customerApi = {
  create: async (customer: CustomerInput) => {
    const { data, error } = await supabaseQuery("customers")
      .insert([
        {
          ...customer,
          vendor_id: getCurrentVendorId(), // Always set vendor_id
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    return data as Customer;
  },

  update: async (id: string, updates: Partial<Customer>) => {
    const { data, error } = await supabaseQuery("customers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }

    return data as Customer;
  },

  delete: async (id: string) => {
    const { error } = await supabaseQuery("customers").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  },
};
```

## Error Handling

**Always throw errors for hooks to catch:**

```typescript
✅ Good:
export const customerApi = {
  get: async (id: string) => {
    const { data, error } = await supabaseQuery('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch customer: ${error.message}`);
    }

    return data;
  },
};

❌ Bad (error silently returned):
export const customerApi = {
  get: async (id: string) => {
    const { data, error } = await supabaseQuery('customers')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };  // Don't swallow errors
  },
};
```

## Using with React Hooks

```typescript
// src/hooks/useCustomers.ts
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/api/customers";

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: customerApi.list,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => customerApi.get(id),
  });
}
```

```typescript
// src/hooks/useCreateCustomer.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "@/api/customers";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.create,
    onSuccess: () => {
      // Invalidate cache so list re-fetches
      queryClient.invalidateQueries(["customers"]);
    },
  });
}
```

## Using in Components

```tsx
import { useCustomers, useCreateCustomer } from '@/hooks';

export function CustomersScreen() {
  const { data: customers, isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();

  const handleCreate = async (customer: CustomerInput) => {
    try {
      await createCustomer.mutateAsync(customer);
      showSuccessToast('Customer created');
    } catch (error) {
      Sentry.captureException(error);
      showErrorToast('Failed to create customer');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    // ...
  );
}
```

## Pagination

```typescript
export const customerApi = {
  list: async (page = 1) => {
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    const { data, error } = await supabaseQuery("customers")
      .select("*")
      .range(offset, offset + pageSize - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }

    return data as Customer[];
  },
};
```

## Search/Filtering

```typescript
export const customerApi = {
  search: async (query: string) => {
    const { data, error } = await supabaseQuery("customers")
      .select("*")
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to search customers: ${error.message}`);
    }

    return data as Customer[];
  },
};
```

## Type Safety

Always define input types:

```typescript
// src/types/customers.ts
export interface Customer {
  id: string;
  vendor_id: string;
  name: string;
  phone: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerInput {
  name: string;
  phone: string;
  // Don't include id, vendor_id, timestamps
}
```

## Aggregate Functions

For complex operations:

```typescript
export const reportApi = {
  customerBalance: async (customerId: string) => {
    const { data, error } = await supabaseQuery("payments")
      .select("amount")
      .eq("customer_id", customerId);

    if (error) {
      throw new Error(`Failed to fetch balance: ${error.message}`);
    }

    const balance = data.reduce((sum, p) => sum + p.amount, 0);
    return balance;
  },
};
```

## Transaction Pattern

```typescript
// For multi-step operations
export const orderApi = {
  recordOrder: async (order: OrderInput) => {
    // Step 1: Create order
    const { data: newOrder, error: orderError } = await supabaseQuery("orders")
      .insert([order])
      .select()
      .single();

    if (orderError) throw orderError;

    // Step 2: Update customer
    const { error: updateError } = await supabaseQuery("customers")
      .update({ last_order_at: new Date() })
      .eq("id", order.customer_id);

    if (updateError) {
      // If update fails, consider rolling back order creation
      throw updateError;
    }

    return newOrder;
  },
};
```

---

**Key Rules:**

1. One file per domain (customers.ts, orders.ts, payments.ts)
2. Group by query vs mutation
3. Always throw errors, don't return { data, error }
4. Use type-safe inputs and outputs
5. Respect RLS policies
6. Handle pagination/filtering
