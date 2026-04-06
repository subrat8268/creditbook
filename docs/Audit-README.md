# Dashboard UI & Logic Audit

## Scope
- Align `app/index.tsx` (Welcome screen) and `app/(auth)/*` flows with Figma
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
   - Customer payment modal, Customer Detail reminder button, New Bill screen, Order Detail sharing, and Welcome CTA now match UX rules with success/failure toasts and navigation targets

5. **Feedback consistency + Auth UX**
   - All reminder/payment actions (dashboard, supplier detail, customer/order detail) now display success toasts via `useToast`
   - Welcome + Login screens now follow Figma copy/navigation (Signup CTA + back arrow + refined subtitle)

6. **Onboarding flow**
   - Role selection uses SafeArea padding, back arrow, updated copy, and chip-styled selection rings matching design
   - Business & Bank steps now feature SafeArea scaffolding, sticky CTA blocks with shared `Button` component, and updated copy per Figma specs
   - Ready screen aligned: summary pills + primary CTA “Add Your First Customer” (deep-links to Customers screen opening New Customer modal) + secondary “Go to Dashboard” link

## Documentation Updates
- `docs/ux-context.md`: added Pay Supplier flow details + rule for reminder/payment toasts
- `docs/design-audit.md`: tracker for PNG-by-PNG alignment status (Welcome/Auth/Onboarding marked ✅)

## Next Targets
- Extend toast confirmations to other ledger actions (order creation, deliveries)
- Consider caching supplier summaries deeper or enabling pagination in picker
