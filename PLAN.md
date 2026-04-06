## Objective
- Align dashboard UI modes with Figma references (Seller, Distributor, Both)
- Ensure quick actions and follow-up sections are mode aware
- Enhance distributor "Pay Supplier" flow with supplier picker, summary, and payments
- Add confirmations/toasts for reminders/payments

## Tasks
1. Audit existing dashboard implementation vs Figma
2. Fetch extra metrics in hooks (active buyers/suppliers, overdue suppliers)
3. Add seller/distributor hero/quick actions with reusable components
4. Implement distributor supplier follow-up list and quick action sheet
5. Hook supplier payment flow (picker, summary, payment modal)
6. Add handy shimmer for Net Position hero while fetching range data
7. Persist range preference via store and use across screens
8. Add Toast feedback for reminders/payments (dashboard + orders)
9. Update docs (ux-context) with new flows/rules; maintain Audit README
10. Extend toast confirmations to supplier deliveries & product CRUD flows so every ledger action has consistent feedback

## Upcoming Design Audit
- Iterate through `/designs` PNGs sequentially:
  1. Welcome Screen
  2. Log In Screen
  3. Refined Sign Up Screen
  4. Refined Role Selection Screen
  5. Onboarding Completion
  6. Business Setup Steps
  7. Contact Picker Modals
  8. Customer list/detail screens
  9. Product list/detail + modals
  10. Supplier list/detail + modals
  11. Remaining dashboards & tab menus
- For each: audit code vs PNG, fix UI/logic gaps, document changes in Audit README & architecture docs.
