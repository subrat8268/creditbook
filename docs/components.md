# KredBook Component Architecture

> Phase 1 truth-reset inventory.

## Purpose

This file documents the component model for the active single-mode product and calls out transitional or legacy surfaces honestly.

## Base UI Components

| Component | Location | Purpose |
|---|---|---|
| `Button` | `src/components/ui/Button.tsx` | Primary actions |
| `Input` | `src/components/ui/Input.tsx` | Text and numeric inputs |
| `Card` | `src/components/ui/Card.tsx` | Shared card container |
| `SearchBar` | `src/components/ui/SearchBar.tsx` | Search input |
| `FloatingActionButton` | `src/components/ui/FloatingActionButton.tsx` | Reusable FAB primitive |
| `Avatar` | `src/components/ui/Avatar.tsx` | Customer avatar |
| `ConfirmModal` | `src/components/ui/ConfirmModal.tsx` | Confirmation modal |
| `SectionHeader` | `src/components/ui/SectionHeader.tsx` | Reusable section header |

## Feedback Components

| Component | Location | Purpose |
|---|---|---|
| `Toast` | `src/components/feedback/Toast.tsx` | Success/error feedback |
| `Loader` | `src/components/feedback/Loader.tsx` | Loading state |
| `Skeleton` | `src/components/feedback/Skeleton.tsx` | Placeholder loading |
| `EmptyState` | `src/components/feedback/EmptyState.tsx` | Empty state |
| `ErrorState` | `src/components/feedback/ErrorState.tsx` | Error display |
| `SyncStatusBanner` | `src/components/ui/SyncStatusBanner.tsx` | Sync banner |
| `SyncStatus` | `src/components/feedback/SyncStatus.tsx` | Compact sync status |
| `OfflineToastListener` | `src/components/feedback/OfflineToastListener.tsx` | Offline event feedback |

## Customer / People Components

| Component | Location | Purpose |
|---|---|---|
| `CustomerCard` | `src/components/people/CustomerCard.tsx` | Customer list item |
| `CustomerList` | `src/components/people/CustomerList.tsx` | Customer list container |
| `CustomersHeader` | `src/components/people/CustomersHeader.tsx` | People screen header |
| `NewCustomerModal` | `src/components/people/NewCustomerModal.tsx` | Add customer flow |
| `RecordCustomerPaymentModal` | `src/components/people/RecordCustomerPaymentModal.tsx` | Payment recording |
| `ContactsPickerModal` | `src/components/people/ContactsPickerModal.tsx` | Import contacts |
| `WhatsAppShareButton` | `src/components/people/WhatsAppShareButton.tsx` | Share helper |

## Dashboard Components

| Component | Location | Purpose |
|---|---|---|
| `DashboardHeader` | `src/components/dashboard/DashboardHeader.tsx` | Dashboard header / summary |
| `ActivityRow` | `src/components/dashboard/ActivityRow.tsx` | Activity row |
| `StatusBadge` | `src/components/dashboard/StatusBadge.tsx` | Status chip |

## Picker Components

| Component | Location | Purpose |
|---|---|---|
| `CustomerPicker` | `src/components/picker/CustomerPicker.tsx` | Customer selection |
| `BottomSheetPicker` | `src/components/picker/BottomSheetPicker.tsx` | Bottom-sheet picker base |

## Transitional / Legacy Components

These components or folders still exist but should not define active product language:

| Surface | Status | Note |
|---|---|---|
| `src/components/orders/` | Transitional | Supports entry-related flows but uses legacy naming |
| order-oriented component names | Transitional | Do not use as canonical doc language |

## False Statements Removed in Phase 1

This document should no longer claim:
- `Avatar` needs creation
- `SectionHeader` needs creation
- `SearchablePickerModal` still exists
- order components are the canonical active product-domain language

## Component Rules

1. Reuse existing base components before adding new ones.
2. Use `src/utils/theme.ts` for tokens.
3. Keep customer-facing domain language aligned with `docs/naming-contract.md`.
4. If a legacy component remains for implementation reasons, mark it transitional instead of pretending it is gone.

## Recommended Cleanup Focus

Highest-priority component cleanup after Phase 1 docs work:
1. clarify sync-status component ownership and variants
2. isolate or rename order-era component surfaces gradually
3. remove dead references to deleted components from docs and prompts
