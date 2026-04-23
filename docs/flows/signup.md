# KredBook — Sign Up Screen UX Specification

> **Last Updated**: April 20, 2026
> **Version**: v3.0

---

## Screen Purpose

The **Sign Up** screen is for new users to create an account. It's where new users register to start using KredBook.

**Primary Goals**:
1. **Create account** — Full name, email, password
2. **Social signup** — Google OAuth
3. **Account creation** — Navigate to onboarding after

**User Behavior**:
- Navigate to Sign Up from Login
- Enter details → Create Account
- Tap Google → Google sign-in flow
- Success → Go to onboarding/phone-setup

---

## Layout Structure

```
┌─────────────────────────────────────────────┐
│ SCREEN (full)                             │
│ ──────────────────────────────────────────│
│ [←]                          (back btn) │
│                                             │
│           Create Account                    │
│      Set up your CreditBook in 2 minutes    │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ AUTH CARD                           │ │
│ │                                     │ │
│ │ Full Name                         │ │
│ │ [________________________]        │ │
│ │                                     │ │
│ │ Email Address                    │ │
│ │ [________________________]        │ │
│ │                                     │ │
│ │ Password                        │ │
│ │ [________________________] [👁]  │ │
│ │                                     │ │
│ │ Confirm Password               │ │
│ │ [________________________] [👁]  │ │
│ │                                     │ │
│ │ [Create Account button]          │ │
│ │                                     │ │
│ │ ──────── or ───────                │ │
│ │                                     │ │
│ │ [Google Sign In button]          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Error banner when signup fails]           │
│                                             │
│  Already have an account? Log In            │
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
| Position | Top-left, flex-1 px-6 |

### 2. AuthHeader

| Element | Spec |
|---------|------|
| Title | "Create Account", 28px extrabold, textPrimary |
| Subtitle | "Set up your CreditBook in 2 minutes", 15px, textSecondary |

### 3. AuthCard

| Element | Spec |
|---------|------|
| Container | bg-surface, rounded-2xl, p-6, shadow |
| Shadow | elevation 2 |

### 4. Form Fields

**Full Name**:
| Element | Spec |
|---------|------|
| Label | "Full Name", 13px semibold, textPrimary, mb-2 |
| Input | Full width, variant "white" |
| Placeholder | "Enter your full name" |

**Email**:
| Element | Spec |
|---------|------|
| Label | "Email Address", 13px semibold, textPrimary, mt-4, mb-2 |
| Input | Full width, variant "white" |
| Placeholder | "email@example.com" |

**Password**:
| Element | Spec |
|---------|------|
| Label | "Password", 13px semibold, textPrimary, mt-4, mb-2 |
| Input | Full width, variant "white" |
| Placeholder | "Min. 6 characters" |
| Secure entry | Toggle based on showPassword |

**Confirm Password**:
| Element | Spec |
|---------|------|
| Label | "Confirm Password", 13px semibold, textPrimary, mt-4, mb-2 |
| Input | Full width, variant "white" |
| Placeholder | "Re-enter your password" |
| Secure entry | Toggle based on showConfirmPassword |

### 5. Create Account Button

| Element | Spec |
|---------|------|
| Container | Full width, primary, mt-5 |
| Title | "Create Account", primary button style |
| Loading | Shows loading state |

### 6. AuthDivider

Divider with "or" centered.

### 7. Google Button

| Element | Spec |
|---------|------|
| Container | Full width, white, border |
| Text | "Continue with Google" |

### 8. Error Banner

| Element | Spec |
|---------|------|
| Container | dangerBg with danger border, rounded-full, px-4, py-3, mt-4 |
| Icon | AlertCircle |
| Text | Error message |
| Visibility | When signUpMutation.isError OR googleSignIn.isError |

### 9. Login Link

| Element | Spec |
|---------|------|
| Container | mt-4, mb-10, text-center |
| Text | "Already have an account? ", 14px, textSecondary |
| Link | "Log In", semibold, primary |

---

## Visual Design

### Color System (from design-system.md)

| Element | Color | Token |
|---------|-------|-------|
| Title | #1C1C1E | textPrimary |
| Secondary | #6B7280 | textSecondary |
| Primary | #2563EB | primary |
| Danger | #EF4444 | danger |
| Surface | #FFFFFF | surface |
| Background | #F6F7F9 | background |
| Border | #E2E8F0 | border |

### Typography

| Element | Weight | Size |
|---------|--------|------|
| Header title | ExtraBold | 28px |
| Input label | SemiBold | 13px |
| Input | Regular | 15px |

---

## Interactions

### Form Validation (using SignUpSchema)

| Field | Validation |
|-------|------------|
| fullName | required, min 2 chars |
| email | required, valid email |
| password | required, min 6 chars |
| confirmPassword | required, must match password |

### Submit Flow

1. Validate all fields
2. Call `signUpMutation.mutate({fullName, email, password})`
3. On success → Redirect to onboarding flow
4. On error → Show error banner

### Social Login

1. Tap Google button
2. Call `googleSignIn.mutate()`
3. On success → Redirect to onboarding flow
4. On error → Show error banner

### Navigation

| From | To | Trigger |
|------|-----|----------|
| Back | Previous | Tap back |
| Already have account | Login | Tap link |

---

## States

### Loading States

| State | Display |
|-------|----------|
| Creating account | "Create Account" loading |
| Google signing | Google button loading |

### Error States

| Scenario | Message |
|----------|---------|
| Email exists | From API |
| Password weak | From schema |
| Network error | "Something went wrong. Please try again." |

---

## Accessibility

| Element | Accessibility |
|--------|---------------|
| All inputs | Native VoiceOver |
| Toggle buttons | accessibilityLabel |
| Buttons | Native accessibility |

---

## Performance

| Metric | Target |
|--------|--------|
| Screen render | < 200ms |
| Sign up | < 1s perceived |

---

## Implementation Checklist

- [x] Back button
- [x] AuthHeader
- [x] AuthCard
- [x] Full Name field
- [x] Email field
- [x] Password field with toggle
- [x] Confirm Password field with toggle
- [x] Create Account button
- [x] AuthDivider
- [x] Google button
- [x] Error banner
- [x] Login link

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `app/(auth)/login.tsx` | Login flow |
| `app/(auth)/phone-setup.tsx` | Next screen |
| `src/utils/schemas.ts` | Validation |

---

_Last updated: April 20, 2026_
