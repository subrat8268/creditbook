# KredBook Product Requirements Document

## Product Decision

KredBook is a **strict single-mode product**:

> A simple digital khata for small businesses in India to track customer credit, entries, payments, and total outstanding.

## Product Goal

Replace the physical khata notebook with a focused mobile app that is:
- simple to learn
- fast to use
- reliable offline
- clear about who owes what

## In Scope

- Customers
- Entries
- Payments
- Dashboard
- Profile
- Offline-first sync
- EN/HI localization
- CSV export

## Out of Scope

Unless explicitly marked legacy or transitional, the following are out of scope:

- Suppliers
- Distributor mode
- Party abstraction as primary product language
- Product catalog
- Reports
- GST
- Multi-user
- Notifications/reminders as active product features

## Target User

One small-business owner in India who extends credit to customers and needs a digital replacement for a notebook ledger.

This is a **single-user** product, not a team system.

## Core Jobs To Be Done

1. Add a customer
2. Record an entry for money owed
3. Record a payment
4. See total outstanding quickly
5. Export data when needed

## Core Screens

1. **Dashboard** — total outstanding and quick collection-oriented actions
2. **People** — customer list and customer actions
3. **Entries** — entry list and entry details
4. **Profile** — business/profile settings, language, export, sign out

The center Add action supports fast entry creation but does not change the canonical screen set.

## Key Product Principles

### 1. Focus over flexibility
If a feature does not help track customer credit clearly, it should not be active scope.

### 2. Fast capture
Creating an entry or recording a payment should feel lightweight.

### 3. Financial clarity
Outstanding amounts and payment state must be easy to understand.

### 4. Offline reliability
The product must keep working when connectivity is poor.

## Feature Requirements

### Customers
- add customer
- list/search customers
- view customer detail and balance context

### Entries
- create entry
- list entries
- open entry detail
- support share/send entry workflows where implemented
- limited (transitional): share a **read-only** Customer ledger link (**token-based**)

### Payments
- record payment against outstanding balance
- show payment history where relevant

### Dashboard
- show total outstanding
- support quick collection-oriented navigation

### Profile
- business/profile settings
- language toggle
- export CSV
- sign out

### Offline-first
- local queue for writes
- cache-backed reads where possible
- sync when connectivity returns

### Localization
- English and Hindi

### Export
- CSV export from Profile area

## Non-Goals

KredBook is not trying to be:
- a supplier ledger
- a distributor workflow tool
- an inventory or product-catalog app
- a reporting suite
- a GST or invoicing platform
- a team collaboration system
- a notifications/reminder product

## Legacy Truth Rule

The repo may still contain older code or names for out-of-scope concepts. Those must be marked as legacy or transitional, not described as active product scope.

## Documentation Rule

When product scope, user flows, or terminology change:
- update `docs/naming-contract.md`
- update this PRD
- update `docs/ARCHITECTURE.md`
- update `docs/STATUS.md`
- run `_agents/doc-sync-checklist.md`
