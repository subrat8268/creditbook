# Screen Development Guide

Navigate properly, handle state, optimize lists.

## Screen File Structure

```tsx
// app/(main)/customers/index.tsx

import { View, FlatList, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/utils/theme";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerCard } from "@/components/customers/CustomerCard";
import { FAB } from "@/components/fab/FAB";

export default function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const { data: customers, isLoading } = useCustomers();

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={customers}
          renderItem={({ item }) => <CustomerCard customer={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: insets.bottom + theme.spacing.xl,
          }}
        />
      )}

      <FAB icon="Plus" onPress={() => router.push("/customers/new")} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
```

## SafeAreaView

Always protect content from notches and home indicators:

```tsx
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen() {
  return (
    <SafeAreaView style={styles.container}>{/* Screen content */}</SafeAreaView>
  );
}
```

## Status Bar

```tsx
import { StatusBar } from "expo-status-bar";

export function Screen() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>{/* content */}</SafeAreaView>
    </>
  );
}
```

## FlatList Optimization

### Always Use keyExtractor

```tsx
<FlatList
  data={customers}
  renderItem={({ item }) => <CustomerCard customer={item} />}
  keyExtractor={(item) => item.id} // ← Required
/>
```

### Handle Empty State

```tsx
<FlatList
  data={customers}
  renderItem={({ item }) => <CustomerCard customer={item} />}
  keyExtractor={(item) => item.id}
  ListEmptyComponent={<EmptyState message="No customers found" />}
/>
```

### Handle Loading State

```tsx
const { data: customers, isLoading } = useCustomers();

if (isLoading) {
  return <LoadingSpinner />;
}

return (
  <FlatList
    data={customers}
    // ...
  />
);
```

### Pagination for Large Lists

```tsx
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export function CustomersScreen() {
  const { data, isLoading, loadMore } = useInfiniteScroll(
    async (page) => await customerApi.list({ page }),
  );

  return (
    <FlatList
      data={data}
      onEndReached={() => loadMore()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isLoading ? <Spinner /> : null}
    />
  );
}
```

## Navigation

### Navigate with router

```tsx
import { useRouter } from "expo-router";

export function Screen() {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push("/customers/new")}>
      {/* content */}
    </Pressable>
  );
}
```

### Pass Parameters

```tsx
// Navigate to detail with ID
router.push({
  pathname: "/customers/[customerId]",
  params: { customerId: customer.id },
});

// Receive parameter
import { useLocalSearchParams } from "expo-router";

export default function CustomerDetailScreen() {
  const params = useLocalSearchParams<{ customerId: string }>();
  const customerId = params.customerId!;

  const { data: customer } = useCustomer(customerId);

  return <View>{/* ... */}</View>;
}
```

## Screen State Management

### With TanStack Query

```tsx
import { useQuery } from "@tanstack/react-query";

export function CustomersScreen() {
  const {
    data: customers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: customerApi.list,
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return <FlatList data={customers} /* ... */ />;
}
```

### Or use Custom Hooks

```tsx
// src/hooks/useCustomers.ts
export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await customerApi.list();
        setCustomers(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { customers, isLoading, error };
}
```

## Common Screen Layouts

### List with Header

```tsx
<SafeAreaView style={styles.container}>
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Customers</Text>
  </View>

  <FlatList
    data={customers}
    renderItem={({ item }) => <CustomerCard customer={item} />}
    keyExtractor={(item) => item.id}
  />
</SafeAreaView>
```

### List with Floating Action Button (FAB)

```tsx
<SafeAreaView style={styles.container}>
  <FlatList
    data={customers}
    renderItem={({ item }) => <CustomerCard customer={item} />}
    keyExtractor={(item) => item.id}
  />

  <Pressable style={styles.fab} onPress={() => router.push("/customers/new")}>
    <Plus size={24} color="white" />
  </Pressable>
</SafeAreaView>
```

### Detail Screen with Scroll

```tsx
<SafeAreaView style={styles.container}>
  <ScrollView contentContainerStyle={styles.content}>
    <CustomerHeader customer={customer} />
    <CustomerTransactions transactions={customer.transactions} />
    <CustomerNotes customer={customer} />
  </ScrollView>

  <View style={styles.footer}>
    <Button title="Edit" onPress={openEdit} />
  </View>
</SafeAreaView>
```

## Error Handling

```tsx
const { data: customer, error, isLoading } = useCustomer(id);

if (isLoading) return <Spinner />;
if (error) {
  return (
    <SafeAreaView style={styles.container}>
      <ErrorMessage message="Failed to load customer" onRetry={refetch} />
    </SafeAreaView>
  );
}

return <DisplayCustomer customer={customer} />;
```

## Screen Performance Tips

1. **Memoize components** that don't need to re-render
2. **Use FlatList** instead of ScrollView for long lists
3. **Lazy-load images** for large lists
4. **Cancel requests** when screen unmounts
5. **Debounce** search/filter inputs

---

**Remember:** Screens are the glue between data (hooks) and UI (components). Keep logic minimal.
