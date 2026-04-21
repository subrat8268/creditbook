# Public Ledger Link (Limited / Transitional)

## Purpose

Let a business share a **read-only** Customer ledger with someone via a **token-based** link.

This is a **limited / transitional** capability. It supports the core khata loop (Customer → Entry → Payment) but must stay read-only.

## Entry Points (where the vendor starts sharing)

- Customer Detail → Share
- Entry Detail → Share (when sharing an Entry/ledger context)

## Flow (simple steps)

1. Vendor taps **Share**.
2. App generates (or reuses) a share **token** for this Customer.
3. App builds a link like: `https://kredbook.app/l/<token>`.
4. App opens the native share sheet (WhatsApp, SMS, etc.).
5. Recipient opens the link.
6. Recipient sees a **read-only** ledger:
   - Customer name and balance
   - list of Entries
   - list of Payments

## What the recipient can and cannot do

Can:
- view the ledger summary and history (read-only)

Cannot:
- edit Customer details
- add Entries
- record Payments

## Security notes (keep it simple)

- The token is the key: **anyone with the link can view** the ledger.
- The link should not expose edit actions.
- Vendors should be able to revoke/rotate links (implementation detail; do not treat as core scope).
