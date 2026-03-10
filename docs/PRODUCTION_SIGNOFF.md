# CreditBook — Production Sign-Off Checklist

> **Last Updated**: March 10, 2026
> **Version**: 3.5
> **Purpose**: Every checkbox must pass before submitting to TestFlight or Play Store Internal Testing.
> **Verify on device** (Android mid-range — Pixel 4a target).

---

## Status Key

| Badge | Meaning                          |
| :---: | :------------------------------- |
|  ✅   | Fixed in code — verify on device |
|  ⏳   | Pending device verification      |
|  🔴   | Not yet fixed                    |

---

## Checklist

| #   | ID  | Requirement                                                                                                               | Code Status                                                                                       | Category |
| --- | --- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------- |
| ☐   | P01 | Supplier list shows data. Adding supplier saves. "I Owe Suppliers" > ₹0 when applicable.                                  | ✅ C-01 — RLS policies fixed                                                                      | DB       |
| ☐   | P02 | Role → "Retailer" writes `"seller"` to profiles. Dashboard hero renders correctly for all 3 modes.                        | ✅ C-05 — `dashboard_mode` constraint + type aligned                                              | DB       |
| ☐   | P03 | Products show variant names and prices. Variant picker works in New Bill.                                                 | ✅ C-04 — `fetchProducts` now joins `product_variants`                                            | DB       |
| ☐   | P04 | Search "Ramesh" on Orders screen → results appear. Export Payments → CSV downloads without error.                         | ✅ C-02 + C-03 — `!inner` join + `reference` column removed                                       | DB       |
| ☐   | P05 | 3 new indexes visible in Supabase → Database → Indexes tab.                                                               | ✅ M-15 — indexes added to `schema.sql` + Supabase                                                | DB       |
| ☐   | P06 | Order status chips: PAID (green), PARTIAL (blue), PENDING (amber), OVERDUE (red).                                         | ✅ C-06 — `STATUS_STYLES` map + `daysSince()` > 30 = Overdue                                      | Logic    |
| ☐   | P07 | Outline button loading spinner is GREEN (`#22C55E`), not black.                                                           | ✅ C-07 — spinner color fixed in `Button.tsx`                                                     | Logic    |
| ☐   | P08 | Record Delivery modal slides up from bottom (not full-screen). Keyboard pushes content up on Android.                     | ✅ C-08 — migrated to `@gorhom/bottom-sheet`                                                      | Logic    |
| ☐   | P09 | Entering exact balance in Pay Supplier — no "exceeds" warning, payment records successfully.                              | ✅ C-09 — over-pay validation fixed; button disabled when `!isValid`                              | Logic    |
| ☐   | P10 | Dead files deleted: `PdfPreviewModal`, `QuickAction`, `dashboardStore`. `npx tsc` → 0 errors.                             | ✅ M-10 + M-09 — dead files removed                                                               | Arch     |
| ☐   | P11 | Payment modal buttons use `Button.tsx` component. Both have green spinner when loading.                                   | ✅ M-02 — both payment modals use `Button.tsx`                                                    | Arch     |
| ☐   | P12 | Orders FilterBar: active filter chip has green fill. No `gray-*` Tailwind classes.                                        | ✅ M-03 — active chip style added; all `gray-*` → theme tokens                                    | Arch     |
| ☐   | P13 | `app/(main)/reports/_layout.tsx` created. Financial Position screen renders without double header.                        | ✅ M-09 — `reports/_layout.tsx` created                                                           | Arch     |
| ☐   | P14 | CustomerCard: PAID chip is `#DCFCE7` bg with `#166534` dark green text (readable). OVERDUE/PENDING chips from `theme.ts`. | ✅ N-11 — all raw hex → theme tokens                                                              | Token    |
| ☐   | P15 | SupplierCard shows initials avatar (not amber building icon). No amber colors anywhere.                                   | ✅ N-13 — initials avatar with `AVATAR_COLORS` hash                                               | Token    |
| ☐   | P16 | EmptyState icon bg is `#F6F7F9` (not `#F3F4F6`). Toast error is `#E74C3C` (not `#EF4444`).                                | ✅ N-07 + N-08 — EmptyState NativeWind migration + Toast color fix                                | Token    |
| ☐   | P17 | StatusDot warning = orange (`#F59E0B`), danger = `#E74C3C`. AppModal slides up, not fade-in.                              | ✅ N-04 + N-09 + M-11 — `DOT_COLOR` record; `animationIn="slideInUp"`                             | Token    |
| ☐   | P18 | Dashboard greeting changes by time of day. Bell shows red dot when overdue > 0.                                           | ✅ P-18 — `getGreeting()` + overdue dot in `DashboardHeader`                                      | Screen   |
| ☐   | P19 | "Send Reminder" (exact label, not "Reminder"). Payment mode "online" → shows "UPI". ₹0 balance → green hero.              | ✅ P-19 — `MODE_LABEL` record; dynamic hero gradient                                              | Screen   |
| ☐   | P20 | Grand Total is dark text (`#1C1C1E`). GST on items only (not on loading charge). No customer subtitle.                    | ✅ P-20 — `fontSize: 28`; Previous Balance → `#E74C3C`                                            | Screen   |
| ☐   | P21 | Profile avatar: FILLED green circle. Mode toggle: Seller \| Distributor \| Both order. Export screen has back button.     | ✅ P-21 — filled initials avatar; mode values fixed; `ArrowLeft` back button                      | Screen   |
| ☐   | P22 | Record payment → navigate to dashboard → totals update without pull-to-refresh.                                           | ✅ P-22 — 5 missing `invalidateQueries` added across 4 mutation files                             | Cross    |
| ☐   | P23 | 100 customers scroll without jank on mid-range Android. Last row visible above FAB.                                       | ✅ P-23 — `useCallback renderItem`, `getItemLayout`, all perf props on 4 FlatLists                | Cross    |
| ☐   | P24 | Login on Android: keyboard visible → input fields not covered by keyboard.                                                | ✅ P-24 — `KeyboardAvoidingView` added to `CreateOrderScreen`; login + business already compliant | Cross    |
| ☐   | P25 | `grep "@expo/vector-icons"` → 0 results. All icons from `lucide-react-native`.                                            | ✅ P-25 — grep confirms 0 results                                                                 | Cross    |
| ☐   | P26 | `grep "+92"` → 0 results. `grep "Zain Khan"` → 0 results. Sentry receives test event.                                     | ✅ P-26 — grep confirms 0; `sentry.ts` + `Sentry.wrap(RootLayout)` in place                       | Cross    |
| ☐   | P27 | `FloatingActionButton` and `SearchBar` in `src/components/ui/`. No root-level import paths for either.                    | ✅ P-27 — both moved to `ui/`; 7 import paths updated; `BottomSheetForm` kept (1 active importer) | Cross    |

---

## Final Verification Commands

Run these on device/emulator before submitting:

```bash
# 1. TypeScript — must be 0 errors
npx tsc --noEmit

# 2. Check for dead icon library
grep -rn "@expo/vector-icons" --include="*.tsx" --include="*.ts" src/ app/
# Expected: no output (exit code 1)

# 3. Check for Pakistani data
grep -rn "+92\|Zain Khan\|Fatima Ahmed\|PKR" --include="*.tsx" --include="*.ts" src/ app/
# Expected: no output (exit code 1)

# 4. Confirm AsyncStorage removed from Supabase client (secure storage only)
grep -n "AsyncStorage" src/services/supabase.ts
# Expected: no output — secureStorage adapter must be the only storage option

# 5. Lint clean
npx eslint src/ app/ --ext .ts,.tsx
```

---

## Device Test Flow (30-minute smoke test)

1. **Cold start** — App opens to correct screen (login if not authenticated; dashboard if authenticated)
2. **Add customer** → Create bill → Record payment → Dashboard totals update immediately (P22)
3. **Add supplier** → Record delivery → Pay supplier → "I Owe Suppliers" updates (P01)
4. **Keyboard test** — Login screen on Android, tap password field → keyboard appears → both fields visible (P24)
5. **Scroll test** — Add 10+ customers → scroll fast → no frame drops, FAB not blocking last row (P23)
6. **Order chips** — Create pending order > 30 days ago → appears as OVERDUE (red chip) (P06)
7. **PDF bill** — New Bill → select customer + product → Send Bill → WhatsApp opens with link (P03)
8. **Export** — Profile → Export → "Payments" → CSV file shares successfully (P04)
9. **Dashboard greeting** — Check greeting matches time of day; overdue badge on bell (P18)
10. **Sign out + sign in** — Sign out → Sign in → Correct dashboard mode renders (P02)
11. **Password reset (unauth)** — Forgot password → email link → `set-new-password` screen opens → update works → redirected to login (P28)
12. **Password reset (auth)** — While logged in, open recovery link → `set-new-password` screen shows (NOT dashboard) → update works (P29, P30)
13. **Slow network — loader hint** — Throttle to 3G → wait 3 seconds → "Loading your profile…" text appears under spinner (P36)
14. **Profile error retry** — Simulate DB failure → profile-error screen shows → Retry button attempts re-fetch → success routes to dashboard (P32)
15. **Onboarding back navigation** — Role selection → Continue → Business screen → tap Back → returns to Role screen (P38)

---

## Auth Hardening Checklist (v3.4–3.5)

| #   | ID  | Requirement                                                                                                             | Code Status                                                                                         | Category |
| --- | --- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------- |
| ☐   | P28 | Password reset link from email opens `set-new-password` screen (not browser page). Tested on real device.               | ✅ C4 — `set-new-password.tsx` + `PASSWORD_RECOVERY` handler + `redirectTo: Linking.createURL("/")` | Auth     |
| ☐   | P29 | Password reset works for users who have a valid existing session (auto-refresh). Screen not evicted by dashboard guard. | ✅ FAIL-01 — `isRecoveryMode` top-priority Stack.Screen in root layout                              | Auth     |
| ☐   | P30 | After password update: user sees login screen (not dashboard). No dashboard flash before login.                         | ✅ WARN-06 — `setRecoveryMode(false)` + `supabase.auth.signOut()` before `router.replace`           | Auth     |
| ☐   | P31 | Google OAuth: DB trigger race → app creates minimal profile and routes to onboarding.                                   | ✅ C5 — `createMinimalProfile()` + retry loop (3 × 600 ms) in `useGoogleSignIn`                     | Auth     |
| ☐   | P32 | Login with missing profile row → profile-error screen shows Retry and Logout buttons.                                   | ✅ C1 + V3 — `AuthProfileErrorScreen`; `profile-error` Stack.Screen; null-profile guard             | Auth     |
| ☐   | P33 | Signup with all 3 profile-fetch retries failing → profile-error screen (not broken onboarding).                         | ✅ WARN-01 — null profile check added to `useSignUp.onSuccess`                                      | Auth     |
| ☐   | P34 | JWT tokens in Keychain/Keystore. `grep "AsyncStorage" src/services/supabase.ts` → 0 results.                            | ✅ B1 — `src/lib/secureStorage.ts`; `supabase.ts` `storage: secureStorage`                          | Security |
| ☐   | P35 | Sentry breadcrumbs fired at: login, signup, google_oauth, onboarding_complete, logout.                                  | ✅ B6 — `Sentry.addBreadcrumb` in `useAuth.ts` + `ready.tsx`                                        | Monitor  |
| ☐   | P36 | `Loader` shows "Loading your profile…" after 2 s on slow network.                                                       | ✅ WARN-05 — 2-second `setTimeout` `useEffect` in `Loader.tsx`                                      | UX       |
| ☐   | P37 | Signup confirm-password has eye-toggle matching all other password fields.                                              | ✅ WARN-04 — `showConfirmPassword` state + icon in `signup.tsx`                                     | UX       |
| ☐   | P38 | Back from Business step during onboarding returns to Role screen.                                                       | ✅ WARN-09 — `router.push` (not `replace`) in `role.tsx`                                            | UX       |

---

## Open / Deferred Items

These items are non-blocking and deferred to v3.6:

| ID        | Issue                                                                                          | Reason deferred                                   |
| --------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| M-01      | Modal library consolidation (`NewProductModal` still uses `react-native-modal` via `AppModal`) | Non-breaking; full migration is a larger refactor |
| M-04      | Export screen not in tab bar                                                                   | UX decision pending                               |
| M-05–M-08 | Architecture cleanup items                                                                     | Non-breaking; queued for v3.6                     |
| M-12–M-14 | Additional architecture items                                                                  | Non-breaking                                      |
| N-12      | `heroDecor` orphaned color                                                                     | Cosmetic; no user impact                          |
| N-14      | Payment mode chip border token mismatch                                                        | Cosmetic                                          |
| N-15      | `Button.tsx` corner radius inconsistency                                                       | Cosmetic                                          |

---

_Sign off on each device test by ticking the checkbox. All P01–P38 items (38 total) must be ✅ before production release._
