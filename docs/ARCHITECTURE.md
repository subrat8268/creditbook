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