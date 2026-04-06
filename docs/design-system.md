# KredBook Design System

> **Version**: 1.6
> **Last Updated**: April 6, 2026
> **Maintained by**: KredBook Product & Design Team
> **Sync Status**: Aligned with App Version 4.0

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
11. [Screen-Level Sub-Components (v3.6)](#11-screen-level-sub-components-v36)

---

## 1. Introduction

This design system defines the visual language, component patterns, and UX guidelines used across the **KredBook** mobile application. It serves as the single source of truth for product, design, and engineering.

**Goals:**

- Ensure visual consistency across all screens and flows
- Maintain usability at scale as features are added
- Make financial information fast to read and easy to act on

**Optimized for:**

| Priority                | Rationale                                                                                     |
| :---------------------- | :-------------------------------------------------------------------------------------------- |
| **Mobile-first design** | All primary users access KredBook on Android smartphones                                      |
| **Financial clarity**   | Users must understand their ledger state at a glance, without reading every line              |
| **Quick data entry**    | Recording a bill or payment should take fewer than 3 taps                                     |
| **Low cognitive load**  | Shop owners are not necessarily financially literate — the UI must do the interpretation work |

---

## 2. Brand Identity

### Core Identity

| Field            | Value                                             |
| :--------------- | :------------------------------------------------ |
| **Brand Name**   | KredBook                                          |
| **App Slug**     | `kredbook`                                        |
| **Bundle ID**    | `com.kredbook.app`                                |
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

KredBook uses a Digital Khata Book design philosophy. The UI mimics the simplicity of traditional Indian ledger books while adding modern fintech-style visual clarity.

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

| Token             | Color Name | Hex       | Usage                                                          |
| :---------------- | :--------- | :-------- | :------------------------------------------------------------- |
| `primary`         | Green      | `#22C55E` | Primary actions, FAB, active nav state, confirmations          |
| `primary-dark`    | Dark Green | `#16A34A` | Hover / pressed state for primary green                        |
| `success`         | Green      | `#22C55E` | Money received, paid invoices, positive balances               |
| `danger`          | Red        | `#E74C3C` | Money owed, overdue accounts, negative values, delete actions  |
| `dangerStrong`    | Dark Red   | `#DC2626` | Dashboard customer balance card gradient start                 |
| `warning`         | Amber      | `#F59E0B` | Pending payments, reminders, partial transactions              |
| `supplierPrimary` | Pink       | `#DB2777` | Supplier-side gradient cards, Financial Position supplier stat |
| `fab`             | Blue       | `#2563EB` | Floating Action Button background                              |
| `background`      | Light Gray | `#F6F7F9` | App background — reduces eye strain                            |
| `surface`         | White      | `#FFFFFF` | Cards, panels, modals                                          |
| `text-primary`    | Near Black | `#1C1C1E` | Headings, body text, financial values                          |
| `text-secondary`  | Cool Gray  | `#6B7280` | Labels, captions, metadata                                     |
| `border`          | Light Gray | `#E5E7EB` | Row separators, input borders                                  |

> **Token enforcement rule**: All colors must come from `src/utils/theme.ts`. No raw hex values are permitted in component files. `dangerStrong` replaces the earlier `damgerStrong` typo — do not use the old spelling.

### Dashboard Gradient Cards

KredBook dashboards use highlight cards with gradients to display important financial summaries. Each card type uses a distinct gradient that communicates the financial context at a glance.

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

### Dashboard "Both" Mode — Split Hero Card

When `dashboard_mode = 'both'` the home dashboard hero area splits into two side-by-side panels:

| Panel           | Background | Amount Color | Label                           |
| :-------------- | :--------- | :----------- | :------------------------------ |
| **YOU RECEIVE** | `#F0FDF4`  | `#22C55E`    | Total receivable from customers |
| **YOU OWE**     | `#FEF2F2`  | `#E74C3C`    | Total payable to suppliers      |

Below the two panels a **Net Position row** displays: `receivables − payables` — green text if positive, red if negative.

### Financial State Color Mapping

Colors are the primary communication channel for financial state — not text alone.

| Financial State   | Color | Token     | When to Use                                                  |
| :---------------- | :---- | :-------- | :----------------------------------------------------------- |
| Paid / Received   | Green | `success` | Money has been received; balance cleared; positive outcome   |
| Owed / Overdue    | Red   | `danger`  | Outstanding balance; overdue account; action required now    |
| Pending / Partial | Amber | `warning` | Payment partially made; reminder state; action required soon |
| Primary Action    | Green | `primary` | Buttons, FAB, active navigation, confirmations               |

> **Rule**: Never use red or amber as decorative colors. Reserve them strictly for financial states that require user attention.

### Avatar Palette

A fixed array of 6 accessible colors (`colors.avatarPalette`) used for customer and product initials avatars. Hash of the display name determines which color is assigned, ensuring the same customer always gets the same avatar color across all screens.

```ts
avatarPalette: [
  "#4F9CFF",
  "#9B59B6",
  "#E91E8C",
  "#00BCD4",
  "#FF5722",
  "#F59E0B",
];
```

> **Never hardcode avatar colors.** Always reference `colors.avatarPalette[hash % colors.avatarPalette.length]`.

### NativeWind / Tailwind Tokens

These tokens are defined in `tailwind.config.js` and used throughout the app:

```js
colors: {
  primary:     '#22C55E',
  primaryDark: '#16A34A',
  fab:         '#2563EB',
  success:     '#22C55E',
  danger:      '#E74C3C',
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

| State   | Background | Text Color | Label   | Theme token      |
| :------ | :--------- | :--------- | :------ | :--------------- |
| Paid    | `#DCFCE7`  | `#16A34A`  | PAID    | `colors.paid`    |
| Pending | `#FEF3C7`  | `#D97706`  | PENDING | `colors.pending` |
| Overdue | `#FEE2E2`  | `#DC2626`  | OVERDUE | `colors.overdue` |
| Partial | `#DBEAFE`  | `#1D4ED8`  | PARTIAL | `colors.partial` |

**Dimensions:** Height 24–28dp, horizontal padding 8dp, font weight 600, text size 11–12dp, `border-radius: 999dp` (full pill).

> `Partial` chip is blue (not amber) to distinguish it visually from `Pending`. Both use `colors.partial.bg` / `colors.partial.text` tokens.

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

Used for in-context actions that don't require a new screen (`RecordCustomerPaymentModal`, `RecordPaymentMadeModal`).

**Library**: `@gorhom/bottom-sheet` v5.2.6

| Property            | Value                                                  |
| :------------------ | :----------------------------------------------------- |
| Background          | White                                                  |
| Border radius (top) | 24dp                                                   |
| Handle              | Centered pill, `40×4dp`, `#E5E5EA`                     |
| Backdrop            | `rgba(0,0,0,0.4)`                                      |
| Padding             | 24dp horizontal, 32dp bottom                           |
| Snap Points         | `["65%"]` (payment received), `["62%"]` (payment made) |

---

### Toast

Animated slide-down notification for success and error feedback. Implemented in `src/components/feedback/Toast.tsx`.

**Usage**: Import `useToast()` hook — `showToast({ message, type })`. `ToastProvider` must wrap the root layout.

| Property      | Value                                          |
| :------------ | :--------------------------------------------- |
| Position      | Top of screen, below status bar                |
| Animation     | Slide-down (200ms easeOut), auto-dismiss at 3s |
| Success color | `#22C55E` background, white text               |
| Error color   | `#E74C3C` background, white text               |
| Border radius | 12dp                                           |
| Shadow        | Soft elevation 4                               |

```tsx
const { showToast } = useToast();
showToast({ message: "Payment recorded", type: "success" });
showToast({ message: "Something went wrong", type: "error" });
```

---

### EmptyState

Full-screen (or section-level) empty state component used when lists have no data. Implemented in `src/components/ui/EmptyState.tsx`.

| Prop          | Type         | Description                                |
| :------------ | :----------- | :----------------------------------------- |
| `title`       | `string`     | Primary heading (e.g., "No customers yet") |
| `description` | `string`     | Supporting body text                       |
| `cta`         | `string`     | Optional CTA button label                  |
| `onCta`       | `() => void` | Callback called when CTA button is tapped  |

- Icon: `CircleOff` from `lucide-react-native` (48dp, `#9CA3AF`)
- CTA button: green `#22C55E` fill, white text, 14dp border-radius

---

## 7. Icons

### Guidelines

- Use **minimal line icons** — outline style, not filled
- Stroke weight: **1.5–2dp**
- Size: **22–24dp** for navigation; **18–20dp** for inline use
- Color: match surrounding text or use token color

### Icon Library

**KredBook** uses **`lucide-react-native`** as the sole icon library. The `@expo/vector-icons` package (Ionicons, MaterialIcons, etc.) has been completely removed from the codebase as of v3.3.

| Library                   | Status     | Notes                                                   |
| :------------------------ | :--------- | :------------------------------------------------------ |
| **`lucide-react-native`** | ✅ Active  | All icons — navigation, actions, status, indicators, UI |
| `@expo/vector-icons`      | ❌ Removed | Fully replaced; do not re-introduce                     |

**Usage example**:

```tsx
import {
  CircleOff,
  TrendingUp,
  ArrowLeft,
  ReceiptText,
} from "lucide-react-native";

<TrendingUp size={22} color="#22C55E" strokeWidth={2} />;
```

### Icon Properties

Icons must be:

- **Rounded** — avoid sharp geometric forms
- **Simple** — recognizable at 18dp
- **Consistent weight** — do not mix thick and thin icons on the same screen
- **Never used alone as text replacement** — always pair with a label on first use

---

## 8. Motion Guidelines

Animations in **KredBook** should be **functional, not decorative**. Every animation must serve a user comprehension or orientation purpose.

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
| Customer has balance due       | Red amount text (`#E74C3C`) + OVERDUE or PENDING chip |
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

### Toast Notifications

Surface success and error feedback using the `useToast()` hook from `Toast.tsx`.

- **Never block the UI** with a modal for a success state — always use a toast
- Success toasts auto-dismiss after 3 seconds
- Error toasts remain until dismissed or 5 seconds
- Toast slides down from the top of the screen — never overlaps FAB or bottom navigation

```tsx
const { showToast } = useToast();
// On payment success:
showToast({ message: "Payment of ₹2,500 recorded", type: "success" });
// On API error:
showToast({ message: "Failed to save. Check your connection.", type: "error" });
```

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

### Empty State Pattern

When a list screen has no data, use the shared `EmptyState` component. Never leave a blank white screen.

```tsx
<EmptyState
  title="No customers yet"
  description="Add your first customer to start tracking credit."
  cta="Add Customer"
  onCta={() => openNewCustomerModal()}
/>
```

- Always provide `title` + `description` + `cta` for actionable empty states (e.g., no customers, no products)
- For read-only empty states (e.g., no transactions in a filtered view), `cta` and `onCta` can be omitted
- Icon: `CircleOff` from `lucide-react-native` (48dp, `#9CA3AF`) indicates "nothing here"

---

## 10. Design Principles

### The Core Metaphor

> **KredBook** uses a **Digital Khata Book** design philosophy — combining the familiarity of a traditional Indian ledger with modern fintech visual clarity. The UI is minimal while clearly highlighting important financial information through color-coded balances and gradient summary cards.

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

---

## 11. Screen-Level Sub-Components (v3.6)

Starting in v3.6, multi-step screens extract their repeating UI pieces as **inline sub-components** declared at the top of the screen file (not separate files). These are documented here so designers and developers can reference them without reading individual screen files.

### Styling Convention

All redesigned screens use:

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
const styles = StyleSheet.create({ ... });
```

`ScreenWrapper` + NativeWind `className` strings are **not used** on main screens as of v3.6.

---

### `SectionCard` — ProfileScreen

A white rounded card with an all-caps gray section label above its content.

```tsx
function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {children}
    </View>
  );
}
// sectionCard: bg=#FFFFFF, borderRadius=16, padding=0, marginBottom=12, shadow elevation=1
// sectionLabel: color=neutral[500], fontSize=11, fontWeight='700', letterSpacing=1, marginBottom=8, paddingHorizontal=16, paddingTop=14
```

---

### `DetailRow` — ProfileScreen

A single row inside a `SectionCard`: green icon box on the left, stacked label+value in the middle, `ChevronRight` on the right.

```tsx
function DetailRow({ Icon, label, value, last, onPress }: DetailRowProps) { ... }
// Props:
//   Icon       — lucide-react-native component
//   label      — string (e.g., "Business Name")
//   value      — string (e.g., "Raj Kirana Store")
//   last?      — boolean — suppresses bottom border on last row
//   onPress?   — makes the row tappable (navigates or triggers action)
//
// Icon box: width/height=36, borderRadius=10, bg=colors.primary.light, icon color=colors.primary.DEFAULT, size=18
// Label: fontSize=11, color=neutral[500]
// Value: fontSize=14, fontWeight='600', color=neutral[800]
// ChevronRight: size=16, color=neutral[400]
```

---

### `SegmentControl<T>` — ProfileScreen

A generic 3-option segment control. The active option gets green bg (`primary.light`) and green bold text. Inactive options get neutral bg.

```tsx
function SegmentControl<T extends string>({
  options, value, onChange
}: { options: { label: string; value: T }[]; value: T; onChange: (v: T) => void }) { ... }
// Container: flexDirection='row', borderRadius=10, bg=neutral[100], padding=3
// Active option: bg=primary.DEFAULT, borderRadius=8
// Active text: color=#FFFFFF, fontWeight='700'
// Inactive text: color=neutral[600], fontWeight='500'
```

---

### `ExportRow` — ExportScreen

A single export type row: colored icon box on the left, label + description text in the middle, a colored pill "Export CSV" button on the right.

```tsx
function ExportRow({ Icon, label, desc, pillColor, pillBg, iconColor, iconBg, loading, disabled, onPress }: ExportRowProps) { ... }
// Icon box: 40×40, borderRadius=10
// Pill button: paddingHorizontal=14, paddingVertical=6, borderRadius=20, bg=pillBg, text color=pillColor
// Row separator: 1dp neutral[100] border on all rows except last
```

---

### `DateInput` — ExportScreen

A text input with a calendar icon inside a bordered row, used for From/To date entry.

```tsx
function DateInput({ label, placeholder, value, onChangeText }: DateInputProps) { ... }
// Container: borderWidth=1, borderColor=neutral[200], borderRadius=10, bg=neutral[50]
// CalendarDays icon: size=16, color=neutral[400], on the left inside the row
// TextInput: flex=1, placeholderTextColor=neutral[400]
// Label text: fontSize=11, fontWeight='600', color=neutral[500]
```

---

### `StatCard` — Financial Position Screen

A card showing a single financial stat with a TrendingUp/TrendingDown icon, label, and large amount.

```tsx
function StatCard({ label, amount, icon: Icon, bg, iconBg, iconColor, textColor }: StatCardProps) { ... }
// Card: bg=bg prop, borderRadius=16, padding=18, flex=1
// Icon circle: width/height=44, borderRadius=22, bg=iconBg
// Amount: fontSize=24, fontWeight='800', color=textColor
// Label: fontSize=13, color=textColor opacity 0.7
```

---

### `NetCard` — Financial Position Screen

The dark net-position card showing receivables minus payables.

```tsx
function NetCard({ net }: { net: number }) { ... }
// bg: #1C2333, borderRadius=16, padding=20
// Amount: fontSize=32, fontWeight='800', color=#FFFFFF
// TrendingUp/TrendingDown icon inside a colored circle
```

---

### ~~`InsightPill`~~ — Financial Position Screen — **[Removed in v3.8]**

> **Removed**: This component was deleted in v3.8 as part of the FinancialPositionScreen refactor. Do not re-implement. Use the `StatCard` border/subtitle row for contextual hints instead.

~~A small pill chip showing a contextual insight (e.g., "Healthy" or "Monitor").~~

```tsx
// REMOVED — function InsightPill({ label, color, bg }) was deleted in v3.8
```
