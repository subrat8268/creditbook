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
10. Next: extend toast confirmations to supplier deliveries & product CRUD flows so every ledger action has consistent feedback
