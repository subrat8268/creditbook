# KredBook — Component Architecture

> **Last Updated**: April 18, 2026
> **Version**: v3.0

---

## Component Categories

### 1. UI Components (Base)

Building blocks used throughout the app.

| Component | Location | Purpose |
|-----------|----------|---------|
| `Button` | `src/components/ui/Button.tsx` | Primary/secondary actions |
| `Input` | `src/components/ui/Input.tsx` | Text/numeric input fields |
| `Card` | `src/components/ui/Card.tsx` | Base card container |
| `SearchBar` | `src/components/ui/SearchBar.tsx` | Search input with icon |
| `FloatingActionButton` | `src/components/ui/FloatingActionButton.tsx` | FAB for main actions |
| `StatusDot` | `src/components/ui/StatusDot.tsx` | Small status indicator |
| `ConfirmModal` | `src/components/ui/ConfirmModal.tsx` | Confirmation dialogs |
| `AuthCard` | `src/components/ui/AuthCard.tsx` | Auth screen card |
| `AuthHeader` | `src/components/ui/AuthHeader.tsx` | Auth screen header |
| `AuthDivider` | `src/components/ui/AuthDivider.tsx` | "Or" divider in auth |
| `GoogleButton` | `src/components/ui/GoogleButton.tsx` | Google OAuth button |
| `GoogleLogo` | `src/components/ui/GoogleLogo.tsx` | Google logo asset |
| `Avatar` | `src/components/ui/Avatar.tsx` | Person avatar with initials |
| `SectionHeader` | `src/components/ui/SectionHeader.tsx` | Section title |

### 2. Feedback / State Components

User feedback and loading states.

| Component | Location | Purpose |
|-----------|----------|---------|
| `Toast` | `src/components/feedback/Toast.tsx` | Success/error notifications (animated) |
| `Loader` | `src/components/feedback/Loader.tsx` | Loading spinner |
| `Skeleton` | `src/components/feedback/Skeleton.tsx` | Shimmer loading placeholder |
| `EmptyState` | `src/components/feedback/EmptyState.tsx` | Empty list state (fade-in) |
| `ErrorState` | `src/components/feedback/ErrorState.tsx` | Error display |
| `SyncStatusBanner` | `src/components/feedback/SyncStatusBanner.tsx` | Offline/sync status |
| `SyncStatus` | `src/components/feedback/SyncStatus.tsx` | Compact sync indicator (consolidated) |
| `OfflineToastListener` | `src/components/feedback/OfflineToastListener.tsx` | Offline listener |

### 3. Domain Components (Business Logic)

Components tied to business entities.

#### People/Customers

| Component | Location | Purpose |
|-----------|----------|---------|
| `CustomerCard` | `src/components/people/CustomerCard.tsx` | Person list item |
| `CustomerList` | `src/components/people/CustomerList.tsx` | Person list container |
| `NewCustomerModal` | `src/components/people/NewCustomerModal.tsx` | Add person form |
| `RecordCustomerPaymentModal` | `src/components/people/RecordCustomerPaymentModal.tsx` | Payment recording |
| `CustomersHeader` | `src/components/people/CustomersHeader.tsx` | People screen header |
| `WhatsAppShareButton` | `src/components/people/WhatsAppShareButton.tsx` | Share via WhatsApp |
| `ContactsPickerModal` | `src/components/people/ContactsPickerModal.tsx` | Import contacts |

#### Entries (formerly Orders)

Entry components are now inline in screen files for simplicity.

#### Dashboard

| Component | Location | Purpose |
|-----------|----------|---------|
| `DashboardHeader` | `src/components/dashboard/DashboardHeader.tsx` | Dashboard top bar |
| `ActivityRow` | `src/components/dashboard/ActivityRow.tsx` | Activity list item |
| `StatusBadge` | `src/components/dashboard/StatusBadge.tsx` | Status chip |

### 4. Layout Components

Structural components.

| Component | Location | Purpose |
|-----------|----------|---------|
| `StackHeader` | `src/components/navigation/StackHeader.tsx` | Stack screen header |
| `OnboardingProgress` | `src/components/onboarding/OnboardingProgress.tsx` | Progress indicator |

### 5. Picker Components

Selection modals.

| Component | Location | Purpose |
|-----------|----------|---------|
| `CustomerPicker` | `src/components/picker/CustomerPicker.tsx` | Select person |
| `BottomSheetPicker` | `src/components/picker/BottomSheetPicker.tsx` | Base bottom sheet |
| `SearchablePickerModal` | `src/components/SearchablePickerModal.tsx` | Generic searchable picker |

---

## What SHOULD Be Shared

### Already Properly Shared

| Pattern | Components Using |
|---------|-----------------|
| Colors from `theme.ts` | All components |
| Typography from `theme.ts` | All components |
| `Button` component | Forms, modals, CTAs |
| `Input` component | All screens |
| `Toast` hook | All mutations |

### Should Be Shared (Create/Extract)

| Component | Currently | Should Be |
|-----------|-----------|------------|
| **Avatar** | Duplicated in OrderCard, CustomerCard, many screens | `Avatar.tsx` component |
| **StatusBadge** | Similar to StatusDot | Unified status component |
| **SectionHeader** | Duplicated in multiple screens | `SectionHeader.tsx` |
| **EmptyList** | Similar empty states in People, Entries | Generic EmptyList |

---

## What Should NOT Be Duplicated

### Identified Duplications

| Issue | Locations | Solution |
|-------|-----------|----------|
| **CustomerCard ≈ OrderCard** | Both show avatar + name + amount + status | Create `PersonCard` base |
| **StatusDot ≈ StatusBadge** | Similar appearance, different names | Consolidate to one |
| **OrderBillSummary ≈ OrderSummary** | Unclear difference | Merge or clarify |
| **SyncStatus ≈ SyncStatusIndicator ≈ SyncStatusBanner** | 3 components for sync | Keep one, use variants |
| **CustomerPicker ≈ SearchablePickerModal** | Both do similar selection | Refactor to share logic |

---

## Refactoring Opportunities

### Priority 1: Create Avatar Component

**Current:** Avatar logic duplicated in 6+ places
**Proposed:**

```tsx
// src/components/ui/Avatar.tsx
interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string; // optional override
}
```

**Usage:** Replace all inline avatar code with `<Avatar name={name} />`

### Priority 2: Consolidate Sync Status

**Current:** 3 components for sync status
**Proposed:**

```tsx
// src/components/feedback/SyncStatus.tsx
interface SyncStatusProps {
  variant: 'inline' | 'banner' | 'compact';
  // rest props handled internally
}
```

### Priority 3: Unify OrderCard + CustomerCard

**Current:** Two similar cards
**Proposed:**

```tsx
// src/components/ui/PersonCard.tsx
interface PersonCardProps {
  person: Person;
  type: 'customer' | 'entry';
  onPress: () => void;
  onLongPress?: () => void;
}
```

### Priority 4: Simplify Picker Architecture

**Current:** CustomerPicker, SearchablePickerModal, BottomSheetPicker
**Proposed:** One picker system with variants

### Priority 5: Extract Section Headers

**Current:** Repeated section label patterns
**Proposed:**

```tsx
// src/components/ui/SectionHeader.tsx
interface SectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void };
}
```

---

## Component Hierarchy

```
UI Layer (Base)
├── Button, Input, Card, SearchBar
├── Avatar (needs creation)
├── StatusBadge (needs consolidation)
└── SectionHeader (needs creation)

Feedback Layer
├── Toast, Loader
├── EmptyState, ErrorState
└── SyncStatus (needs consolidation)

Domain Layer (Business)
├── People: CustomerCard, CustomerList, NewCustomerModal
├── Orders: OrderCard, OrderList, BillFooter
└── Dashboard: DashboardHeader, ActivityRow

Picker Layer
└── CustomerPicker, SearchablePickerModal (needs refactor)
```

---

## File Organization Recommendation

```
src/components/
├── ui/                    # Base UI components
│   ├── Avatar.tsx        # NEW
│   ├── SectionHeader.tsx # NEW
│   ├── StatusBadge.tsx   # Consolidate
│   ├── Button.tsx
│   ├── Input.tsx
│   └── ...
├── feedback/            # Feedback components
│   ├── SyncStatus.tsx   # Consolidate
│   ├── Toast.tsx
│   └── ...
├── people/              # Customer domain
├── orders/              # Entry domain
├── dashboard/           # Dashboard domain
└── picker/              # Picker components
```

---

## Summary

| Category | Count | Status |
|-----------|-------|--------|
| UI Components | 12 | Good |
| Feedback | 8 | Needs consolidation |
| Domain | 17 | Good |
| Layout | 2 | Good |
| Pickers | 3 | Needs refactor |

### Quick Wins

1. **Create Avatar component** — 5+ duplicate implementations
2. **Consolidate SyncStatus** — 3 → 1 component
3. **Unify OrderCard/CustomerCard** — Reduce duplication
4. **Simplify Pickers** — One system not three

---

*For implementation, see `docs/ARCHITECTURE.md`*