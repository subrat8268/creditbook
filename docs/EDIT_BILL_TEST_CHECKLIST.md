# Edit Bill Flow - Test Checklist

Use this checklist for manual verification of edit-bill accuracy and ledger consistency.

## Setup
- Use an order with at least 1 item and some payments recorded.
- Use another order with zero payments.

## Core flows
1) Edit with items (no payments)
   - Increase item quantity or rate
   - Save Only
   - Verify order total, status, and items list update

2) Edit quick-amount order
   - Remove all items so amount-only mode is active
   - Enter a new amount > 0
   - Save Only
   - Verify order has a single item "Bill Amount" and totals update

3) Save & Share
   - Edit any order, choose Save & Share PDF
   - Verify share dialog opens and PDF total matches updated total

## Ledger consistency / edge cases
4) Total lower than paid
   - For an order with payments, attempt to set total below amount already paid
   - Expect a blocking error message and no update

5) Status transitions
   - If amount_paid == total_amount → status = Paid
   - If amount_paid > 0 and < total_amount → status = Partially Paid
   - If amount_paid == 0 → status = Pending

6) Items integrity
   - After editing, order detail should show updated line items
   - For quick-amount edits, verify a single "Bill Amount" line item exists

## Cache checks (quick)
7) After edit, verify the following screens refresh with updated totals:
   - Order detail
   - Customer detail ledger
   - Dashboard balance summaries
