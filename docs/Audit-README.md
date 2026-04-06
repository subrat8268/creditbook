# Dashboard UI & Logic Audit

## Scope
- Align `app/(main)/dashboard/index.tsx` with Seller/Distributor/Both Figma designs
- Enhance distributor "Pay Supplier" flow with supplier picker, summary, and payment modal
- Ensure reminders/payments surface toast confirmations

## Key Changes
1. **Mode-aware hero & stats**
   - Seller: customer-focused hero + Active Buyers/Overdue cards
   - Distributor: supplier hero (View Suppliers / Record Delivery) + Active Suppliers/Overdue cards
   - Both: Net Position card with range chips & shimmer

2. **Data exposure**
   - `getDashboardData` & `useDashboard` now return `activeBuyers`, `activeSuppliers`, `overdueSuppliersList`
   - Shared preference store persists Net Position range

3. **Supplier follow-ups & payments**
   - Added `DashboardSupplierFollowups` component for distributor overdue list
   - Quick action "Pay Supplier" launches searchable picker → supplier summary → `RecordPaymentMadeModal`
   - Summary shows outstanding balance, last delivery/payment, recent timeline, and quick-pay ratio shortcuts
   - Supplier payment reminders/ratios persisted via AsyncStorage

4. **Customer flows & feedback**
   - Pending follow-ups section retains WhatsApp remind CTA with toast confirmations
   - Customer payment modal & New Bill screen trigger toasts on success/failure

5. **Feedback consistency**
   - All reminder/payment actions (dashboard, supplier detail, new bill) now display success toasts via `useToast`

## Documentation Updates
- `docs/ux-context.md`: added Pay Supplier flow details + rule for reminder/payment toasts

## Next Targets
- Extend toast confirmations to other ledger actions (order creation, deliveries)
- Consider caching supplier summaries deeper or enabling pagination in picker
