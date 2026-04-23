---
name: code-reviewer
description: Bug detection, code quality, and best practice enforcement for KredBook.
---

# Code Reviewer Skill

> Bug detection, code quality, and best practice enforcement for KredBook.

## When to Use

- After implementation completes
- Before declaring task complete
- When fixing bugs
- At code review phase in workflow

## Focus Areas

### 1. Type Safety

**MUST CHECK:**
- ✅ No `as any` type casts
- ✅ No `@ts-ignore` or `@ts-expect-error`
- ✅ All props are typed
- ✅ Return types specified
- ✅ Schema types from schemas.ts used

### 2. Component Quality

**MUST CHECK:**
- ✅ Functional components only (no class)
- ✅ Proper memoization where needed (useMemo, useCallback)
- ✅ No inline function definitions in render
- ✅ Props destructured at top level
- ✅ Loading and error states handled

### 3. State Management

**MUST CHECK:**
- ✅ Zustand stores have proper types
- ✅ Selector is typed
- ✅ No derived state in components (compute in store)
- ✅ Async actions handle loading/error states

### 4. Performance

**MUST CHECK:**
- ✅ FlatList uses keyExtractor (not index)
- ✅ Proper getItemLayout for lists
- ✅ Images use proper sizing
- ✅ No unnecessary re-renders

### 5. Security

**MUST CHECK:**
- ✅ No sensitive data in logs
- ✅ No hardcoded secrets
- ✅ Proper error messages (no leak internals)
- ✅ Auth checks before protected actions

### 6. Accessibility

**MUST CHECK:**
- ✅ All touchables have min 44pt hit area
- ✅ Text has proper contrast
- ✅ Labels on inputs (not just placeholder)
- ✅ Keyboard dismissible

### 7. UX Patterns

**MUST CHECK:**
- ✅ Optimistic UI (immediate feedback)
- ✅ Toast for success/error
- ✅ Loading states for async
- ✅ Empty states for lists
- ✅ Pull to refresh

## Review Checklist

```
## Code Review: [File]

### Issues Found

| Severity | Issue | Location | Fix |
|----------|-------|----------|-----|
| [High]   | [Issue] | [Line] | [Suggested fix] |

### Suggestions

- [Improvement suggestion]

### Looks Good

- [✓] Good pattern observed
```

## Severity Definitions

| Level | Meaning | Blocks Merge |
|-------|---------|---------------|
| Critical | Runtime crash | Yes |
| High | Bug, data loss | Yes |
| Medium | Performance, UX | Optional |
| Low | Style, best practice | No |

## KredBook Specific Checks

- ✅ Uses colors from theme.ts (not hardcoded)
- ✅ Uses spacing tokens
- ✅ Uses lucide-react-native icons
- ✅ Status uses color tokens (success/danger/warning)
- ✅ Amounts are bold + color coded

---

*Loaded when: "review", "code review", "check quality", "bug", "issue*
