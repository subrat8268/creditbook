# KredBook — Login Screen UX Specification

> **Last Updated**: April 20, 2026
> **Version**: v3.0

---

## Screen Purpose

The **Login** screen is the entry point for returning users. It's the first screen users see when opening the app.

**Primary Goals**:
1. **Sign in** — Email + password authentication
2. **Social login** — Google OAuth
3. **Password recovery** — Forgot password flow

**User Behavior**:
- Open app → Login screen (if not authenticated)
- Enter credentials → Sign In
- Tap Google → Google sign-in flow
- Tap "Forgot password?" → Reset password screen
- Tap "Sign Up" → Navigate to signup

---

## Layout Structure

```
┌─────────────────────────────────────────────┐
│ SCREEN (full)                             │
│ ──────────────────────────────────────────│
│ [←]                          (back btn)  │
│                                             │
│           Welcome Back                        │
│         Sign in to your kredBook            │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ AUTH CARD                           │ │
│ │                                     │ │
│ │ Email Address                      │ │
│ │ [________________________]        │ │
│ │                                     │ │
│ │ Password                        │ │
│ │ [________________________] [👁]  │ │
│ │                                     │ │
│ │ [Forgot password?]             [>]   │ │
│ │                                     │ │
│ │ [Sign In button]                   │ │
│ │                                     │ │
│ │ ──────── or ───────                │ │
│ │                                     │ │
│ │ [Google Sign In button]            │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Error banner when login fails]            │
│                                             │
│ New to KredBook? Sign Up                  │
└─────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Back Button

| Element | Spec |
|---------|------|
| Container | w-10 h-10, rounded-full, border border-border |
| Icon | ArrowLeft, 20dp, textPrimary |
| Hit slop | 8dp all sides |
| Position | Top-left, px-6 |
| Action | Navigate back |

### 2. AuthHeader (Reusable)

| Element | Spec |
|---------|------|
| Title | "Welcome Back", 28px extrabold, textPrimary |
| Subtitle | "Sign in to your kredBook", 15px, textSecondary |
| Margin top | mb-6 |

### 3. AuthCard (Reusable)

| Element | Spec |
|---------|------|
| Container | bg-surface, rounded-2xl, p-6, shadow |
| Shadow | elevation 2, opacity 0.04 |

### 4. Form Fields

**Email Field**:
| Element | Spec |
|---------|------|
| Label | "Email Address", 13px semibold, textPrimary, mb-2 |
| Input | Full width, variant "white" |
| Keyboard | email-address |
| Placeholder | "Enter your email address" |

**Password Field**:
| Element | Spec |
|---------|------|
| Label | "Password", 13px semibold, textPrimary, mt-4, mb-2 |
| Input | Full width, variant "white" |
| Secure entry | Toggle based on showPassword state |
| Placeholder | "Enter your password" |
| Right icon | Eye/EyeOff toggle button |

### 5. Forgot Password Link

| Element | Spec |
|--------|------|
| Container | self-end, mt-2.5, mb-5 |
| Text | "Forgot password?", 14px medium, primary |
| Action | Navigate to /auth/resetPassword |

### 6. Sign In Button

| Element | Spec |
|---------|------|
| Container | Full width, primary, mt-auto |
| Title | "Sign In", primary button style |
| Loading | Shows loading state |

### 7. AuthDivider

| Element | Spec |
|---------|------|
| Text | "or", centered |
| Lines | Horizontal dividers on sides |

### 8. Google Button

| Element | Spec |
|---------|------|
| Container | Full width, white, border border-border |
| Icon | Google icon (built into component) |
| Text | "Continue with Google" |
| Loading | Shows loading state |

### 9. Error Banner

| Element | Spec |
|---------|------|
| Container | flex-row, items-center, self-center, gap-2, rounded-full, px-4, py-3, mt-4 |
| Background | dangerBg (#FEF2F2) |
| Border | 1dp danger + "44" |
| Icon | AlertCircle, 16dp, dangerStrong |
| Text | Error message, 14px, dangerStrong |
| Visibility | When (loginMutation.isError OR googleSignIn.isError) |

### 10. Sign Up Link

| Element | Spec |
|---------|------|
| Container | mt-8, text-center |
| Text | "New to KredBook? ", 14px, textSecondary |
| Link | "Sign Up", semibold, primary |
| Action | Navigate to /auth/signup |

---

## Visual Design

### Color System (from design-system.md)

| Element | Color | Token |
|---------|-------|-------|
| Title | #1C1C1E | textPrimary |
| Secondary | #6B7280 | textSecondary |
| Primary | #22C55E | primary |
| Danger | #EF4444 | danger |
| Surface | #FFFFFF | surface |
| Background | #F6F7F9 | background |
| Border | #E2E8F0 | border |

### Typography (from theme.ts)

| Element | Weight | Size |
|---------|--------|------|
| Header title | ExtraBold | 28px |
| Input label | SemiBold | 13px |
| Input text | Regular | 15px |
| Forgot link | Medium | 14px |
| Button | Bold | 16px |
| Error text | Regular | 14px |

### Spacing (from design-system.md)

| Token | Value |
|-------|-------|
| xs | 4dp |
| sm | 8dp |
| md | 16dp |
| lg | 24dp |

---

## Interactions

### Form Validation

Uses Formik with **LoginSchema**:
- Email: required, valid email format
- Password: required, min 6 chars

### Submit Flow

1. Validate form fields
2. Call `loginMutation.mutate(values)`
3. On success → Redirect to dashboard
4. On error → Show error banner

### Social Login

1. Tap Google button
2. Call `googleSignIn.mutate()`
3. On success → Redirect to dashboard
4. On error → Show error banner

### Navigation

| From | To | Trigger |
|------|-----|----------|
| Back | Previous | Tap back arrow |
| Forgot password | Reset password | Tap link |
| Sign Up link | Signup | Tap link |

---

## States

### Loading States

| State | Display |
|-------|----------|
| Signing in | Sign In button loading |
| Google signing | Google button loading |

### Error States

| State | Display |
|-------|----------|
| Login failed | Error banner with message |
| Google failed | Error banner with message |
| No message | Default "Invalid email or password" |

### Validation Errors

| Field | Error |
|-------|-------|
| Email empty | "Email is required" |
| Email invalid | "Invalid email address" |
| Password empty | "Password is required" |
| Password short | "Password must be at least 6 characters" |

---

## Edge Cases

### Keyboard Handling
- KeyboardAvoidingView with Platform.OS behavior
- keyboardVerticalOffset: 60 (iOS)
- keyboardShouldPersistTaps="handled"

### Long Email/Password
- TextInput truncates with ellipsis
- Secure entry toggles visibility

### Both Login Methods Error
- Show whichever error is available
- Priority: loginMutation > googleSignIn

### No Network
- Supabase handles offline
- Shows appropriate error

---

## Accessibility

| Element | Accessibility |
|--------|---------------|
| Email input | VoiceOver "Email address field" |
| Password input | VoiceOver "Password field" |
| Show/hide toggle | accessibilityLabel="Toggle password visibility" |
| Buttons | Native accessibility |

---

## Performance

| Metric | Target |
|--------|--------|
| Screen render | < 200ms |
| Login submission | < 1s perceived |
| Google sign-in | Native (not measured) |

---

## Implementation Checklist

- [x] Back button with navigation
- [x] AuthHeader component
- [x] AuthCard component
- [x] Email field with validation
- [x] Password field with show/hide toggle
- [x] Forgot password link
- [x] Sign In button with loading
- [x] AuthDivider
- [x] Google sign-in button
- [x] Error banner display
- [x] Sign up link
- [x] Keyboard handling
- [x] Formik integration

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `docs/design-system.md` | Color tokens |
| `docs/flows.md` | Navigation reference |
| `app/(auth)/signup.tsx` | Sign up flow |
| `app/(auth)/resetPassword.tsx` | Password reset |
| `src/hooks/useAuth.ts` | Auth hooks |
| `src/utils/schemas.ts` | Validation schemas |

---

## Future Considerations

Features NOT in v3.0 scope:

1. **Remember me** — Stay logged in
2. **Biometric** — Face ID / Fingerprint
3. **OTP login** — Phone-based login
4. **Magic link** — Passwordless email

---

_Last updated: April 20, 2026_