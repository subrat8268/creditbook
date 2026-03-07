# CreditBook UX Context

> **Purpose**: This document provides complete UX context for AI UI generation tools (e.g., Google Stitch, Galileo, Uizard) and human designers onboarding to the CreditBook product.
> **Last Updated**: March 5, 2026
> **References**: `docs/prd.md`, `docs/design-system.md`, `docs/roadmap.md`, `README.md`

---

## 1. Product Overview

**CreditBook** is a mobile-first digital credit ledger for Indian retailers, wholesalers, and small business owners.

It replaces the traditional paper **khata book** — the handwritten ledger that millions of Indian shop owners use to track customer credit. The app makes financial management fast, accurate, and visible on a smartphone.

### What users do in the app

| Action                   | Description                                       |
| :----------------------- | :------------------------------------------------ |
| Track customer credit    | Know exactly how much each customer owes          |
| Record payments          | Log money received from customers                 |
| Generate bills           | Create itemized PDF invoices                      |
| Manage supplier balances | Track what the business owes its distributors     |
| View financial position  | See total receivable vs total payable at a glance |

### Core product promise

> "Track Credit. Get Paid Faster."

The UI must always reflect this — put the money front and center, make recording fast, and make outstanding dues impossible to miss.

---

## 2. Target Users

### Retailers

**Who they are**: Shop owners who sell goods directly to local customers and extend credit on purchases.

**Examples**: Kirana stores, medical shops, hardware shops, clothing retailers.

**How they use the app**:

- Open the app when a customer buys on credit → create a bill
- When a customer pays → record the payment
- Check who hasn't paid in a while → send a WhatsApp reminder
- End of day → check total amount owed to them

**Key need**: Speed. They are serving multiple customers at a counter and cannot spend more than 60 seconds recording a transaction.

---

### Wholesalers

**Who they are**: Distributors who supply goods to multiple retailers and manage complex, high-value credit cycles.

**Examples**: FMCG distributors, grain/vegetable wholesalers, textile suppliers.

**How they use the app**:

- Record deliveries to retailers with itemized product lists
- Log loading (transport) charges separately from goods
- Track partial payments received against bulk invoices
- Monitor which retailers have been overdue the longest

**Key need**: Clarity. They need to know the net picture across many buyers — who owes the most, who is overdue, and what their net receivable position is.

---

### Small Businesses

**Who they are**: Service providers and specialty retailers who extend informal credit to regular customers.

**Examples**: Auto repair shops, pharmacies, tiffin services, building material shops.

**How they use the app**:

- Record service charges against a named customer
- Track payments received in cash, UPI, or cheque
- Identify customers who have not paid in 30+ days

**Key need**: Simplicity. This user may not be financially literate. The app must do the interpretation work — show summaries, use color, never show raw tables.

---

## 3. Core User Goals

Every screen should support at least one of these goals:

| Goal                                 | User Statement                                        |
| :----------------------------------- | :---------------------------------------------------- |
| **Record a bill**                    | "I just sold goods to a customer on credit — log it." |
| **Record a payment received**        | "A customer just paid me — update their balance."     |
| **See who owes money**               | "Show me which customers have outstanding dues."      |
| **Track supplier payment**           | "I need to pay my supplier — how much do I owe them?" |
| **Generate an invoice**              | "Create a PDF bill I can share on WhatsApp."          |
| **Check overall financial position** | "How much is owed to me total? How much do I owe?"    |

---

## 4. Main Screens

### 4.1 Welcome Screen

**Purpose**: First impression; communicate the product value in under 5 seconds.

**Main UI components**:

- CreditBook logo and tagline ("Track Credit. Get Paid Faster.")
- Illustration communicating the khata-to-digital concept
- "Get Started" primary button
- "I already have an account" text link

**Key user actions**:

- Tap "Get Started" → go to Signup
- Tap login link → go to Login

---

### 4.2 Login / Signup

**Purpose**: Authenticate the user. MVP uses email + password (free tier; no SMS costs).

> **Note**: Phone OTP login is a planned Phase 7 feature and should not be designed for the MVP.

**Main UI components**:

- Email input field
- Password input field (signup: with confirm password)
- Primary "Sign In" / "Create Account" button
- Forgot password text link
- Toggle: "Don't have an account? Sign up" / "Already have an account? Log in"

**Key user actions**:

- Submit credentials → authenticate via Supabase Auth
- Forgot password → password reset email flow

---

### 4.3 Role Selection

**Purpose**: Determine which product surfaces to activate based on the user's business type.

**Main UI components**:

- Screen title: "What describes your business?"
- Three role cards, each with:
  - Illustration or icon
  - Role name (Retailer / Wholesaler / Small Business)
  - One-line description
  - Selection indicator (ring or checkmark)
- "Continue" primary button (active only when a role is selected)

**Key user actions**:

- Select role → saves `dashboard_mode` to user profile
- Tap "Continue" → proceed to Business Setup

---

### 4.4 Business Setup (Onboarding)

**Purpose**: Collect the business details needed to personalise bills and the dashboard.

**Main UI components**:

- Progress indicator (step 1 of 3 / step 2 of 3)
- Input fields: business name, GSTIN (optional), UPI ID (optional), bill prefix (default: INV), bank account details (bank name, account number, IFSC)
- "Continue" primary button
- "Skip for now" text link for optional fields

**Key user actions**:

- Fill business details → save to `profiles` table
- Tap "Continue" → proceed to Ready screen

---

### 4.5 Ready Screen (Onboarding Completion)

**Purpose**: Confirm setup is complete and guide the user to their first action.

**Main UI components**:

- Success illustration
- Summary of what was set up (business name, bill prefix)
- "Add Your First Customer" primary button
- "Go to Dashboard" secondary action

**Key user actions**:

- Tap "Add First Customer" → open Customer screen
- Tap "Go to Dashboard" → navigate to Home Dashboard

---

### 4.6 Home Dashboard

**Purpose**: Give the user a single-screen financial health snapshot the moment they open the app.

**Main UI components**:

- Header: avatar, business name, notification icon
- **Hero card** (gradient `#DC2626 → #B91C1C`): total net receivable amount in large white text
- Action bar: "View Report" / "Send Reminder" buttons
- **Stat cards**: Active Buyers count + Overdue count (side by side)
- **Recent Activity feed**: last 5 transactions with customer name, amount, status chip, and time
- **Floating Action Button** (gradient): "+" for creating a new bill

**Key user actions**:

- Tap FAB → go to New Bill screen
- Tap a recent activity row → go to Customer Detail
- Tap "Send Reminder" → trigger reminder flow for overdue customers

---

### 4.7 Customers List Screen

**Purpose**: Browse all customers and quickly assess their credit status.

**Main UI components**:

- Pill-shaped search bar (background `#F6F7FB`, placeholder in `#8E8E93`)
- Filter tabs: All / Overdue / Paid / Pending
- Customer cards (FlatList):
  - Initials avatar (52×52dp, deterministic background color from 8-color palette)
  - Customer name (bold)
  - Last active date (secondary text)
  - Balance amount (right-aligned, color-coded: red=overdue, amber=pending, black=paid/advance)
  - Status badge: OVERDUE / PENDING / PAID / ADVANCE
- FAB: add new customer
- Secondary FAB (above primary): import from phone contacts

**Key user actions**:

- Tap a customer card → go to Customer Detail
- Tap primary FAB → open New Customer modal
- Tap secondary FAB → open Contacts Picker modal
- Tap a filter tab → filter list in-memory

---

### 4.8 Customer Detail Screen

**Purpose**: Full financial relationship view for a single customer.

**Main UI components**:

- Custom header: back button, customer name, last-active subtitle, PDF icon, call icon
- **Hero card** (red gradient `#C0392B → #7B1010`): TOTAL BALANCE DUE in large white text, overdue badge if applicable, last bill date
- 3 **quick-action cards** (side by side): New Bill / Received / Send Reminder
- Transaction feed sub-tabs: All / Bills Given / Payments
- **Transaction rows**: date-group pill separators (Today / Yesterday / date), each row shows type icon, description, amount (green=payment, red=bill), running balance ("Bal: ₹X"), left-side colored border
- **Footer**: "Download Statement" dark pill button (generates full PDF via expo-print)

**Key user actions**:

- Tap "New Bill" → go to New Bill screen
- Tap "Received" → open Record Payment bottom-sheet
- Tap "Send Reminder" → open WhatsApp with pre-filled message
- Tap "Download Statement" → generate PDF and open share sheet

---

### 4.9 Record Payment Bottom Sheet (Modal)

**Purpose**: In-context payment recording without leaving the Customer Detail screen.

**Main UI components**:

- Bottom sheet with handle pill at top
- Title: "Record Payment"
- Amount input (numeric keyboard, large font)
- 5 payment mode chips: Cash / UPI / NEFT / Draft / Cheque (single select)
- Two buttons side by side:
  - "Record Partial" (outlined, primary border)
  - "Mark Full Paid" (filled, primary green)
- Backdrop overlay dimming the screen behind

**Key user actions**:

- Enter amount + select mode + tap "Record Partial" → save partial payment
- Tap "Mark Full Paid" (auto-fills full balance) → close the bill
- Tap backdrop → dismiss without saving

---

### 4.10 New Bill Screen

**Purpose**: Create an itemized bill for a customer with live total calculation.

**Main UI components**:

- Customer selector (shows previous balance auto-populated below)
- Product search with cart-add interface
- Line items: product name, quantity, rate, subtotal — editable inline
- GST % input (applied to items total)
- Loading charge input (non-taxable, added after GST)
- Live bill summary: Items + GST + Loading + Previous Balance = **Grand Total**
- Bill number (auto-assigned, displayed read-only)
- "Create Bill" primary button

**Key user actions**:

- Search and add products → build cart
- Edit rate inline → override catalog price for this bill
- Tap "Create Bill" → save order, generate PDF, offer share

---

### 4.11 Suppliers List Screen

**Purpose**: Browse all suppliers and see outstanding balances at a glance.

**Main UI components**:

- Supplier cards (sorted by highest balance owed):
  - Supplier name and phone
  - Balance owed amount (red, large)
  - Last delivery date
- FAB: add new supplier

**Key user actions**:

- Tap a supplier → go to Supplier Detail
- Tap FAB → open New Supplier modal

---

### 4.12 Supplier Detail Screen

**Purpose**: Full balance and delivery history for a single supplier.

**Main UI components**:

- Header: supplier name, contact icons
- Balance card (red): total amount owed
- Bank details section (for reference when paying)
- Delivery history list: date, total, advance paid, items count
- "Record Delivery" button
- "Record Payment Made" button

**Key user actions**:

- Tap "Record Delivery" → open Record Delivery modal
- Tap "Record Payment Made" → open Record Payment Made modal

---

### 4.13 Net Position Dashboard

**Purpose**: Aggregate financial health — receivable vs payable in one view.

**Main UI components**:

- **"Customers Owe Me"** card (green): sum of all positive customer balances
- **"I Owe Suppliers"** card (red): sum of all outstanding supplier balances
- **"Net Position"** card (green if positive, amber if negative): receivable − payable
- Visible cards controlled by dashboard mode (Seller / Distributor / Both in Profile)

**Key user actions**:

- View net position at a glance — no taps required

---

### 4.14 Profile / Settings Screen

**Purpose**: Manage business details, app preferences, and account settings.

**Main UI components**:

- Business profile fields: name, GSTIN, UPI ID, bill prefix
- Bank account details: bank name, account number, IFSC
- Dashboard mode toggle: Seller / Distributor / Both
- Language toggle: English / हिन्दी
- Export Data button
- Sign Out button

**Key user actions**:

- Edit business details → save to `profiles`
- Change dashboard mode → updates visible dashboard cards
- Toggle language → changes app UI language
- Tap "Export Data" → go to Export screen

---

## 5. Key Features

### Customer Credit Ledger

Tracks the complete credit history for each customer — every bill given and every payment received — in a single chronological feed. Automatically calculates and displays the running balance per transaction row. Customers are color-coded by financial state so the user can assess their ledger at a glance.

---

### Payment Recording

Records payments received from customers against open balances. Supports 5 payment modes: Cash, UPI, NEFT, Demand Draft, Cheque. Allows partial payments (enter any amount) or full settlement (mark entire balance cleared). Accessible via a bottom-sheet modal from the Customer Detail screen.

---

### Bill Creation

Creates itemized bills with product catalog search, adjustable pricing, GST %, and loading charge. Previous customer balance is automatically pulled in at creation time. Bill number is auto-assigned with sequential IDs and custom prefix support. Output is a branded PDF invoice with business details, bank info, and UPI QR code.

---

### Supplier Management

Tracks what the business owes to its own suppliers. Supports recording deliveries (itemized rows with item × qty × rate), loading charges, and advance paid. Records payments made to suppliers with mode and notes. Balance owed = total deliveries − total payments made, displayed prominently per supplier.

---

### Net Position Dashboard

Single-screen financial summary showing: total owed by customers (green), total owed to suppliers (red), and net position (green or amber). Cards shown depend on the user's dashboard mode (Seller/Distributor/Both). Requires no interaction — the financial position is visible the moment the screen opens.

---

### Transaction History

Unified chronological feed of bills and payments per customer. Newest entries first. Date-group separators (Today / Yesterday / full date). Each row shows: type icon, label, amount (color-coded), and running balance. Filterable by type: All / Bills Given / Payments.

---

### Payment Reminders

One-tap WhatsApp reminder from the Customer Detail screen. Pre-fills a message with the customer's name, outstanding balance, and the business name. No typing required — the user taps "Send Reminder" and the WhatsApp compose screen opens with the message ready.

---

## 6. UX Patterns

### Color-Coded Financial States

Color is the primary communication channel for financial state — never rely on text labels alone.

| State             | Color | Hex       | Used On                                                               |
| :---------------- | :---- | :-------- | :-------------------------------------------------------------------- |
| Paid / Received   | Green | `#22C55E` | Payment rows, PAID badge, positive balance amounts                    |
| Owed / Overdue    | Red   | `#EF4444` | Bill rows, OVERDUE badge, red balance amounts, supplier balance cards |
| Pending / Partial | Amber | `#F59E0B` | PENDING badge, amber balance amounts, partial payment states          |
| Primary Action    | Green | `#22C55E` | FAB, active nav, primary buttons, confirmations                       |

Users should be able to scan a list of 20 customers and understand the health of their ledger in under 3 seconds without reading any text.

---

### Quick Entry Pattern (≤3 Taps)

Every primary recording action must be completable in 3 taps or fewer:

```
Record a payment:
1. Tap customer from list
2. Tap "Received" on Customer Detail
3. Enter amount + tap "Record Partial" or "Mark Full Paid"

Create a bill:
1. Tap FAB on any screen
2. Select customer, add items
3. Tap "Create Bill"
```

Never require more steps than this for the primary action on any screen.

---

### Status Chips

Plain text labels are replaced with pill-shaped chips:

- Height: 24–28dp
- Horizontal padding: 8dp
- Font weight: SemiBold (600)
- Text size: 13px
- Border radius: 999dp (full pill)
- Background and text color are paired per state (see table below)

| State   | Background | Text Color |
| :------ | :--------- | :--------- |
| Paid    | `#DCFCE7`  | `#16A34A`  |
| Pending | `#FEF3C7`  | `#D97706`  |
| Overdue | `#FEE2E2`  | `#DC2626`  |

Used on: transaction rows, customer cards, activity feed items.

---

### Floating Action Button (FAB)

- Diameter: 56–58dp, circle
- Background: `#2563EB` (Blue)
- Icon: white, 24dp
- Position: bottom-right, 20dp from edge, 24dp above tab bar
- Shadow: prominent (`elevation: 6`)
- Purpose: always-reachable entry point for the most important action on the screen

---

### Transaction Feed Pattern

Used on Customer Detail and any timeline view:

- Unified list: bills and payments on a single timeline, newest first
- Date-group pill separators: "Today", "Yesterday", or "15 Feb 2026"
- Each row:
  - Left colored border (green = payment, red = bill)
  - Type icon + label
  - Amount (right-aligned, color-coded)
  - Running balance below amount ("Bal: ₹2,400")
- Sub-tab filters: All / Bills Given / Payments

---

### Bottom Sheet Modals

Used for in-context actions that do not require navigating away (record payment, add customer, record delivery):

- Slides up from bottom
- Handle pill at top (40×4dp, `#E5E5EA`)
- Background: white, `border-radius-top: 24dp`
- Backdrop: `rgba(0,0,0,0.4)` — tapping closes the sheet
- Bottom padding: 32dp (accounts for Android gesture nav)

---

## 7. Visual Design Rules

### Design Philosophy

**"Digital Khata Book"** — The UI mimics the simplicity of traditional Indian ledger books while adding modern fintech-style visual clarity. Financial balances are instantly visible, transaction entry is fast, and color signals do the interpretation work for the user.

### Color Tokens

| Token            | Hex       | Use                                      |
| :--------------- | :-------- | :--------------------------------------- |
| `primary`        | `#22C55E` | Brand, CTAs, active nav, primary buttons |
| `primary-dark`   | `#16A34A` | Hover / pressed state for primary green  |
| `fab`            | `#2563EB` | Floating Action Button                   |
| `success`        | `#22C55E` | Received money, paid state               |
| `danger`         | `#EF4444` | Owed money, overdue state                |
| `warning`        | `#F59E0B` | Pending payments, partial state          |
| `background`     | `#F6F7F9` | App background, search inputs            |
| `surface`        | `#FFFFFF` | Cards, modals, panels                    |
| `text-primary`   | `#1C1C1E` | All headings and primary body text       |
| `text-secondary` | `#6B7280` | Labels, captions, metadata               |
| `border`         | `#E5E7EB` | Row separators, input borders            |

### Dashboard Gradient Cards

| Card                  | Gradient            | Used For                         |
| :-------------------- | :------------------ | :------------------------------- |
| Customer Balance Card | `#DC2626 → #B91C1C` | Outstanding customer balance due |
| Supplier Payable Card | `#DB2777 → #BE185D` | Supplier payments owed           |
| Net Position Card     | `#0F172A → #334155` | Overall net financial summary    |

---

### Cards

- Background: white `#FFFFFF`
- Border radius: 12–20dp (use 16dp as default)
- Shadow: subtle — `elevation: 2` (Android), `shadowOpacity: 0.06` (iOS)
- Padding: 16–22dp internal
- Margin: 16dp from screen edges — cards must never touch screen edges

---

### Typography

- **Font family**: Inter (system default fallback: SF Pro on iOS, Roboto on Android)
- **Financial amounts**: Always bold (700), large (28px minimum for primary values), never truncated
- **Headings**: Bold (700), 22–28dp
- **Subheadings**: SemiBold (600), 16–18dp
- **Body**: Regular (400), 14–15dp
- **Captions / meta**: Medium (500), 11–13dp, `#8E8E93`

---

### Layout

- **Mobile-first**: Single-column layout. Design for 375–420dp width.
- **Horizontal padding**: 16dp on all screens — consistent across every screen
- **Tab bar height**: 64dp + device bottom inset (edge-to-edge Android support)
- **Safe areas**: Respect top and bottom safe area insets on all screens

---

## 8. Important UX Constraints

| Constraint                                      | Reason                                                                                       |
| :---------------------------------------------- | :------------------------------------------------------------------------------------------- |
| **Simple enough for non-technical shop owners** | Many users have limited smartphone literacy; no financial jargon                             |
| **Any transaction in under 60 seconds**         | Users are often serving customers at a counter — no time for complex flows                   |
| **Financial balance always visible**            | The user must never have to navigate to find their net position                              |
| **No complex forms**                            | Reduce required fields to the minimum needed to save the record                              |
| **Large financial numbers**                     | Amounts must be the largest text on financial screens — never smaller than body text         |
| **Color = financial state**                     | Never communicate paid/owed/pending status through text labels alone                         |
| **Optimistic UI**                               | Transactions must appear instantly — never show a loading spinner where a result is expected |
| **Offline tolerance**                           | Core recording (bills, payments) must work without an internet connection and sync later     |

---

## 9. Future Features (Context Only)

These features are planned but should **not** be included in initial UI designs:

| Feature                       | Phase   | Notes                                                  |
| :---------------------------- | :------ | :----------------------------------------------------- |
| **Phone OTP login**           | Phase 7 | MVP uses email + password to avoid SMS costs           |
| **UPI in-app payments**       | Phase 7 | Collect payments via UPI deep link or Razorpay SDK     |
| **Push notifications**        | Phase 7 | Overdue alerts, payment confirmations                  |
| **Analytics dashboard**       | Phase 7 | Revenue trends, collection rate, monthly comparison    |
| **Multi-user staff accounts** | Phase 7 | Owner / Billing Staff / View-Only roles                |
| **Credit scoring**            | Phase 8 | Customer reliability score from payment history        |
| **Business financing**        | Phase 8 | Working capital loans underwritten by transaction data |
| **Automated bookkeeping**     | Phase 8 | Auto-categorise transactions, GST filing export        |

Design the MVP screens without placeholders for these features.

---

## 10. UX Goal

> "A digital khata book designed for modern shop owners — combining the familiarity of a traditional ledger with modern fintech dashboards."

CreditBook blends the simplicity of a physical khata book with fintech-quality visual clarity. Color-coded balances and gradient summary cards make financial status instantly readable. The interface stays minimal so shopkeepers can focus on what matters: knowing who owes what and getting paid faster.

### The four non-negotiable qualities

| Quality             | What it means in the UI                                                    |
| :------------------ | :------------------------------------------------------------------------- |
| **Simple**          | No screen should require more than one primary decision from the user      |
| **Fast**            | The app must feel instant — optimistic UI, no unnecessary loading states   |
| **Trustworthy**     | Consistent color signals, clear audit trail, reliable balance calculations |
| **Finance-focused** | Financial amounts are always the largest, most prominent element on screen |

Every design decision should be evaluated against these four qualities before shipping.

---

_This document is intended for use with AI design generation tools and human designers. For technical implementation details, see [`docs/prd.md`](./prd.md). For the full design token reference, see [`docs/design-system.md`](./design-system.md)._
