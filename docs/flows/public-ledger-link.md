# Public Ledger Link (Limited / Transitional)

## Purpose

Let a business share a **read-only** Customer ledger via a **token-based** link.

This is a **limited / transitional** capability. It supports the core khata loop (Customer → Entry → Payment) but must stay read-only.

Implementation note: the public view uses transitional “vendor/customer” terminology in code. In docs and UI copy, prefer “business” and “Customer”; label “vendor” as transitional when mentioned.

## Entry Points (where the business starts sharing)

- Customer Detail → Share
- Entry Detail → Share (when sharing an Entry/ledger context)

## Flow (simple steps)

1. User taps **Share**.
2. App generates (or reuses) a share **token** for this Customer.
3. App builds a link like: `https://kredbook.app/l/<token>` (route implemented by `app/l/[token].tsx`).
4. App opens the native share sheet (WhatsApp, SMS, etc.).
5. Recipient opens the link.
6. Recipient sees a **read-only** ledger view backed by Supabase RPC `get_ledger_by_token(p_token)`:
   - business details (name, phone, address; GSTIN/logo if present)
   - balance summary
   - transaction history (Entry-like “Sale” rows and Payment rows)

## What the recipient can and cannot do

Can:
- view the ledger summary and history (read-only)

Cannot:
- edit Customer details
- add Entries
- record Payments

## Security notes (keep it simple)

- The token is the key: **anyone with the link can view** the ledger.
- The public route must remain **read-only** (no mutations / no edit affordances).

## Security notes (keep it simple)

- The token is the key: **anyone with the link can view** the ledger.
- The link should not expose edit actions.
- Businesses should be able to revoke/rotate links (implementation detail; do not treat as core scope).
