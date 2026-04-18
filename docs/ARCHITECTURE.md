# KredBook — Architecture

> **Last Updated**: April 17, 2026
> **App Version**: 3.0
> **Status**: Simplified — Credit tracking only

---

## Product Identity

> **KredBook is a simple digital khata** — a mobile app that replaces the physical notebook for small businesses in India.

**Core Flow:**

```
People → Entries → Payments → Dashboard
```

**What's In Scope:**

- Add person (customer)
- Record what they owe (entry)
- Record what they paid (payment)
- See total outstanding (dashboard)

**What's NOT In Scope:**

- Supplier management
- Product catalog
- Reports
- Multi-user

---

## Folder Structure

### `/app` — Routes

```
app/
├── _layout.tsx                   ← Root (QueryClient, auth guard)
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   ├── resetPassword.tsx
│   ├── set-new-password.tsx
│   └── onboarding/
│       ├── business.tsx
│       ├── ready.tsx
│       └── role.tsx
│
└── (main)/
    ├── _layout.tsx               ← Bottom tab navigator (5 tabs)
    ├── dashboard/
    │   └── index.tsx             ← Home tab
    ├── people/
    │   ├── index.tsx            ← People tab
    │   ├── [customerId].tsx     ← Person detail
    │   └── _layout.tsx
    ├── entries/
    │   ├── index.tsx             ← Entries tab
    │   ├── create.tsx            ← Entry creation
    │   ├── [orderId].tsx         ← Entry detail
    │   ├── [orderId]/
    │   │   └── edit.tsx          ← Edit entry
    │   └── _layout.tsx
    ├── profile/
    │   ├── index.tsx
    │   ├── edit.tsx
    │   └── _layout.tsx
    ├── more.tsx                 ← Hidden sheet
    ├── export/
    │   └── index.tsx
    └── new-entry.tsx             ← FAB route
```

### `/src` — Source Code

```
src/
├── api/           ← Data fetching
├── components/    ← UI components
├── hooks/         ← TanStack Query + utilities
├── services/      ← Supabase client
├── store/         ← Zustand stores
├── types/         ← TypeScript types
└── utils/         ← Theme, helpers
```

---

## Key Architecture Files

| File | Purpose |
| :--- | :--- |
| `app/_layout.tsx` | Root layout with QueryClient, auth guard |
| `src/utils/theme.ts` | All design tokens (colors, spacing, typography) |
| `src/services/supabase.ts` | Supabase client |
| `src/store/authStore.ts` | User + profile state |

---

## Navigation

### Tab Bar (5 tabs)

| Tab | Route | Purpose |
| :--- | :--- | :--- |
| Home | `/dashboard` | Total outstanding + overdue list |
| People | `/people` | Customer list |
| Add Entry | `/entries/create` | Create new entry (FAB) |
| Entries | `/entries` | All entries |
| Profile | `/profile` | Settings |

### Hidden Routes

| Route | How to access |
| :--- | :--- |
| `/export` | Via More sheet |
| `/more` | Hidden tab |

---

## Screen Summary

### Dashboard (`/dashboard`)

- Total Outstanding amount
- Overdue count badge
- Add Entry button
- Top overdue people list

### People (`/people`)

- Search bar
- Inline add (Name + Phone)
- Person cards with balance
- Tap → Create entry

### Entry Detail (`/entries/[orderId]`)

- Entry number + date
- Person name + phone
- Amount + status (Paid/Pending)
- Payment history
- Send Entry (PDF)
- Record Payment

### Profile (`/profile`)

- Business name
- Language toggle (EN/HI)
- Sign Out

---

## Data Layer

### Zustand Stores

| Store | Purpose |
| :--- | :--- |
| `authStore` | User, profile, session |
| `orderStore` | Draft entry during creation |
| `languageStore` | EN/HI preference |

### TanStack Query Hooks

| Hook | Purpose |
| :--- | :--- |
| `useDashboard(vendorId)` | Total outstanding |
| `usePeople(vendorId, search)` | Customer list |
| `useEntries(vendorId)` | Entry list |
| `useCreateOrder(vendorId)` | Create entry mutation |
| `useRecordPayment(orderId)` | Record payment mutation |

### API Functions

| File | Functions |
| :--- | :--- |
| `api/entries.ts` | Create, fetch, payment |
| `api/people.ts` | Add, fetch people |
| `api/dashboard.ts` | Dashboard data |
| `api/export.ts` | CSV export |

---

## Offline-First

KredBook works without internet:

- **Reads**: TanStack Query cache serves data
- **Writes**: MMKV queue stores mutations offline
- **Sync**: Auto-sync when connection returns
- **UI**: Optimistic updates

### Implementation

| File | Responsibility |
| :--- | :--- |
| `src/lib/syncQueue.ts` | MMKV queue |
| `src/hooks/useNetworkSync.ts` | Network listener |
| `src/components/ui/SyncStatusBanner.tsx` | Sync status UI |

---

## Component Structure

### `/src/components/`

```
components/
├── dashboard/
│   ├── DashboardHeader.tsx
│   ├── ActivityRow.tsx
│   └── StatusBadge.tsx
├── feedback/
│   ├── Toast.tsx
│   ├── Loader.tsx
│   ├── EmptyState.tsx
│   └── ErrorState.tsx
├── orders/
│   ├── OrderCard.tsx
│   ├── BillFooter.tsx
│   └── OrderSummary.tsx
├── people/
│   ├── CustomerList.tsx
│   ├── CustomerCard.tsx
│   ├── NewCustomerModal.tsx
│   └── RecordCustomerPaymentModal.tsx
├── picker/
│   ├── CustomerPicker.tsx
│   └── BottomSheetPicker.tsx
└── ui/
    ├── Button.tsx
    ├── Input.tsx
    ├── SearchBar.tsx
    ├── Card.tsx
    └── FloatingActionButton.tsx
```

---

## Data Flow

### Overview

```
UI Components
     ↓ (user action)
TanStack Query (useQuery/useMutation)
     ↓ (fetch/write)
Supabase (PostgreSQL)
     ↓ (response)
TanStack Query Cache → UI Update
```

---

### State Management

Two types of state, managed separately:

| Type | Tool | Purpose | Examples |
|------|------|---------|-----------|
| **Client/Local** | Zustand | User session, preferences | Auth, language, draft entries |
| **Server** | TanStack Query | Data from API | Customers, entries, dashboard |

#### When to use Zustand

- User authentication state
- Language preference
- Draft form data (in-progress entry)
- App settings

#### When to use TanStack Query

- Any data from Supabase
- Customer lists
- Entry lists
- Dashboard totals
- Payment history

---

### Zustand Stores

| Store | Purpose | Data Type |
|-------|---------|-----------|
| `authStore` | User + profile | User object, Profile |
| `languageStore` | Language | 'en' or 'hi' |
| `orderStore` | Draft entry | In-progress entry form |
| `preferencesStore` | Feature flags | UI preferences |

**Zustand Structure:**

```typescript
// src/store/authStore.ts
interface AuthState = {
  user: User | null;
  profile: Profile | null;
  setAuth: (user) => void;
  fetchProfile: (userId) => Promise<void>;
  logout: () => void;
}
```

---

### TanStack Query

Data fetching with caching and optimistic updates.

#### Query Keys

| Key | Purpose |
|-----|---------|
| `['people', vendorId]` | All customers |
| `['people', vendorId, search]` | Filtered customers |
| `['entries', vendorId]` | All entries |
| `['dashboard', vendorId]` | Dashboard totals |
| `['orderDetail', orderId]` | Single entry |

#### Example: Fetching Customers

```typescript
// src/hooks/usePeople.ts
export function usePeople(vendorId: string, search?: string) {
  return useQuery({
    queryKey: search 
      ? ['people', vendorId, search] 
      : ['people', vendorId],
    queryFn: () => fetchPeople(vendorId, search),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

### Data Flow: Reading

```
1. Component calls useXxx() hook
2. Hook creates query with queryKey
3. TanStack Query checks cache
   - If fresh: Return cached data
   - If stale: Fetch from Supabase
4. Return data to component
5. UI renders
```

**Cache Behavior:**
- `staleTime`: Data good for 5 minutes
- `gcTime`: Cache kept for 30 minutes
- Refetch on app focus

---

### Data Flow: Writing (Mutations)

```
1. User submits form (e.g., Add Entry)
2. Component calls mutate() from TanStack Query
3. Optimistic update immediately:
   - UI shows new data (e.g., entry appears in list)
   - Balance updates instantly
4. Mutation sends to Supabase
5. 
   - Success: Invalidate related queries → Refetch
   - Failure: Show error toast, roll back UI
```

**Optimistic Update Pattern:**

```typescript
const createOrderMutation = useMutation({
  mutationFn: (data) => createOrder(data),
  onSuccess: () => {
    // Refresh related queries
    queryClient.invalidateQueries({ queryKey: ['entries', vendorId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard', vendorId] });
  },
});
```

---

### Offline Sync Behavior

**When offline:**

1. **Writes queued locally**: Mutations saved to MMKV queue
2. **UI updates optimistically**: Data appears immediately
3. **Sync banner shows**: "Offline - X saved locally"

**When back online:**

1. **Queue processed FIFO**: Each mutation replayed to Supabase
2. **Sync banner shows**: "Syncing X changes..."
3. **Success**: Banner shows "All synced"

**Flow:**

```
Offline Mutation
     ↓
MMKV Queue (local storage)
     ↓
Network listener detects online
     ↓
Process queue (FIFO order)
     ↓
Each mutation → Supabase
     ↓
Success: Update cache
Failure: Show error, keep in queue
```

---

### Query Client Setup

In `app/_layout.tsx`:

```typescript
const [queryClient] = useState(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          gcTime: 30 * 60 * 1000,
          retry: 1,
          refetchOnWindowFocus: true,
        },
        mutations: {
          retry: 1,
        },
      },
    }),
);
```

---

### Summary: When to Use What

| Need | Use |
|------|-----|
| User logged in | `useAuthStore()` |
| Language setting | `useLanguageStore()` |
| Get all customers | `usePeople()` |
| Get entries | `useEntries()` |
| Get dashboard | `useDashboard()` |
| Create entry | `useCreateOrder()` |
| Record payment | `useRecordPayment()` |
| Draft form data | `useOrderStore()` |

---

## Known Issues

| Issue | Status |
| :--- | :--- |
| Old `/orders` route removed | ✅ Cleaned |
| Old `/suppliers` route removed | ✅ Cleaned |
| Old `/products` route removed | ✅ Cleaned |
| Settings screen unused | ✅ Hidden from nav |

---

## Updates Required

When making changes:

1. Update this ARCHITECTURE.md
2. Update PRD if adding/removing features
3. Keep STATUS.md in sync

**Rule:** Document first, then code.