# KredBook PRD

KredBook is a strict single-mode digital khata for small businesses in India.

Its active product truth is simple: track `Customers`, `Entries`, and `Payments`; make outstanding money obvious; and keep the system reliable even when connectivity is poor.

## 1. PRD Summary

KredBook helps a small business owner quickly record money they are owed, record money they collect, and stay clear on who is overdue.

The product is intentionally narrow:
- one core mode
- one financial loop: `Customer -> Entry -> Payment`
- one primary navigation set: `Dashboard`, `People`, `Entries`, `Profile`

The current product priority is speed, clarity, and offline reliability, not breadth.

## 2. Target User And Jobs-To-Be-Done

### Target User

- Small business owners and operators in India
- Users who currently track udhaar / khata manually, loosely in chat, or in fragmented spreadsheets
- Users who often work in low-connectivity environments
- Users who need simple customer-level money tracking, not full business ERP software

### Core Jobs-To-Be-Done

When a sale happens on credit, the user wants to:
- create an `Entry` in seconds
- attach it to the right `Customer`
- optionally share details immediately on WhatsApp

When a customer pays, the user wants to:
- record a `Payment` in seconds
- update the balance without manual calculation
- keep a clean ledger history

At any time, the user wants to:
- know total outstanding
- know which `Customers` need follow-up
- know which `Entries` are pending or overdue
- trust that no data is lost when the network is bad

## 3. Problem Statement

Small businesses need a fast, reliable way to track customer credit and collections. Existing habits are often fragmented across paper, memory, WhatsApp, and generic notes. That creates three problems:

- slow capture at the moment of sale or collection
- poor visibility into outstanding and overdue amounts
- data loss or confusion under poor connectivity

KredBook solves this by giving the user a strict, focused khata workflow with offline-first behavior and clear balance tracking.

## 4. Product Principles

1. Speed over breadth
2. Money clarity over visual noise
3. Offline-first by default
4. WhatsApp-first where sharing is needed
5. Strict scope beats feature sprawl
6. Canonical language must stay stable across UI and docs

### Principle Notes

- If a feature slows down adding an `Entry` or `Payment`, it must justify itself.
- If a surface does not improve money clarity, it is secondary.
- If a flow depends on perfect connectivity, it is incomplete.
- If a concept expands the app toward inventory, ERP, or team workflows, it is likely out of scope.

## 5. Canonical Nouns And Naming Rules

### Canonical Product Nouns

- `Customer`
- `Entry`
- `Payment`

### Canonical Screens

- `Dashboard`
- `People`
- `Entries`
- `Profile`

### Naming Rules

- User-facing copy and new docs must use `Customer`, `Entry`, and `Payment`.
- Legacy/transitional code terms may still exist, including `order`, `party`, and `vendor`.
- If legacy terms must be mentioned in docs, they must be labeled as `legacy` or `transitional`.
- Do not describe supplier or product concepts as active product pillars.
- `People` is the navigation label, but its active scope is customer management.

## 6. In Scope Vs Out Of Scope

### Always In Scope

- Customers, Entries, Payments
- Dashboard, People, Entries, Profile
- Offline-first sync and replay
- EN/HI localization
- CSV export
- WhatsApp-first sharing

### In Scope By Current Phase Truth

- Phase 3: dark mode, stronger WhatsApp-first sharing surfaces, overdue badge consistency
- Phase 4: opt-in AI assistance through guarded backend boundaries
- Phase 5: PDF outputs and UPI collection

### Out Of Scope

- Suppliers / distributor mode as an active product mode
- Product catalog / inventory as an active feature set
- Reports / GST as a platform
- Multi-user or team workflows
- Notifications / reminders as an active product feature

### Legacy But Not Active Scope

- supplier-related tables or flows that still exist in code or schema
- product-related tables or flows that still exist in code or schema

These may remain in transitional internals, but they must not be presented as active product direction.

## 7. Phase-By-Phase Roadmap

### Phase 1: Done

- truth reset around `Customer`, `Entry`, `Payment`
- core screen flows established
- offline-first baseline established
- CSV export included in active surface

### Phase 2: Done

- reliability and polish improvements
- stronger sync UX
- overdue prioritization improvements
- tighter product truth around the current mode

### Phase 3: In Progress

- dark mode through token-driven theming
- stronger WhatsApp-first sharing surfaces
- overdue badge consistency across screens

### Phase 4: Not Started

- opt-in AI assistance layer
- safe summaries, drafting, and prioritization support only
- no autonomous actions and no mandatory AI dependency

### Phase 5: Not Started

- PDF outputs for statements / entries
- UPI collection support
- receipt-friendly sharing surfaces

## 8. User Flows By Screen

### Dashboard

Purpose:
Show total outstanding and surface who needs action next.

Primary flow:
1. User opens `Dashboard`
2. Sees total outstanding
3. Sees priority / overdue `Customers`
4. Taps into a `Customer` or starts a `Payment`

Key outcomes:
- immediate money clarity
- quick follow-up action

### People

Purpose:
Manage and act on `Customers`.

Primary flow:
1. User opens `People`
2. Searches or browses `Customers`
3. Adds a new `Customer` or opens an existing one
4. From customer detail, takes action: add `Entry`, record `Payment`, or share ledger

Key outcomes:
- fast customer lookup
- customer-level ledger context

### Entries

Purpose:
Capture and review `Entries`.

Primary flow:
1. User opens `Entries`
2. Views list of recent / pending / overdue `Entries`
3. Adds a new `Entry` or opens an existing one
4. From entry detail, reviews amount, status, and payment history

Key outcomes:
- fast capture
- clear bill-level tracking

### Profile

Purpose:
Manage business details, language, and data export.

Primary flow:
1. User opens `Profile`
2. Updates business details if needed
3. Switches language between EN / HI
4. Exports CSV when needed

Key outcomes:
- accurate business identity for sharing
- simple access to export and settings

### Supporting Hidden Flows

- Authentication and onboarding flows route the user into the main product
- Export is triggered from `Profile`
- Public ledger sharing is read-only and should remain limited in scope

## 9. Sharing Strategy (WhatsApp-First)

Sharing is not a general document platform. It exists to help the user follow up and communicate quickly.

### Current Direction

- prioritize WhatsApp sharing before broader share surfaces
- support ledger sharing with readable, low-friction content
- keep share copy short, clear, and action-oriented

### Preferred Share Artifacts

- formatted WhatsApp text
- read-only customer ledger link
- later: PDF statement / entry PDF in Phase 5

### Rules

- sharing must preserve money clarity
- sharing must not allow editing by recipients
- sharing must work cleanly with business identity from `Profile`
- sharing should degrade gracefully when offline

## 10. AI Feature Guardrails

AI is optional and must never become the core product loop.

### AI Boundary

- AI must be routed through Supabase Edge Functions
- the app should not directly embed broad AI authority into the client

### Allowed AI Use Cases

- follow-up prioritization suggestions
- customer summary generation
- WhatsApp draft assistance
- anomaly or pattern hints

### Guardrails

- opt-in only
- no autonomous sending
- no hidden actions
- safe fallback when offline or unavailable
- strict input allowlists
- auditability and rate limiting
- outputs must be assistive, not authoritative accounting truth

## 11. Success Metrics

### Core Product Metrics

- time to create an `Entry`
- time to record a `Payment`
- share completion rate for WhatsApp-first flows
- percentage of writes safely completed or replayed after offline capture
- reduction in unresolved overdue balances over time

### Experience Metrics

- low sync failure visibility without silent data loss
- high confidence that outstanding totals are current
- low friction in customer search and follow-up actions

### Guardrail Metrics

- no data loss from offline writes
- no scope drift into non-core workflows
- AI usage remains optional and bounded

## 12. Risks And Open Questions

### Risks

- legacy supplier/product internals may confuse future doc or UI decisions
- WhatsApp-first sharing can become fragmented if link, text, and future PDF behavior diverge
- dark mode can drift if screens bypass semantic tokens
- offline queue correctness is critical; regressions here directly damage product trust

### Open Questions

- how much preview/edit capability should users have before sending shared WhatsApp content?
- should overdue prioritization stay rule-based only, or later accept optional AI ranking overlays?
- what is the cleanest Phase 5 UX for UPI collection without expanding into full payments-platform scope?

## 13. Implementation Notes Aligned To Current Architecture

### App Stack

- React Native + Expo Router
- Zustand for local / app state
- TanStack Query for server state
- Supabase backend
- NativeWind + `src/utils/theme.ts` as design-token source of truth

### Navigation

- main product routing centers on `Dashboard`, `People`, `Entries`, and `Profile`
- auth and onboarding remain entry flows, not product pillars

### Data And Sync

- offline writes must continue to go through the queue
- reads should prefer cached state where appropriate
- sync behavior must prioritize reliability over perceived instant success

### Backend Rules

- Supabase remains the system of record
- RLS must protect user-owned business data
- sharing and AI boundaries should be enforced server-side where possible

### UI Rules

- one clear primary action per screen
- semantic token usage only
- Phase 3 dark mode must be implemented through `theme.ts`, not one-off styles
- overdue status styling should be consistent across all chips and badges

## 14. Doc Updates Required

When the product truth changes, keep these docs aligned in the same task:

- `docs/prd.md` for scope and roadmap truth
- `docs/STATUS.md` for current phase state
- `docs/ARCHITECTURE.md` for technical boundaries and flow notes
- `docs/design-system.md` for token/theming implications
- relevant `docs/flows/*.md` files when a screen flow changes
- `README.md` when setup, positioning, or active product framing changes

This PRD is the product-level truth. Supporting docs should describe implementation and state without contradicting the scope defined here.
