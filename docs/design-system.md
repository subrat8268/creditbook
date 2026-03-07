# CreditBook Design System

> **Version**: 1.1
> **Last Updated**: March 5, 2026
> **Maintained by**: CreditBook Product & Design Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Brand Identity](#2-brand-identity)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Layout System](#5-layout-system)
6. [Components](#6-components)
7. [Icons](#7-icons)
8. [Motion Guidelines](#8-motion-guidelines)
9. [UX Patterns](#9-ux-patterns)
10. [Design Principles](#10-design-principles)

---

## 1. Introduction

This design system defines the visual language, component patterns, and UX guidelines used across the CreditBook mobile application. It serves as the single source of truth for product, design, and engineering.

**Goals:**

- Ensure visual consistency across all screens and flows
- Maintain usability at scale as features are added
- Make financial information fast to read and easy to act on

**Optimized for:**

| Priority                | Rationale                                                                                     |
| :---------------------- | :-------------------------------------------------------------------------------------------- |
| **Mobile-first design** | All primary users access CreditBook on Android smartphones                                    |
| **Financial clarity**   | Users must understand their ledger state at a glance, without reading every line              |
| **Quick data entry**    | Recording a bill or payment should take fewer than 3 taps                                     |
| **Low cognitive load**  | Shop owners are not necessarily financially literate — the UI must do the interpretation work |

---

## 2. Brand Identity

### Core Identity

| Field            | Value                                             |
| :--------------- | :------------------------------------------------ |
| **Brand Name**   | CreditBook                                        |
| **Tagline**      | Track Credit. Get Paid Faster.                    |
| **Product Type** | Digital credit ledger for Indian small businesses |
| **Target Users** | Retailers, wholesalers, shop owners, distributors |

### Brand Personality

| Trait                 | What It Means in the UI                                                         |
| :-------------------- | :------------------------------------------------------------------------------ |
| **Trustworthy**       | Consistent color signals; no ambiguity in financial states                      |
| **Simple**            | Minimal screens, short labels, single primary action per view                   |
| **Fast**              | Optimistic UI; transactions appear instantly                                    |
| **Friendly**          | Approachable for non-technical users; no financial jargon                       |
| **Financially clear** | Every number has context — color, label, and comparison always visible together |

### Design Philosophy

**"Digital Khata Book"**

CreditBook uses a Digital Khata Book design philosophy. The UI mimics the simplicity of traditional Indian ledger books while adding modern fintech-style visual clarity.

Design goals:

| Goal                                     | Description                                                                                           |
| :--------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| **Instantly visible financial balances** | The user's net position and per-customer balance are always on screen, never buried behind navigation |
| **Fast transaction entry**               | Recording a bill or payment must take under 60 seconds for a shopkeeper at a busy counter             |
| **Minimal cognitive load**               | The app interprets financial data for the user — color, summaries, and running balances do the work   |
| **Clear financial signals**              | Money received and money owed are always communicated by color, never by text alone                   |

> The interface should feel like: **"A modern mobile version of a shopkeeper's khata book."**

### Voice & Tone

The interface should feel like a **modern digital version of a traditional shop ledger (khata book)** — familiar enough for first-time smartphone users, yet as reliable and clear as a modern banking app.

Use **short, action-oriented labels**:

| Feature          | UI Label (not)             | UI Label (use)    |
| :--------------- | :------------------------- | :---------------- |
| Add transaction  | "Add New Transaction"      | **New Entry**     |
| Record payment   | "Record Payment Received"  | **Received**      |
| Give credit      | "Issue Credit to Customer" | **Give Credit**   |
| Send reminder    | "Send Payment Reminder"    | **Send Reminder** |
| Create invoice   | "Generate Invoice"         | **Create Bill**   |
| Supplier payment | "Log Supplier Payment"     | **Pay Supplier**  |

---

## 3. Color System

### Palette

| Token            | Color Name | Hex       | Usage                                                         |
| :--------------- | :--------- | :-------- | :------------------------------------------------------------ |
| `primary`        | Green      | `#22C55E` | Primary actions, FAB, active nav state, confirmations         |
| `primary-dark`   | Dark Green | `#16A34A` | Hover / pressed state for primary green                       |
| `success`        | Green      | `#22C55E` | Money received, paid invoices, positive balances              |
| `danger`         | Red        | `#EF4444` | Money owed, overdue accounts, negative values, delete actions |
| `warning`        | Amber      | `#F59E0B` | Pending payments, reminders, partial transactions             |
| `fab`            | Blue       | `#2563EB` | Floating Action Button background                             |
| `background`     | Light Gray | `#F6F7F9` | App background — reduces eye strain                           |
| `surface`        | White      | `#FFFFFF` | Cards, panels, modals                                         |
| `text-primary`   | Near Black | `#1C1C1E` | Headings, body text, financial values                         |
| `text-secondary` | Cool Gray  | `#6B7280` | Labels, captions, metadata                                    |
| `border`         | Light Gray | `#E5E7EB` | Row separators, input borders                                 |

### Dashboard Gradient Cards

CreditBook dashboards use highlight cards with gradients to display important financial summaries. Each card type uses a distinct gradient that communicates the financial context at a glance.

| Card                      | Gradient            | Used For                               |
| :------------------------ | :------------------ | :------------------------------------- |
| **Customer Balance Card** | `#DC2626 → #B91C1C` | Outstanding customer balance due       |
| **Supplier Payable Card** | `#DB2777 → #BE185D` | Supplier payments owed by the business |
| **Net Position Card**     | `#0F172A → #334155` | Overall net financial summary          |

```
Customer Balance:  linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)
Supplier Payable:  linear-gradient(135deg, #DB2777 0%, #BE185D 100%)
Net Position:      linear-gradient(135deg, #0F172A 0%, #334155 100%)
```

### Financial State Color Mapping

Colors are the primary communication channel for financial state — not text alone.

| Financial State   | Color | Token     | When to Use                                                  |
| :---------------- | :---- | :-------- | :----------------------------------------------------------- |
| Paid / Received   | Green | `success` | Money has been received; balance cleared; positive outcome   |
| Owed / Overdue    | Red   | `danger`  | Outstanding balance; overdue account; action required now    |
| Pending / Partial | Amber | `warning` | Payment partially made; reminder state; action required soon |
| Primary Action    | Green | `primary` | Buttons, FAB, active navigation, confirmations               |

> **Rule**: Never use red or amber as decorative colors. Reserve them strictly for financial states that require user attention.

### NativeWind / Tailwind Tokens

These tokens are defined in `tailwind.config.js` and used throughout the app:

```js
colors: {
  primary:     '#22C55E',
  primaryDark: '#16A34A',
  fab:         '#2563EB',
  success:     '#22C55E',
  danger:      '#EF4444',
  warning:     '#F59E0B',
  background:  '#F6F7F9',
  textPrimary: '#1C1C1E',
  textSecondary: '#6B7280',
  border:      '#E5E7EB',
}
```

---

## 4. Typography

### Font Family

**Primary**: Inter  
**Fallback**: System default (San Francisco on iOS, Roboto on Android)

Inter is chosen for its high legibility at small sizes, clean numerals, and strong performance on low-DPI Android screens.

### Type Scale

| Role                  | Weight         | Size | Usage                                                     |
| :-------------------- | :------------- | :--- | :-------------------------------------------------------- |
| **Title**             | Bold (700)     | 24px | Screen titles, section headers                            |
| **Financial Numbers** | Bold (700)     | 28px | Hero card amounts, balance totals — always bold and large |
| **Subheading**        | SemiBold (600) | 18px | Card titles, modal headers                                |
| **Body**              | Regular (400)  | 16px | List items, descriptions, labels                          |
| **Small / Caption**   | Medium (500)   | 13px | Metadata, timestamps, secondary info                      |

### Financial Values

Financial amounts (balances, totals, invoice values) must always be:

- **Larger** than surrounding text (minimum 22dp for primary values)
- **Bold** weight (700)
- Colored according to financial state (green / red / primary)
- **Never truncated** — use layout adjustments to ensure full visibility

---

## 5. Layout System

### Principles

- **Mobile-first**: All layouts are designed for a 375–420dp wide screen. No grid systems. Single-column flow.
- **Card-based UI**: Content is grouped into discrete white cards on a light gray background — mirroring the visual structure of a physical ledger.
- **Consistent padding**: All screens use the same horizontal padding (`16dp`) so content never feels inconsistently spaced.

### Spacing Scale

| Token     | Value | Common Use                                         |
| :-------- | :---- | :------------------------------------------------- |
| `space-1` | 4dp   | Icon-to-label gap, tight internal padding          |
| `space-2` | 8dp   | Chip padding, compact row spacing                  |
| `space-3` | 12dp  | Input internal padding, list item vertical padding |
| `space-4` | 16dp  | Screen horizontal padding (global standard)        |
| `space-6` | 24dp  | Card internal padding, section spacing             |
| `space-8` | 32dp  | Major section separators, bottom FAB clearance     |

### Cards

| Property          | Value                                                  |
| :---------------- | :----------------------------------------------------- |
| **Background**    | White (`#FFFFFF`)                                      |
| **Border radius** | 12–20dp (contextual)                                   |
| **Shadow**        | `elevation: 2` (Android) / `shadowOpacity: 0.06` (iOS) |
| **Padding**       | 16–22dp                                                |

Cards must never touch the screen edge. Apply `16dp` horizontal margin on all cards.

### Balance Alignment

Customer and supplier balance amounts must always be **right-aligned** within their row. This improves scanning speed for shopkeepers managing multiple accounts.

```
Customer Name                         ₹2,500
Status: OVERDUE
```

Never left-align financial amounts on list screens.

---

## 6. Components

### Buttons

#### Primary Button

Used for the main action on a screen (`Get Started`, `Continue`, `Create Bill`, `Confirm`).

| Property        | Value                  |
| :-------------- | :--------------------- |
| Background      | `#22C55E`              |
| Hover / Pressed | `#16A34A`              |
| Text            | White, Bold, 16px      |
| Height          | 52dp                   |
| Border radius   | 14dp                   |
| State: Disabled | Opacity 60%            |
| State: Loading  | Spinner replaces label |

#### Secondary Button

Used for alternative or cancel actions.

| Property      | Value               |
| :------------ | :------------------ |
| Background    | Transparent         |
| Border        | 1.5dp, `#22C55E`    |
| Text          | `#22C55E`, SemiBold |
| Height        | 52dp                |
| Border radius | 14dp                |

#### Success Button

Used for payment confirmation actions (`Mark Full Paid`, `Received`).

| Property      | Value       |
| :------------ | :---------- |
| Background    | `#22C55E`   |
| Text          | White, Bold |
| Height        | 52dp        |
| Border radius | 14dp        |

---

### Cards

Cards are the primary content containers throughout the app.

**Use cases:**

- Customer summary (name, balance, status)
- Supplier balance (owed amount, last delivery)
- Dashboard statistics (active buyers, overdue count)

**Anatomy:**

```
┌─────────────────────────────┐  ← border-radius: 16dp
│  [Avatar / Icon]  Title     │  ← padding: 16dp
│                  Subtitle   │
│           [Amount]  [Badge] │
└─────────────────────────────┘  ← shadow: soft
```

---

### Status Chips

Pill-shaped labels used to communicate transaction state at a glance.

| State   | Background | Text Color | Label   |
| :------ | :--------- | :--------- | :------ |
| Paid    | `#DCFCE7`  | `#16A34A`  | PAID    |
| Pending | `#FEF3C7`  | `#D97706`  | PENDING |
| Overdue | `#FEE2E2`  | `#DC2626`  | OVERDUE |
| Partial | `#FEF3C7`  | `#D97706`  | PARTIAL |

**Dimensions:** Height 24–28dp, horizontal padding 8dp, font weight 600, text size 11–12dp, `border-radius: 999dp` (full pill).

---

### Floating Action Button (FAB)

Used for primary quick-entry actions on list screens.

| Property      | Value                                                |
| :------------ | :--------------------------------------------------- |
| Size          | 56–58dp diameter                                     |
| Background    | `#2563EB` (Blue)                                     |
| Icon          | White `+` or contextual line icon, 24dp              |
| Position      | Bottom-right, `20dp` from edge, `24dp` above tab bar |
| Shadow        | Prominent — `elevation: 6` / `shadowOpacity: 0.25`   |
| Border radius | Full circle                                          |

---

### Input Fields

| Property      | Value                                   |
| :------------ | :-------------------------------------- |
| Background    | `#F6F7F9`                               |
| Border        | 1dp `#E5E7EB`; focused: 1.5dp `#22C55E` |
| Height        | 48–52dp                                 |
| Border radius | 12dp                                    |
| Font size     | 16px                                    |
| Label         | Above input, SemiBold 13px, `#1C1C1E`   |

---

### Navigation Bar

Bottom tab navigation bar style.

| Property            | Value                      |
| :------------------ | :------------------------- |
| Background          | `#FFFFFF`                  |
| Active icon color   | `#22C55E`                  |
| Inactive icon color | `#9CA3AF`                  |
| Height              | 64dp + device bottom inset |
| Shadow              | Soft — `elevation: 4`      |

---

### Bottom Sheet / Modal

Used for in-context actions that don't require a new screen (`RecordPaymentModal`, `NewCustomerModal`).

| Property            | Value                              |
| :------------------ | :--------------------------------- |
| Background          | White                              |
| Border radius (top) | 24dp                               |
| Handle              | Centered pill, `40×4dp`, `#E5E5EA` |
| Backdrop            | `rgba(0,0,0,0.4)`                  |
| Padding             | 24dp horizontal, 32dp bottom       |

---

## 7. Icons

### Guidelines

- Use **minimal line icons** — outline style, not filled
- Stroke weight: **1.5–2dp**
- Size: **22–24dp** for navigation; **18–20dp** for inline use
- Color: match surrounding text or use token color

### Recommended Libraries

| Library            | Use Case                                     |
| :----------------- | :------------------------------------------- |
| **Lucide Icons**   | General UI — navigation, actions, status     |
| **Heroicons**      | Alternative for form and modal contexts      |
| **Phosphor Icons** | Extended set for specialized financial icons |

### Icon Properties

Icons must be:

- **Rounded** — avoid sharp geometric forms
- **Simple** — recognizable at 18dp
- **Consistent weight** — do not mix thick and thin icons on the same screen
- **Never used alone as text replacement** — always pair with a label on first use

---

## 8. Motion Guidelines

Animations in CreditBook should be **functional, not decorative**. Every animation must serve a user comprehension or orientation purpose.

### Duration

| Use Case              | Duration                     |
| :-------------------- | :--------------------------- |
| Modal slide up        | 250–300ms                    |
| Toast / snackbar      | 200ms in, auto-dismiss at 3s |
| Success state check   | 250ms                        |
| Tab switch            | 150ms                        |
| Button press feedback | 100ms                        |

### Easing

- **Enter**: `easeOut` — elements decelerate into position
- **Exit**: `easeIn` — elements accelerate out
- **Transitions**: `easeInOut`

### Rules

- No bounce or spring animations on financial confirmation screens — keep them calm and trustworthy
- Avoid animations longer than 400ms
- Never animate content that requires immediate user attention (error states, overdue notices)
- Prefer opacity + translate combinations over scale for modals

---

## 9. UX Patterns

### Color-Coded Financial States

Every transaction row, balance card, and customer entry uses consistent color coding. Users should never need to read a label to determine financial state.

| Scenario                       | Visual Treatment                                      |
| :----------------------------- | :---------------------------------------------------- |
| Customer paid in full          | Green amount text (`#22C55E`) + PAID chip             |
| Customer has balance due       | Red amount text (`#EF4444`) + OVERDUE or PENDING chip |
| Partial payment recorded       | Amber amount text (`#F59E0B`) + PARTIAL chip          |
| My payment to supplier pending | Red balance gradient card (`#DC2626 → #B91C1C`)       |

---

### Quick Entry Pattern

Transactions must be recordable in **3 taps or fewer**:

1. Tap FAB → opens new entry or bill screen
2. Select customer / fill amount
3. Confirm

The most common action on each screen is always reachable without scrolling.

---

### Optimistic UI

Transactions appear in the feed immediately upon submission. The UI does not wait for network confirmation before updating:

1. User submits payment → row appears instantly in the transaction list
2. TanStack Query mutation fires in background
3. On success: query cache is invalidated → data refreshes silently
4. On failure: toast error shown; row reverts

This eliminates perceived latency during high-frequency billing sessions.

---

### Transaction Feed Pattern

Customer and supplier detail screens use a **unified chronological feed** of bills and payments:

- Newest first
- Date-group separators (Today / Yesterday / `DD MMM YYYY`)
- Running balance shown per row
- Left border color indicates type: green = payment, red = bill

---

### Status Chips Over Text Labels

Plain text labels (`Paid`, `Due`, `Partial`) are always replaced with **pill-shaped status chips**. Chips allow users to scan a long list and assess ledger health without reading individual words.

---

## 10. Design Principles

### The Core Metaphor

> CreditBook uses a **Digital Khata Book** design philosophy — combining the familiarity of a traditional Indian ledger with modern fintech visual clarity. The UI is minimal while clearly highlighting important financial information through color-coded balances and gradient summary cards.

---

### Principles

**1. Financial Clarity First**  
The user's financial position must be visible without navigation. The most important number on any screen — net balance, total due, what is owed — must be the largest, most prominent element.

**2. Color as Communication**  
Color is a functional signal, not a decoration. Green means money received. Red means money owed. Amber means action required soon. These associations are applied consistently across every component, screen, and state.

**3. Speed Over Completeness**  
A shop owner recording 30 transactions per day cannot tolerate multi-step flows. Every recording action — bill, payment, delivery — must be completable in under 60 seconds. Reduce required fields to the minimum viable set.

**4. Trust Through Consistency**  
Users trust the app with their business finances. Consistency in layout, color, and behavior builds that trust over time. Do not introduce new patterns without a clear functional reason.

**5. Low Cognitive Load**  
Do not require users to interpret data themselves. Show calculated summaries (net balance, overdue count, running balance per transaction). Use large numbers, clear labels, and color — never raw tables of unsummarized data.

---

_This document is maintained alongside the codebase. Update it whenever a new component, color token, or UX pattern is introduced._
