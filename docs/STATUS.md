# KredBook — Roadmap & Status

> **Source of truth for all phase tracking, task sequencing, and OpenCode execution.**
> Stop referring to Notion. This file is the single tracker. Update it after every completed task.

---

## How to use this file

1. **Before starting any task** — read the task row, check `Depends On`, confirm that dependency is `✅ Done`.
2. **Copy the OpenCode Prompt** exactly as written. Load listed skills before running.
3. **After completing a task** — update `Status` to `✅ Done`, fill in the `Commit` link, and run doc-sync checklist (`.agents/doc-sync-checklist.md`).
4. **Never skip a task or reorder**. Tasks within a phase are sequenced for safety.
5. This file is the only tracker. Do not use Notion or Google Sheets.

---

## Phase Overview

| Phase | Name | Status | Theme |
|---|---|---|---|
| 1 | Truth Reset | ✅ Done | Canonical nouns, core flows, offline-first baseline |
| 2 | DB Hardening | ✅ Done | Schema cleanup, due_date, payment_date, parties fields |
| 3 | Experience Upgrades | 🔄 In Progress | Dark mode, WhatsApp-first sharing, overdue polish |
| 4 | AI Assistance | ⏳ Not Started | Opt-in AI layer via Edge Functions |
| 5 | Documents + Collection | ⏳ Not Started | PDF outputs, UPI collection |
| 6 | UI/UX Redesign | ⏳ Not Started | Full design system overhaul — Vercel × Khatabook × Linear |

---

## Active Product Surface

| Area | Status | Notes |
|---|---|---|
| Authentication | ✅ Working | `app/_layout.tsx` owns auth/onboarding redirects |
| Dashboard | ✅ Working | Outstanding-first overview, overdue collection hero |
| People (Customers) | ✅ Working | Add / list / search / detail |
| Entries | ✅ Working | Create / list / detail |
| Payments | ✅ Working | Record + context |
| Profile | ✅ Working | Settings + CSV export |
| Offline-first sync | ✅ Working | Queue in `src/lib/syncQueue.ts`, replay on reconnect |
| Localization | ✅ Working | EN / HI |
| CSV export | ✅ Working | Profile-area export |
| Dark mode | ✅ Working | Token pairs in `theme.ts`, toggle in Profile |

---

## Drift Watchlist

- Legacy internals still use `order` / `party` — label as `legacy/transitional` if referenced.
- `customers` and `suppliers` tables dropped; all data now in `parties`.
- Legacy supplier/product tables have been dropped from `public` (e.g., `products`, `supplier_*`).
- `order_items.product_id` / `order_items.variant_id` remain as nullable legacy columns; treat them as transitional.
- `parties` is customers-only now (`parties_is_customer_only`). Supplier fields have been removed.
- `profiles.dashboard_mode` has been removed.
- Supplier / product surfaces are out of scope and must not be described as active features.

---

## Phase 1 — Truth Reset ✅ Done

**Goal:** Lock canonical product nouns, get core flows working, establish offline-first baseline.

| # | Task | Status | Commit |
|---|---|---|---|
| 1.1 | Rename canonical nouns to Customer / Entry / Payment | ✅ Done | [6334742](https://github.com/subrat8268/kredBook/commit/6334742aa7059fc77d5942a9bc77b393a8b3640f) |
| 1.2 | Implement Dashboard screen (outstanding + overdue) | ✅ Done | [211cc76](https://github.com/subrat8268/kredBook/commit/211cc76f00dac84d0bb3577585f37ddb85dd6b74) |
| 1.3 | Design system + theme tokens in `src/utils/theme.ts` | ✅ Done | [0bb6587](https://github.com/subrat8268/kredBook/commit/0bb6587eb9d3735ab0aebcbcdfe6349df3637ce1) |
| 1.4 | Migrate customer hooks to `parties` table | ✅ Done | [6d5415b](https://github.com/subrat8268/kredBook/commit/6d5415bb10392ae6709015fe5a472fbeb899be51) |
| 1.5 | Offline-first mutation queue wired (`syncQueue.ts`) | ✅ Done | [0bb6587](https://github.com/subrat8268/kredBook/commit/0bb6587eb9d3735ab0aebcbcdfe6349df3637ce1) |
| 1.6 | EN/HI localization | ✅ Done | [0bb6587](https://github.com/subrat8268/kredBook/commit/0bb6587eb9d3735ab0aebcbcdfe6349df3637ce1) |
| 1.7 | CSV export (Profile area) | ✅ Done | [0bb6587](https://github.com/subrat8268/kredBook/commit/0bb6587eb9d3735ab0aebcbcdfe6349df3637ce1) |
| 1.8 | Align docs to product truth (PRD, ARCHITECTURE, flows) | ✅ Done | [22cbed5](https://github.com/subrat8268/kredBook/commit/22cbed521a992fe0d032fcbf74eace2f793956d2) |

---

## Phase 2 — DB Hardening ✅ Done

**Goal:** Clean up schema, drop dead columns, add business-critical fields, lock schema truth.

| # | Task | Status | Command | Skills | Commit |
|---|---|---|---|---|---|
| 2.1 | Audit full schema correctness | ✅ Done | `/audit` | `code-reviewer`, `supabase` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.2 | Remove dead `product_id` + `variant_id` from `order_items` | ✅ Done | `/fix` | `systematic-debugging`, `supabase` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.3 | Add `due_date` to orders + overdue partial index | ✅ Done | `/build` | `project-planner`, `supabase` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.4 | Expand `payment_mode` enum + add `payment_date` | ✅ Done | `/build` | `project-planner`, `supabase` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.5 | Add `notes`, `avatar_url`, `email` to `parties` | ✅ Done | `/build` | `project-planner`, `supabase` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.6 | Add CHECK constraint `parties.is_customer = TRUE` | ✅ Done | `/fix` | `systematic-debugging`, `supabase` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.7 | Regenerate `database.types.ts` from live Supabase | ✅ Done | `/fix` | `supabase`, `project-planner` | [22cbed5](https://github.com/subrat8268/kredBook/commit/22cbed521a992fe0d032fcbf74eace2f793956d2) |
| 2.8 | Refresh `schema.sql` from live Supabase (no-data ref) | ✅ Done | `/audit` | `supabase` | [22cbed5](https://github.com/subrat8268/kredBook/commit/22cbed521a992fe0d032fcbf74eace2f793956d2) |
| 2.9 | Rename storage bucket `product-images` → `avatars` | ✅ Done | `/refactor` | `refactor-engineer`, `supabase` | [dea2297](https://github.com/subrat8268/kredBook/commit/dea22974108ac94a7f677919d9c37234cb2d9b18) |
| 2.10 | Add RPC `get_dashboard_summary` (single-query dashboard) | ✅ Done | `/build` | `project-planner`, `supabase` | [dea2297](https://github.com/subrat8268/kredBook/commit/dea22974108ac94a7f677919d9c37234cb2d9b18) |

---

## Phase 3 — Experience Upgrades 🔄 In Progress

**Goal:** Dark mode, WhatsApp-first sharing polish, overdue badge consistency, quality-of-life wins.

| # | Task | Status | Priority | Command | Skills |
|---|---|---|---|---|---|
| 3.1 | Dark mode — semantic tokens in `theme.ts` + settings toggle | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `building-native-ui`, `react-native-skills` |
| 3.2 | Overdue badge consistency — token + component across Dashboard / People / Entries | ✅ Done | P0 | `/refactor` | `ui-ux-pro-max`, `refactor-engineer` |
| 3.3 | WhatsApp share polish — consistent message template (amounts, dates, customer name) | ⏳ Not Started | P1 | `/build` | `project-planner`, `react-native-skills` |
| 3.4 | Overdue push notifications — grouped local reminders + Profile toggle + People deep-link | ✅ Done | P1 | `/build` | `building-native-ui`, `native-data-fetching` |
| 3.5 | Indian number format — ₹1,20,000 everywhere | ✅ Done | P1 | `/fix` | `systematic-debugging`, `react-native-skills` |
| 3.6 | Public ledger share link | ✅ Done | P1 | `/build` | `building-native-ui`, `native-data-fetching`, `supabase` |
| 3.7 | Entry note field — optional short text per Entry | ⏳ Not Started | P1 | `/build` | `project-planner`, `supabase` |
| 3.8 | Collect shortcut on Dashboard hero — deep-link to top overdue Customer | ⏳ Not Started | P2 | `/build` | `react-native-skills`, `project-planner` |
| 3.9 | Offline sync indicator — green (synced) / amber (pending) dot in header | ⏳ Not Started | P2 | `/build` | `react-native-skills`, `building-native-ui` |
| 3.10 | Customer search improvements — speed + relevance | ⏳ Not Started | P2 | `/build` | `react-native-skills`, `project-planner` |
| 3.11 | Entries + People filters | ⏳ Not Started | P2 | `/plan` | `project-planner`, `writing-plans` |
| 3.12 | Export hardening — validate CSV totals, locale-safe formatting | ⏳ Not Started | P2 | `/audit` | `supabase`, `code-reviewer` |

### Phase 3 OpenCode Prompts

#### 3.1 — Dark mode ✅ Done

```
/build load_skills=["ui-ux-pro-max","building-native-ui","react-native-skills","code-reviewer"]

Implement dark mode for KredBook.
- Add semantic dark/light token pairs to src/utils/theme.ts
- Wire a dark mode toggle in Profile settings
- Apply tokens across all active screens: Dashboard, People, Entries, Profile
- No hardcoded colors — all values must come from theme tokens
- Use NativeWind + Tailwind config already wired in tailwind.config.js
Verification: toggle works, all 4 screens render correctly in both modes, lint clean, diagnostics clean.
```

#### 3.2 — Overdue badge ✅ Done

- Created `src/components/ui/OverdueChip.tsx` with `badge` (pill) and `inline` (text) variants
- Replaced hardcoded `colors.danger` overdue refs with `colors.overdue.text`/`bg` across all surfaces:
  - Dashboard: inline text colored with theme token
  - People list: filter chip text color
  - Entries list: filter chip text + bg color
  - People detail: hero chip text (container preserved)
  - CustomerCard: amount text + Call button bg (`primaryBlueBg`)
- No behavior change; visual result identical to current state.

#### 3.3 — WhatsApp share polish

```
/build load_skills=["project-planner","react-native-skills","code-reviewer"]

Polish WhatsApp share message template across KredBook.
- Standardize the share message: include Customer name, amount, due date, and a short CTA
- Use canonical nouns: Customer, Entry, Payment (no order/party/transaction)
- EN and HI variants using existing i18n setup
- Must work from: Entry detail, Customer detail, record payment success
Verification: share fires correctly from all 3 surfaces, correct amount/date format, lint clean.
```

#### 3.4 — Overdue push notifications ✅ Done

- Added local notification scheduling on app launch + foreground active transition.
- Query is based on overdue unpaid `orders`, grouped by Customer (`customer_id`, legacy/transitional party reference), with one notification per Customer.
- Added Profile toggle `Overdue reminders` backed by persisted `preferencesStore.remindersEnabled`.
- First toggle-on requests permission once; denied state renders inline warning in Profile.
- Notification tap deep-links to People (`/people`), and scheduler cancels + reschedules to avoid duplicate stacks.

#### 3.5 — Indian number format

- Added `formatINR` utility in `src/utils/format.ts` and replaced scattered `toLocaleString("en-IN")`/`Intl.NumberFormat("en-IN")` usage across app surfaces.

```
/fix load_skills=["systematic-debugging","react-native-skills","code-reviewer"]

Enforce Indian number format (₹1,20,000) everywhere amounts are displayed.
- Create a single formatINR(amount: number): string utility in src/utils/format.ts
- Replace all ad-hoc amount formatting across screens with formatINR
- Target: Dashboard, People list + detail, Entry list + detail, Payment records, CSV export
Verification: ₹1,20,000 renders correctly in all surfaces, lint clean, no hardcoded Intl calls scattered around.
```

#### 3.7 — Entry note field

```
/build load_skills=["project-planner","supabase","react-native-skills","code-reviewer"]

Add optional short note field to Entries.
- Migration: add nullable `note TEXT` column to `orders` table in supabase/migrations/
- Update database.types.ts
- Create Entry screen: add optional "Add note" collapsed field
- Entry Detail screen: show note if present
- Edit Entry screen: editable note field
Verification: note saves, displays, edits correctly; migration in supabase/migrations/; lint clean.
```

---

## Phase 4 — AI Assistance ⏳ Not Started

**Goal:** Opt-in AI features only. All AI goes through Supabase Edge Functions with guardrails.

> **Rule:** No AI feature is added without an opt-in UX. All AI calls are rate-limited and audit-logged. No AI feature modifies data directly.

| # | Task | Status | Priority | Command | Skills |
|---|---|---|---|---|---|
| 4.1 | Plan AI architecture — Edge Function boundary, guardrails, rate limits | ⏳ Not Started | P0 | `/plan` | `project-planner`, `writing-plans`, `supabase` |
| 4.2 | Follow-up prioritization — rank Customers by overdue + recency | ⏳ Not Started | P1 | `/build` | `project-planner`, `supabase` |
| 4.3 | Smart Customer summary — last 30 days entries/payments + suggested action | ⏳ Not Started | P1 | `/build` | `supabase`, `project-planner` |
| 4.4 | AI WhatsApp draft — generate EN/HI message variants with opt-in UX | ⏳ Not Started | P1 | `/plan` | `project-planner`, `writing-plans` |
| 4.5 | Anomaly detection — flag customers with 45+ days no payment | ⏳ Not Started | P2 | `/plan` | `project-planner`, `supabase` |
| 4.6 | Monthly insight card — collection trend summary | ⏳ Not Started | P2 | `/build` | `supabase`, `project-planner` |

---

## Phase 5 — Documents + Collection ⏳ Not Started

**Goal:** PDF outputs and UPI collection links for WhatsApp-first sharing.

| # | Task | Status | Priority | Command | Skills |
|---|---|---|---|---|---|
| 5.1 | PDF Customer statement — Edge Function generates PDF, stores in Supabase Storage, share via WhatsApp | ⏳ Not Started | P1 | `/build` | `supabase`, `project-planner` |
| 5.2 | Entry PDF — single Entry receipt shareable via WhatsApp | ⏳ Not Started | P2 | `/build` | `supabase`, `project-planner` |
| 5.3 | UPI collect link + QR on Customer balance screen | ⏳ Not Started | P1 | `/build` | `project-planner`, `react-native-skills` |
| 5.4 | Receipt-friendly sharing flow — polish and test end-to-end | ⏳ Not Started | P2 | `/plan` | `project-planner`, `writing-plans` |
| 5.5 | Referral prompt after successful payment — lightweight share + deep link | ⏳ Not Started | P3 | `/build` | `ui-ux-pro-max`, `project-planner` |

---

## Phase 6 — UI/UX Redesign ⏳ Not Started

**Goal:** Full design system overhaul and screen-by-screen redesign. Vercel × Khatabook × Linear aesthetic. Bharat-market ready.

> **Depends On:** Phase 3 task 3.1 (dark mode tokens) must be ✅ Done first — Phase 6.0 builds on top of those token foundations.
> **Rule:** Never start a screen redesign without 6.0 (design system) being ✅ Done. All tokens must be locked before touching any screen.

---

### Phase 6.0 — Design System Foundation (Blocks All Other 6.x Tasks)

| # | Task | Status | Priority | Command | Skills | Depends On |
|---|---|---|---|---|---|---|
| 6.0.1 | Update `theme.ts` — new color tokens (green primary, amber accent, semantic palette) | ⏳ Not Started | P0 | `/refactor` | `ui-ux-pro-max`, `building-native-ui`, `react-native-skills` | 3.1 ✅ |
| 6.0.2 | Fix `tailwind.config.js` — replace CSS vars with literal token values | ⏳ Not Started | P0 | `/fix` | `refactor-engineer`, `expo-tailwind-setup`, `react-native-skills` | 6.0.1 ✅ |
| 6.0.3 | Add motion tokens — `duration-fast: 150ms`, `duration-base: 250ms`, easing curves | ⏳ Not Started | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills` | 6.0.1 ✅ |
| 6.0.4 | Unify icon system — migrate all icons to `lucide-react-native`, remove SVG + system mix | ⏳ Not Started | P0 | `/refactor` | `refactor-engineer`, `code-reviewer` | 6.0.1 ✅ |
| 6.0.5 | Rebuild `StatusBadge` — filled pill + semantic color per status (Paid/Partial/Overdue/Advance) | ⏳ Not Started | P0 | `/build` | `ui-ux-pro-max`, `sleek-design-mobile-apps` | 6.0.1 ✅ |
| 6.0.6 | Rebuild `Button` variants — primary / secondary / ghost / danger with new tokens | ⏳ Not Started | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills` | 6.0.1 ✅ |
| 6.0.7 | Create `Skeleton` component — shimmer loading for all list/card surfaces | ⏳ Not Started | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills` | 6.0.1 ✅ |
| 6.0.8 | Create `SpeedDialFAB` component — expandable FAB (New Entry · New Customer · Record Payment) | ⏳ Not Started | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills` | 6.0.3 ✅ |

**New Brand Tokens (implement in 6.0.1):**

```
primary:    #16A34A  (green-600)   → trust, money, growth
accent:     #F59E0B  (amber-500)   → overdue alerts, urgency
surface:    #F9FAFB  (gray-50)     → card backgrounds
ink:        #111827  (gray-900)    → primary text
muted:      #6B7280  (gray-500)    → secondary text
danger:     #DC2626  (red-600)     → errors, delete
success:    #16A34A                → same as primary (paid status)
warning:    #F59E0B                → overdue
border:     #E5E7EB  (gray-200)    → dividers
```

**Typography:**
- Body / numbers: **Inter**
- Headings: **Manrope**

**Dead code to kill in 6.0 (before redesign starts):**
- Center FAB tab from `(main)/_layout.tsx` — replace with SpeedDialFAB
- Standalone Export tab — move to Profile screen
- `src/components/navigation/` (empty directory)
- Stub product picker state in `create.tsx` lines 91–103
- `role.tsx` unregistered route in onboarding `_layout.tsx`
- Wired-but-unused i18n `t()` calls — either fully wire or remove

---

### Phase 6.1 — Core Loop Screens (Daily Driver)

> Depends On: All of 6.0 ✅ Done

| # | Task | Status | Priority | Command | Skills | Screen |
|---|---|---|---|---|---|---|
| 6.1.1 | Dashboard redesign — hero card, quick stats row, activity feed, SpeedDialFAB | ⏳ Not Started | P0 | `/build` | `ui-ux-pro-max`, `sleek-design-mobile-apps`, `react-native-skills` | `(main)/dashboard/index.tsx` |
| 6.1.2 | Tab navigation redesign — 4-tab layout, lucide icons, active pill indicator | ⏳ Not Started | P0 | `/refactor` | `ui-ux-pro-max`, `react-native-skills` | `(main)/_layout.tsx` |
| 6.1.3 | Create Entry redesign — full-screen numpad, bottom sheet customer picker, quick due-date chips | ⏳ Not Started | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/entries/create.tsx` |
| 6.1.4 | Record Payment modal redesign — large numpad, partial toggle, payment method, WhatsApp receipt | ⏳ Not Started | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `RecordPaymentModal` (shared) |
| 6.1.5 | Customer Detail redesign — hero card, sticky balance bar, timeline view, swipe actions | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/people/[customerId].tsx` |

#### 6.1.1 — Dashboard Redesign OpenCode Prompt

```
/build load_skills=["ui-ux-pro-max","sleek-design-mobile-apps","react-native-skills","code-reviewer"]

Redesign the KredBook Dashboard screen. All tokens from src/utils/theme.ts (Phase 6.0 must be done first).

Changes:
1. Hero card: gradient green-600 → green-700, white text, "Collect Outstanding" total with animated
   number counter on load, ↑/↓ week delta with color-coded arrow, "Record Payment" CTA in card footer
2. Personalized greeting: "Good morning, [Name] 👋" using profile name from store
3. Quick stats row: 3 mini-cards (Total Customers · Overdue Count · Collected This Month),
   each tappable to filtered list
4. Top follow-up: horizontal scroll cards (not vertical list), avatar/initials,
   days-overdue amber badge, "Collect" action
5. Recent activity feed: last 5 transactions (entry/payment) as a timeline
6. Replace center FAB tab with SpeedDialFAB component (6.0.8)
7. Skeleton loading on all cards (6.0.7 component)
8. Empty state for overdue section: "All clear! No overdue customers 🎉"
9. Pull-to-refresh: keep existing

No new DB queries. Wire to existing hooks + get_dashboard_summary RPC.
Verification: all sections render, skeleton shows on load, SpeedDialFAB expands/collapses, lint clean.
```

#### 6.1.3 — Create Entry Redesign OpenCode Prompt

```
/build load_skills=["ui-ux-pro-max","react-native-skills","code-reviewer"]

Redesign Create Entry screen in (main)/entries/create.tsx.

Changes:
1. Amount input: full-screen large numpad (PhonePe/GPay style) — amount is the hero
2. Customer selector: searchable bottom sheet (not full navigation), recently added customers first
3. Description: optional, collapsed by default. Tap "+ Add note" to expand
4. Due date: quick chips — Today · +7 days · +15 days · +30 days · Custom (no calendar scroll by default)
5. Auto-save draft on exit (MMKV backed)
6. Remove stub product picker state (lines 91–103) and all "// Stub state" comments

Keep: PDF auto-generate + share, WhatsApp share as primary action in post-create modal.
Verification: entry creates successfully, draft saves on exit, no dead code, lint clean.
```

---

### Phase 6.2 — List Screens

> Depends On: 6.0 ✅ Done, 6.1 ✅ Done

| # | Task | Status | Priority | Command | Skills | Screen |
|---|---|---|---|---|---|---|
| 6.2.1 | Customer List redesign — filter chips, swipe actions, sort options, alphabetical headers, empty state | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/people/index.tsx` |
| 6.2.2 | Entry List redesign — filter chips, swipe actions, date section headers, summary banner | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/entries/index.tsx` |
| 6.2.3 | Entry Detail redesign — hero card, payment timeline, sticky "Record Payment" bar | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/entries/[orderId].tsx` |
| 6.2.4 | Edit Entry redesign — quick due-date chips, customer reassign, unsaved changes warning | ⏳ Not Started | P2 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/entries/[orderId]/edit.tsx` |

#### 6.2.1 — Customer List OpenCode Prompt

```
/build load_skills=["ui-ux-pro-max","react-native-skills","code-reviewer"]

Redesign the Customer List screen (main)/people/index.tsx.

Changes:
1. Sticky search bar at top, autofocus on tab press
2. Filter chips (horizontal scroll, not dropdown): All · Overdue · Pending · Paid · Advance
3. List items: Avatar/initials · Name · Balance · StatusBadge · Days overdue in single row
4. Sort options: Highest balance · Most overdue · Alphabetical · Recently active
5. Swipe left: Call + WhatsApp quick actions. Swipe right: Quick Payment
6. Alphabetical section headers (A · B · C...)
7. Floating + button bottom-right (remove from header)
8. Empty state: illustration + "Add your first customer" with inline CTA + "Import from Contacts" button
9. Consolidate duplicated filter logic — remove client-side duplicate between people.ts and usePeople.ts

Verification: filters work, swipe actions fire correctly, empty state renders, lint clean.
```

---

### Phase 6.3 — Auth + Onboarding

> Depends On: 6.0 ✅ Done

| # | Task | Status | Priority | Command | Skills | Screen |
|---|---|---|---|---|---|---|
| 6.3.1 | Welcome screen redesign — illustrated full-bleed, tagline, social proof, language toggle, Lottie animation | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `sleek-design-mobile-apps`, `react-native-skills` | `app/index.tsx` |
| 6.3.2 | Login redesign — show/hide password, Google OAuth, inline field errors, keyboard avoidance | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/login.tsx` |
| 6.3.3 | Signup redesign — remove confirm password, add name field + terms checkbox + progress pill | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/signup.tsx` |
| 6.3.4 | Reset Password redesign — full-screen success illustration state | ⏳ Not Started | P2 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/resetPassword.tsx` |
| 6.3.5 | Phone Setup redesign — flag + country code input, inline OTP, skip option, progress bar | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/phone-setup.tsx` |
| 6.3.6 | Onboarding business.tsx — business type selector, logo upload, skip option | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/onboarding/business.tsx` |
| 6.3.7 | Onboarding bank.tsx — make optional, add UPI ID + QR preview, prominent skip | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/onboarding/bank.tsx` |
| 6.3.8 | Onboarding ready.tsx — confetti Lottie, feature highlights, "Take a Tour" trigger | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/onboarding/ready.tsx` |

---

### Phase 6.4 — Profile, Export + Public Ledger

> Depends On: 6.0 ✅ Done, 6.2 ✅ Done

| # | Task | Status | Priority | Command | Skills | Screen |
|---|---|---|---|---|---|---|
| 6.4.1 | Profile screen redesign — editable header, UPI QR, app settings section, danger zone | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/profile/index.tsx` |
| 6.4.2 | Profile Edit redesign — logo upload, UPI ID, address, sticky save bar, inline validation | ⏳ Not Started | P2 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/profile/edit.tsx` |
| 6.4.3 | Export — move from standalone tab into Profile, add customer filter, email export, export history | ⏳ Not Started | P1 | `/refactor` | `refactor-engineer`, `react-native-skills` | `(main)/export/index.tsx` |
| 6.4.4 | Public Ledger redesign — business logo, UPI Pay Now button, WhatsApp CTA, mobile-responsive, KredBook footer | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `project-planner` | `app/l/[token].tsx` |

#### 6.4.4 — Public Ledger OpenCode Prompt

```
/build load_skills=["ui-ux-pro-max","project-planner","code-reviewer"]

Redesign the Public Ledger screen (app/l/[token].tsx). This is a B2C touchpoint — customers receive this link via WhatsApp.

Changes:
1. Show vendor business logo + name prominently at top
2. Outstanding amount hero: large, clear, "₹2,400 is due" — no ambiguity
3. Transaction timeline: clean, date-grouped
4. UPI Pay Now button: if vendor has UPI ID, deep-link to UPI apps (upi://pay?pa=...)
5. "Talk to Us" WhatsApp CTA linking to vendor phone
6. Expiry warning if token has TTL: "Link valid for X days"
7. Subtle "Powered by KredBook" footer
8. Fully mobile-responsive — renders cleanly in mobile browsers (customers open from WhatsApp)

Verification: renders on mobile viewport, UPI deep link fires, WhatsApp CTA works, lint clean.
```

---

## OpenCode Quick Reference

| Command | When to use | Default skills |
|---|---|---|
| `/plan` | Before any new feature | `project-planner`, `writing-plans` |
| `/build` | Implement a scoped feature | Add `supabase` for DB; add `ui-ux-pro-max` + `building-native-ui` + `react-native-skills` for UI |
| `/fix` | Bug with evidence | `systematic-debugging`, `code-reviewer` |
| `/refactor` | Structure change, no behavior change | `refactor-engineer`, `code-reviewer` |
| `/audit` | Health check / drift detection | `code-reviewer`, `verification-before-completion` |
| `/finish` | Commit + push | `finishing-a-development-branch`, `code-reviewer`, `verification-before-completion` |
| `/doc` | Write or update docs | `doc-coauthoring`, `internal-comms`, `writing-plans` |
| `/upgrade` | Expo SDK or major deps | `upgrading-expo`, `react-native-skills`, `expo-tailwind-setup` |

### Task Done Checklist

Before marking any task ✅ Done:

- [ ] Command used is logged here
- [ ] `load_skills` used is logged here
- [ ] Files changed are noted
- [ ] GitHub commit or migration URL is in the Commit column
- [ ] `npm run lint` passes
- [ ] `lsp_diagnostics` clean for changed files
- [ ] DB changes have a migration in `supabase/migrations/`
- [ ] Doc-sync checklist (`.agents/doc-sync-checklist.md`) is completed
- [ ] This STATUS.md is updated before closing the session

---

## Canonical Reference

| File | Purpose |
|---|---|
| `SYSTEM_CONTEXT.md` | Product contract, scope, non-goals |
| `AGENTS.md` | AI agent conventions |
| `docs/STATUS.md` | **This file — phase tracking and roadmap** |
| `docs/prd.md` | Full 5-phase PRD |
| `docs/ARCHITECTURE.md` | Stack, routes, offline-first, AI boundary |
| `schema.sql` | Live schema snapshot (no data) |
| `.agents/commands.md` | OpenCode command reference |
| `.agents/orchestration.md` | Deterministic pipelines |
| `.agents/skill-router.md` | Skill routing rules |
| `.agents/doc-sync-checklist.md` | Closeout checklist |
