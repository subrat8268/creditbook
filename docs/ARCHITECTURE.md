# KredBook Architecture

> Phase 1 truth-reset version.

## Product Shape

KredBook is a **strict single-mode digital khata**.

Active product flow:

```text
Dashboard → People → Entries → Payments → Profile
```

## Active Scope

- Customers
- Entries
- Payments
- Dashboard
- Profile
- Offline-first sync
- EN/HI localization
- CSV export

## Out of Scope

The following are out of scope unless explicitly marked legacy or transitional:

- Suppliers
- Distributor mode
- Party abstraction as primary product language
- Product catalog
- Reports
- GST
- Multi-user
- Notifications/reminders as active product features

## Technical Stack

| Area | Choice |
|---|---|
| App | React Native + Expo |
| Routing | Expo Router |
| Server/backend | Supabase |
| Local state | Zustand |
| Server state | TanStack Query |
| Offline writes | MMKV-backed queue |
| Styling | NativeWind + `src/utils/theme.ts` |

## Route Model

### Active routes

```text
app/
├── _layout.tsx
├── (auth)/
│   ├── login.tsx
│   ├── signup.tsx
│   ├── resetPassword.tsx
│   ├── set-new-password.tsx
│   ├── phone-setup.tsx
│   └── onboarding/
├── (main)/
│   ├── dashboard/
│   ├── people/
│   ├── entries/
│   ├── profile/
│   ├── export/
│   └── new-entry.tsx
└── profile-error.tsx
```

### Important notes

- Export exists as its own hidden route and is reached from the Profile area.
- The repo should not describe a hidden **More sheet** as active architecture.
- Some route identifiers still use legacy names such as `[orderId]`. Those are transitional implementation surfaces, not canonical product language.
- A notifications route or permission may still exist in code/config. That should be treated as **legacy or transitional**, not active product scope.

## Screen Model

| Screen | Purpose |
|---|---|
| Dashboard | Total outstanding and collection-focused overview |
| People | Customer list and quick customer actions |
| Entries | Entry list and entry detail flow |
| Profile | Business/profile settings, language, export, sign out |

## State Model

### Zustand

Used for local/app state such as:
- auth/session state
- language preference
- draft entry state
- preferences and local flags

### TanStack Query

Used for server-backed data such as:
- customer lists and details
- entry lists and details
- payments and related mutations
- dashboard summaries

## Current Data-Layer Reality

Canonical product nouns are **Customer / Entry / Payment**.

The implementation still includes some transitional internals such as:
- `orderStore`
- `useCreateOrder`
- `orderId`
- `useParties`

These are legacy or transitional surfaces. They should not be treated as the product contract.

## Offline-First Model

KredBook is expected to:
- read from cache when offline
- queue writes locally
- sync automatically when connectivity returns
- keep the UI responsive with optimistic updates where appropriate

Primary implementation surfaces:
- `src/lib/syncQueue.ts`
- `src/hooks/useNetworkSync.ts`
- sync-status UI components

## Component Architecture

Primary component domains:
- `src/components/ui/`
- `src/components/feedback/`
- `src/components/people/`
- `src/components/dashboard/`
- `src/components/picker/`

The repo also still contains `src/components/orders/` as a transitional/legacy folder tied to entry flows. Do not describe it as the active product-domain name.

## Design-System Rule

`src/utils/theme.ts` is the design-token source of truth.

Documentation may explain token usage, but it must not override actual token values from:
- `src/utils/theme.ts`
- `tailwind.config.js`

## Architecture Drift Rule

If a concept exists in code but is out of scope, document it honestly as:
- legacy
- transitional

Do not mark it removed unless it is actually removed.
