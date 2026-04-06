# Project Organization Guide

## Recommended Folder Structure for AI-Friendly Development

The following structure helps Copilot understand your codebase and auto-route to the right agent:

---

## Source Code Organization

```
src/
├── api/                        ← Backend agent routes here
│   ├── customers.ts            (customer queries & mutations)
│   ├── orders.ts               (order queries & mutations)
│   ├── payments.ts             (payment queries & mutations)
│   ├── suppliers.ts            (supplier queries & mutations)
│   ├── products.ts
│   ├── dashboard.ts
│   └── ...
│
├── components/                 ← React Native agent routes here
│   ├── customers/              (all customer-related UI)
│   │   ├── CustomerCard.tsx
│   │   ├── CustomerList.tsx
│   │   ├── CustomerDetail.tsx
│   │   └── CustomerForm.tsx
│   │
│   ├── orders/                 (all order-related UI)
│   ├── suppliers/              (all supplier-related UI)
│   ├── payments/               (payment-related UI)
│   ├── products/               (product-related UI)
│   │
│   ├── ui/                     (reusable UI primitives)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   │
│   ├── feedback/               (toasts, loaders, errors)
│   │   ├── Toast.tsx
│   │   ├── Loader.tsx
│   │   └── ErrorBoundary.tsx
│   │
│   ├── navigation/             (navigation components)
│   ├── onboarding/             (auth flow UI)
│   └── sheets/                 (bottom sheets, modals)
│
├── hooks/                      ← Queries & state management
│   ├── useCustomers.ts         (TanStack Query hook)
│   ├── useCustomerDetail.ts
│   ├── useOrders.ts
│   ├── useOrderFilters.ts
│   ├── usePayments.ts
│   ├── useSuppliers.ts
│   ├── useProducts.ts
│   ├── useDashboard.ts
│   ├── useAuth.ts              (authentication state)
│   ├── useLogin.ts
│   ├── useDebounce.ts
│   ├── useInfiniteScroll.ts
│   └── useFontsLoader.ts
│
├── types/                      ← TypeScript definitions
│   ├── customers.ts
│   ├── orders.ts
│   ├── payments.ts
│   ├── common.ts
│   └── api.ts
│
├── utils/                      ← Utility functions
│   ├── theme.ts                (colors, typography, spacing)
│   ├── formatting.ts          (INR, dates, numbers)
│   ├── validation.ts          (form validation, schema)
│   ├── secureStorage.ts       (encrypted storage)
│   └── supabaseQuery.ts       (Supabase helpers)
│
├── i18n/                       ← Internationalization
│   ├── en.ts                   (English strings)
│   ├── hi.ts                   (Hindi strings)
│   └── index.ts
│
├── services/                   ← Third-party integrations
│   ├── sentry.ts              (error tracking)
│   ├── firebase.ts            (if using Firebase)
│   └── ...
│
└── store/                      ← Global state (if needed)
    ├── authStore.ts
    └── ...

app/                           ← Expo Router navigation
├── _layout.tsx                (root layout)
├── index.tsx                  (home/splash route)
│
├── (auth)/                    (auth group, no drawer)
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   ├── resetPassword.tsx
│   ├── set-new-password.tsx
│   └── onboarding/
│       ├── _layout.tsx
│       └── ...
│
└── (main)/                    (main app group, with drawer)
    ├── _layout.tsx            (drawer navigator)
    ├── dashboard/
    │   ├── _layout.tsx
    │   └── index.tsx
    ├── customers/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   └── [customerId].tsx
    ├── orders/
    ├── payments/
    ├── suppliers/
    ├── products/
    ├── reports/
    ├── notifications/
    ├── export/
    ├── profile/
    └── more.tsx
```

---

## Documentation Organization

```
docs/
├── README.md                   ← Project overview
├── ARCHITECTURE.md             ← System design & data flow
├── design-system.md            ← Colors, typography, components
├── prd.md                      ← Product requirements document
├── ux-context.md              ← Every screen's UX & layout
├── Audit-README.md            ← Audit system docs
├── design-audit.md            ← Audit design details
│
├── image/
│   └── prd/                   ← Screenshot references
│
└── superpowers/               ← Copilot workflows
    └── plans/                 ← Sprint & task planning
```

---

## Configuration Files

```
.copilot/                      ← GitHub Copilot setup
├── agents.config.json         ← Agent definitions
├── instructions/              ← KredBook conventions
├── skills/                    ← Advanced workflows
├── prompts/                   ← Reusable templates
├── README.md
├── SETUP.md
├── QUICK_REF.md
├── INDEX.md
└── FOLDER_STRUCTURE.md

.vscode/                       ← VS Code configuration
├── settings.json
└── extensions.json

.cursor/                       ← Cursor AI configuration (if using)

.git/                          ← Git repository

supabase/                      ← Supabase migrations
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_add_audit_tables.sql
    └── ...

android/                       ← Android native code (Gradle)
└── app/
    └── src/

e2e/                          ← End-to-end tests (Detox/Jest)
├── jest.config.js
└── starter.test.js

scripts/                       ← Build & utility scripts
└── design-audit.sh
```

---

## Why This Structure Matters for Copilot

### File Pattern Routing

Copilot's agent selection works by file patterns:

```json
// From agents.config.json
{
  "pattern": "src/screens/.*\\.(tsx|ts)$",
  "agent": "react-native",    ← Automatically chosen
  "priority": 8
},
{
  "pattern": "src/api/.*\\.(tsx|ts)$",
  "agent": "backend",         ← Automatically chosen
  "priority": 8
}
```

When you edit `src/api/customers.ts`:

- Copilot **automatically** switches to Backend agent
- No need to type `copilot:backend`
- Agent understands SQL, Supabase, database concepts

When you edit `src/components/customers/CustomerCard.tsx`:

- Copilot **automatically** switches to React Native agent
- No need to type `copilot:feature`
- Agent understands React, Expo, mobile patterns

### Domain Grouping

Files grouped by **business domain** (customers, orders, suppliers) instead of **file type** (components, screens, utils):

❌ **Bad**: `components/Cards/`, `screens/DetailScreen/`, `api/getCustomers/`
→ Copilot can't see the customer domain connection

✅ **Good**: `components/customers/`, `api/customers.ts`, `hooks/useCustomers.ts`
→ Copilot sees all customer-related code together

---

## Growth Strategy

### Phase 1: MVP (Current)

- Core screens: Dashboard, Customers, Orders, Suppliers
- Core APIs: customers, orders, payments, suppliers, products
- Authentication & authorization working

### Phase 2: Advanced Features

- Reports & Analytics
- Bulk Import/Export
- Advanced Filtering & Search
- Mobile-specific optimizations

### Phase 3: Scaling

- Offline-first sync
- Real-time notifications
- Advanced RLS policies
- Performance optimization

**For each phase**: Keep domain-based organization. Add new folders as needed:

```
Phase 2:
+ src/components/reports/
+ src/api/reports.ts
+ src/hooks/useReports.ts

Phase 3:
+ src/services/offline-sync.ts
+ src/utils/replicationClient.ts
+ src/types/sync.ts
```

---

## Naming Conventions

### React Components

```tsx
// Use PascalCase for component files
CustomerCard.tsx
CustomerList.tsx
CustomerFormModal.tsx

// Hook files use camelCase
useCustomers.ts
useCustomerDetail.ts
useOrderFilters.ts

// API files use snake_case for functions but camelCase for files
customers.ts         ← File
api/customers.ts     ← Contains getCustomers(), updateCustomer(), etc.
```

### Folders

```
Feature-based names (customers, orders, suppliers, not screens, ui, etc.)
camelCase: components/customers/, api/customers/, hooks/useCustomers/
```

### Constants & Utils

```
export const CUSTOMER_BATCH_SIZE = 50;
export const DEFAULT_CURRENCY = 'INR';
export const theme = { ... };
```

---

## Colocation Principle

Keep related code close:

```
✅ DO:
src/
├── components/customers/
│   ├── CustomerCard.tsx
│   ├── CustomerList.tsx
│   ├── CustomerCard.test.tsx        ← Test next to component
│   └── CustomerCard.styles.ts       ← Styles next to component
│
└── api/
    ├── customers.ts
    └── customers.test.ts            ← Tests next to API file

❌ DON'T:
src/
├── components/  ← All components here
├── tests/       ← All tests here (separated)
└── styles/      ← All styles here (separated)
```

---

## Import Path Conventions

```tsx
// Use absolute imports (from tsconfig.json)
import { CustomerCard } from '@/components/customers/CustomerCard');
import { useCustomers } from '@/hooks/useCustomers';
import { theme } from '@/utils/theme';

// Avoid relative imports
❌ import { theme } from '../../../utils/theme';
✅ import { theme } from '@/utils/theme';
```

---

## Database Schema Organization

```sql
-- In supabase/migrations/

-- 001: Core tables
CREATE TABLE customers (...)
CREATE TABLE orders (...)
CREATE TABLE payments (...)
CREATE TABLE suppliers (...)
CREATE TABLE products (...)

-- 002: Audit tables
CREATE TABLE audit_log (...)
CREATE TABLE audit_bills (...)

-- 003: RLS policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customers_vendor_isolation ...

-- 004: Indexes & optimizations
CREATE INDEX idx_customers_vendor_id ...
CREATE INDEX idx_orders_customer_id ...
```

---

## .gitignore Organization

```
# Dependencies
node_modules/
.expo/
android/.gradle/
ios/Pods/

# Build outputs
build/
dist/
.next/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/settings.json        ← Team settings are committed
.idea/
*.swp
*.swo

# Tests
coverage/
.jest-cache/

# Logs
logs/
*.log
```

---

## When to Refactor Folder Structure

### ✅ Good reasons to refactor

- Copilot is routing to wrong agent (file pattern issue)
- Team can't find related files (organization is confusing)
- New feature domain needs 10+ files (time to create new folder)
- Business domain changed significantly

### ❌ Avoid refactoring for

- Personal preference ("I like alphabetical folders")
- Minor convenience ("saves 1 directory level")
- Following a framework default that doesn't match your domain

---

## Team Communication

Document your structure:

```
# In README.md or docs/:

## Project Organization

Our code is organized by **business domain**, not file type:

- `src/api/` — Backend queries & mutations
- `src/components/[domain]/` — UI components (grouped by feature)
- `src/hooks/` — React hooks (TanStack Query, auth, custom)
- `src/utils/` — Utilities (colors, formatting, validation)

Example: Customer feature
- `src/api/customers.ts` — API calls
- `src/components/customers/` — UI components
- `src/hooks/useCustomers.ts` — TanStack Query hook
- `src/types/customers.ts` — TypeScript types

This helps both humans and Copilot understand the codebase.
```

---

**Version**: 1.0  
**Last Updated**: April 7, 2026  
**Why this matters**: Copilot's file-based auto-routing depends on clear folder structure. Well-organized code = smarter agents.
