---
name: thinker
description: Deep reasoning, complex problem solving, and architectural thinking for KredBook.
---

# Thinker Skill

> Deep reasoning, complex problem solving, and architectural thinking for KredBook.

## When to Use

- Complex architecture decisions
- Hard debugging (2+ failed attempts)
- Multi-system tradeoffs
- Design decisions
- Performance optimization
- Understanding unfamiliar code

## Reasoning Framework

### 1. Problem Decomposition

**Before solving:**
1. Identify what IS happening
2. Identify what SHOULD happen
3. Find the delta
4. Identify root cause (not symptoms)

### 2. Hypothesis Formation

Based on evidence:
- Error messages
- Code at location
- Related code paths
- Recent changes
- Environment differences

Form testable hypothesis:
```
IF [cause] THEN [effect] BECAUSE [mechanism]
```

### 3. Systematic Testing

**For each hypothesis:**
1. Test the mechanism specifically
2. Check edge cases
3. Check related systems
4. Verify with actual code (not assumptions)

### 4. Solution Design

**Requirements:**
- Fixes root cause
- Doesn't break other things
- Handles edge cases
- Is maintainable

**Options evaluation:**
| Option | Pros | Cons | Risk |
|--------|-----|------|-------|
| A | X | Y | Low |
| B | X | Y | Medium |

### 5. Verification

- Does fix actually solve problem?
- Are there side effects?
- Does it match codebase patterns?
- Is it testable?

## Hard Problem Patterns

### Type 1: Race Conditions

**Symptoms:**
- Intermittent failures
- Data appears/disappears
- Stale data display

**Analysis:**
- Check async/await patterns
- Check dependency arrays
- Check React Query cache
- Check component lifecycle

**Fix:**
```typescript
// Use cleanup
useEffect(() => {
  let mounted = true;
  fetchData().then(data => {
    if (mounted) setData(data);
  });
  return () => { mounted = false; };
}, [id]);
```

### Type 2: Memory Leaks

**Symptoms:**
- Increasing memory
- Slow performance
- Component not unmounting

**Analysis:**
- Check cleanup in useEffect
- Check event listeners
- Check subscriptions
- Check intervals/timeouts

**Fix:**
```typescript
useEffect(() => {
  const sub = subscribe();
  return () => sub unsubscribe(); // Cleanup
}, []);
```

### Type 3: State Inconsistency

**Symptoms:**
- UI doesn't match data
- Actions don't reflect
- Cache stale

**Analysis:**
- Check immutability
- Check selectors
- Check cache invalidation
- Check Zustand store

**Fix:**
```typescript
// Proper immutable update
setItems(prev => [...prev, newItem]); // ✅
// vs
prev.push(newItem); // ❌

// Proper invalidation
queryClient.invalidateQueries(['customers']);
```

### Type 4: Performance Issues

**Symptoms:**
- Slow renders
- Janky scrolling
- High CPU

**Analysis:**
- Check re-renders (useMemo)
- Check list virtualization
- Check image sizes
- Check network calls

**Fix:**
```tsx
// Memoize expensive computation
const value = useMemo(() => compute(a, b), [a, b]);

// Memoize callbacks
const onPress = useCallback(id => handlePress(id), []);

// Virtualized list
<FlatList
  initialNumToRender={10}
  maxToRenderPerBatch={10}
/>
```

### Type 5: Complex Navigation

**Symptoms:**
- Deep linking broken
- Parameters lost
- Stack issues

**Analysis:**
- Check route params
- Check navigation state
- Check nested navigators

**Fix:**
```tsx
// Pass params explicitly
router.push({
  pathname: '/customer/[id]',
  params: { id: customer.id },
});
```

## Decision Trees

### Architecture Decision

```
Question: New feature architecture
    │
    ├── Does it need global state?
    │   └─ Yes → Zustand store
    │   └─ No → Local state (useState)
    │
    ├── Does it fetch from API?
    │   ├─ Yes → React Query
    │   └─ No → Static data
    │
    └── Does it affect multiple screens?
        ├─ Yes → Global state + URL params
        └─ No → Local state
```

### State Location Decision

```
Data Type → Where to Store
─────────────────────────────────
User session → Zustand
App settings → Zustand
Cached API data → React Query
Form input → Local useState
Derived from above → Memoize
```

### Error Handling Decision

```
Error Type → Handling
─────────────────────────────────
Network error → Toast + retry
Auth error → Redirect login
Validation → Inline message
Server error → Toast + log
Unexpected → Catch + report
```

## Critical Thinking

### Questions to Ask

1. **What is actually happening?**
   - Not what we think
   - Not what should happen
   - Actual behavior

2. **What's the root cause?**
   - Not the symptom
   - Not the error message
   - The actual mechanism

3. **Why hasn't this been caught?**
   - No tests?
   - Edge case?
   - Environment difference?

4. **Will the fix actually work?**
   - Tested in isolation?
   - Tested full flow?
   - Handled edge cases?

5. **Are we solving the right problem?**
   - Is this the real requirement?
   - Or just what was asked?

## Anti-Patterns

- ❌ Jumping to solutions
- ❌ Assuming the problem
- ❌ Not reading the code
- ❌ Shotgun debugging
- ❌ Skipping root cause analysis
- ❌ Not verifying fix

## Output Format

```
## Analysis: [Problem]

### Evidence
- [Observed behavior]
- [Error or state]

### Hypothesis
[Root cause analysis]

### Verification
[How to test hypothesis]

### Solution
[Proposed fix with options]

### Risk Assessment
- [Risk 1] → [Mitigation]
- [Risk 2] → [Mitigation]
```

---

*Loaded when: "think", "analyze", "complex", "architecture", "debug"*
