# KredBook — Core + Edge Test Flow (App)

> **Last Updated**: April 11, 2026
> **Purpose**: High‑impact manual checks that validate business value without exhaustive regression.
> **Scope**: App (native), **wireless debugging ok**.
> **Tester Account**: `tester@kredbook.io` (use a dedicated test dataset)
> **Automated Tests**: See `e2e/auth.e2e.js` for signup/login automation

---

## Recommended Devices

Use **2 physical devices** minimum:

1. **Android (mid‑range)** — primary (real‑world constraints)
2. **iOS (any)** — secondary (UI parity + iOS‑specific behavior)

If only one device is available, prioritize Android for offline/queue stress.

---

## Test Data Setup (One‑time)

- Create account: **tester@kredbook.io**
- Set business name and bill prefix
- Create at least **1 customer** named “Test Customer” with phone “9876543210”
- Create at least **1 product** named “Test Item” with price “100”

---

## Happy Path (Core Business Value)

**Goal:** Validate that a shopkeeper can sign up, see dashboard, and add an entry.

1. **Signup + Onboarding**
   - Open app → Signup as `tester@kredbook.io`
   - Complete onboarding → land on Dashboard
   - ✅ Expected: No errors, dashboard loads

2. **Dashboard Load**
   - Verify totals/stats load (no blank values)
   - ✅ Expected: cards render with numbers (even if zero)

3. **Add Entry (Quick Amount)**
   - Go to Add Entry tab
   - Select “Test Customer”
   - Enter amount “500”
   - Tap **Save & Share**
   - ✅ Expected: entry saved, success toast, PDF share prompt

---

## Critical Edge Cases (High Risk)

**Goal:** Validate offline safety + auth/session stability.

4. **Offline Creation + Sync Queue**
   - Turn on Airplane Mode
   - Create a new quick entry (any amount)
   - ✅ Expected: “Saved locally” toast + offline banner
   - Turn network back on
   - ✅ Expected: sync banner shows syncing → synced

5. **Token Expiration / Session Recovery**
   - Background app for 5+ minutes
   - Return to app and perform any action
   - ✅ Expected: user stays logged in OR clean re‑auth prompt

6. **Invalid Phone Format Guard**
   - Go to phone input (profile / setup screen)
   - Try invalid numbers: `123`, `abcd`, `+91-`
   - ✅ Expected: validation error, no crash

---

## Optional Checks (if time allows)

7. **Entries List**
   - Open Entries tab
   - ✅ Expected: newly created entry appears

8. **Customer Detail**
   - Open “Test Customer” → view ledger
   - ✅ Expected: running balance updated

---

## Pass/Fail Rules

- **Pass** if all Happy Path + Critical Edge Cases succeed.
- **Fail** if any of the following break:
  - Cannot add entry
  - Offline queue does not save
  - Sync never completes after reconnect
  - App crashes or blocks navigation

---

## Notes for Antigravity Agent

- Use **wireless debugging** if needed
- Focus on flow completion, not pixel perfection
- Record any error toasts or console logs
