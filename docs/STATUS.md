# KredBook — Current Status

**Last Updated:** April 9, 2026

## Phase Summary

- **Phase 1 — Shared Ledger:** ✅ Complete
- **Phase 2 — Clean Architecture:** ✅ Complete
- **Phase 3 — Advanced Features:** ✅ Complete
- **Phase 4 — Simplification (Phase 1):** ✅ Complete
- **Phase 4 — Simplification (Phase 2):** 🚧 In Progress

## Highlights (Current Build)

- Shared public ledger with WhatsApp links and phone-based linking
- Unified parties table (customers + suppliers)
- Quick bill creation (amount-first) + edit bill flow with atomic updates
- Business profile edit screen + logo upload
- Product image upload + storage policies
- Payment reminders (daily schedule, snooze, local activity log)
- Public ledger enhancements (last updated, call/WhatsApp)
- Phase 4 Simplification: Home/People/Add/Entries/Profile nav, amount-first add, minimal filters

## Database Notes

- Atomic order edit RPC: `update_order_transaction`
- Orders status values: `Pending`, `Partially Paid`, `Paid`
- Legacy tables dropped: `customers`, `suppliers`
- Storage buckets: `product-images`, `business-logos`

## Runbooks

- `docs/PHASE_3_MCP_RUNBOOK.md` (DB changes via Gemini MCP)
- `docs/EDIT_BILL_TEST_CHECKLIST.md` (manual verification)
