# CreditBook Web Testing Plan

## Quick Start

Run the web app in development mode and manually test the flows below.

```bash
npm run web
# Open http://localhost:19006 in your browser
```

## Test Flows

### 1. Authentication Flow
- [ ] **Signup**: Register with email, password, phone number
- [ ] **Email Verification**: Check email and verify (if required)
- [ ] **Phone Setup**: Enter phone number and link bank account
- [ ] **Onboarding**: Complete business and bank information
- [ ] **Login**: Login with existing credentials
- [ ] **Logout**: Sign out from profile page

### 2. Core Features
- [ ] **Dashboard**: View summary stats, total ledger balance
- [ ] **Entries**: Create new ledger entry (money received)
- [ ] **Customers**: Add/edit/search customer by phone
- [ ] **Orders**: Create order against customer
- [ ] **Payments**: Mark payment received from customer
- [ ] **View Ledger**: See ledger history for a customer

### 3. Edge Cases
- [ ] **Duplicate Phone**: Cannot add same customer twice
- [ ] **Empty Fields**: Validation on required fields
- [ ] **Long Text**: Handle long names/descriptions
- [ ] **Search**: Search customers by phone number
- [ ] **Negative Amount**: Cannot create negative entry amounts

### 4. Navigation
- [ ] **Tab Navigation**: Switch between dashboard, entries, customers, profile
- [ ] **Back Navigation**: Back button works on all screens
- [ ] **Deep Linking**: Direct URL navigation works

## Manual Testing Process

1. **Clear browser cache** before each test
2. **Use test credentials**:
   - Email: `tester@kredbook.io`
   - Password: `TestPass123!`
3. **Test on both desktop and mobile browser** (check responsive design)
4. **Test with slow network** (use Chrome DevTools throttling)

## Known Test Users

- **Seller Account**: Phone `8268017431`
- **Test Customer 1**: Phone `7021344154` (Rajesh)
- **Test Customer 2**: Phone `9876543210` (Priya)

## Smoke Test (5 minutes)

1. Open app → Signup with new email
2. Enter phone → Verify → Complete onboarding
3. Add customer → Create entry → View dashboard
4. Logout → Login again
5. ✅ App should work smoothly

## Full Test (30 minutes)

Follow all test flows listed above and note any issues.

## Debugging

If something breaks:
1. Check browser console (F12 → Console tab)
2. Check network requests (F12 → Network tab)
3. Look for any red error messages
4. Try hard refresh (Ctrl+Shift+R)
5. Clear all browser data and try again

## Success Criteria

✅ **Test Passed** if:
- All flows complete without errors
- Data persists across page refreshes
- Navigation works smoothly
- No console errors or warnings
- Responsive on mobile browsers

❌ **Test Failed** if:
- Any unexpected errors occur
- Data doesn't save
- Navigation breaks
- Console shows red errors
- Crashes or hangs
