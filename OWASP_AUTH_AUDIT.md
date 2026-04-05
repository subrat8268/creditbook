# OWASP Top 10:2025 Security Audit Report
**Target Files:** `src/api/auth.ts`, `src/hooks/useAuth.ts`
**Date:** April 5, 2026

## 🔴 HIGH RISK

### 1. Insecure Design & Broken Access Control (A01:2025 / A04:2025)
**Location:** `src/api/auth.ts` ➔ `signUpApi`
**Issue:** The `signUpApi` implements a client-side fallback to insert a profile via `.upsert({ user_id: data.user.id, name: values.fullName })`.
**Impact:** Profile creation should be strictly an atomic backend operation triggered by a Postgres function (`SECURITY DEFINER`). 
Allowing the client to directly `INSERT/UPDATE` into the `profiles` table forces you to open up RLS `INSERT` policies on the frontend. If RLS is misconfigured, an attacker could intercept this query and create or modify profiles for arbitrary `user_id`s. 
Furthermore, if Supabase **Email Confirmation** is enabled, the newly signed-up user *does not receive an active session* immediately. Therefore, the client-side `upsert` will execute anonymously, completely bypassing any `auth.uid() = user_id` RLS checks.
**Remediation:** 
Remove the client-side `.upsert` fallback entirely. Enforce the DB trigger (`handle_new_user`) as the singular source of truth for profile creation, and handle any NOT NULL constraints on the database level.


## 🟠 MEDIUM RISK

### 2. Authentication Bypass / Token Leakage via Implicit Flow (A07:2025)
**Location:** `src/api/auth.ts` ➔ `signInWithGoogleApi`
**Issue:** The function falls back to parsing raw OAuth access tokens directly from the URL fragment (Implicit Flow) if the PKCE `code` is not present in the query parameters.
```typescript
  // Implicit flow fallback
  const fragment = result.url.split("#")[1] ?? "";
  const hp = Object.fromEntries(new URLSearchParams(fragment));
```
**Impact:** The OAuth 2.0 Implicit Flow is considered heavily deprecated and insecure because access tokens are exposed directly in the URI fragment. These tokens can be easily leaked via Referer headers, browser histories, or malicious browser extensions.
**Remediation:** Supabase V2 strongly defaults to the highly secure **PKCE** flow. You should delete the implicit flow fallback. If `params.code` is missing, explicitly throw an error rather than attempting to securely parse fragments.


## 🟡 LOW RISK

### 3. Information Disclosure via Unsanitized Errors (A05:2025)
**Location:** `src/api/auth.ts` & `src/hooks/useAuth.ts`
**Issue:** While `useSignUp` utilizes a `friendlySignUpError` wrapper, `useLogin` and `useResetPassword` directly log `error.message` to the console and potentially bubble it up to the UI.
**Impact:** Raw Supabase Auth errors are generally safe, but untreated backend errors can inadvertently disclose user enumerations ("User not found", "Email already exists" - which you do parse in sign-up, but still log raw in others) or expose backend infrastructure states during outages.
**Remediation:** Apply a universal error scrubbing utility across all mutations in `useAuth.ts` before allowing them to print to logs or reach Toast messages.

### 4. Insufficient Security Logging & Monitoring (A09:2025)
**Location:** `src/hooks/useAuth.ts`
**Issue:** Authentication failures (failed logins from credential stuffing, aborted OAuth flows) are only logged to the local device console (`console.error`).
**Impact:** There is zero backend visibility into targeted brute-force attacks against specific users or mass credential-stuffing attacks if the frontend fails.
**Remediation:** Integrate a structured remote telemetry handler (e.g., Sentry, Datadog) specifically capturing `loginApi` and `signUpApi` rejections for monitoring.


## 🔵 INFORMATIONAL / BEST PRACTICE

### 5. Open Redirect Vulnerability Configuration (A05:2025)
**Location:** `src/api/auth.ts` ➔ `resetPasswordApi`
**Issue:** `redirectTo: Linking.createURL("/")` attempts to explicitly set the post-auth redirect layer constraint.
**Note:** Ensure that in the Supabase Dashboard -> Auth -> URL Configuration, you do not use wildcard `*` domains in the allowed Redirect URIs. The allowed URIs should strictly match the exact app URI scheme (e.g., `creditbook://reset`) to prevent an active session hijacking attack where an attacker passes a malicious `redirectTo` Deep Link via email intercept.
