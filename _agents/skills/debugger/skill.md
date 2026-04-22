# Debugger Skill

> Systematic debugging, issue diagnosis, and problem fixing for KredBook.

## When to Use

- Fixing bugs
- Investigating errors
- Understanding crashes
- Performance issues
- Unexpected behavior

## Debugging Workflow

### 1. Gather Evidence

**MUST DO FIRST:**
- Read error message completely
- Check where error occurs (stack trace)
- Note reproduce steps
- Note expected vs actual behavior

### 2. Locate Problem

**Tools:**
- ✅ LSP diagnostics (type errors)
- ✅ Console logs
- ✅ React DevTools
- ✅ Network tab (API errors)
- ✅ Supabase logs

### 3. Form Hypothesis

Based on:
- Error type
- Code at location
- Related code paths
- Recent changes

### 4. Test Fix

- Fix root cause (not symptoms)
- Verify fix works
- Check for side effects
- Ensure no new issues

## Error Types

### Type Errors

```
Module not found / Cannot find module
```

**Fix:** Check imports, paths, file exists

```
Type 'X' is not assignable to type 'Y'
```

**Fix:** Check types match, use proper type casting (never as any)

```
Property 'X' does not exist on type 'Y'
```

**Fix:** Property exists? Check type definition, add optional chaining

### Runtime Errors

```
null is not an object (evaluating 'x.y')
```

**Fix:** Add null check, ensure initialization

```
ReferenceError: x is not defined
```

**Fix:** Import x, check spelling

```
Error: fetch failed
```

**Fix:** Check network, API endpoint, error response

### React Errors

```
Invalid hook call
```

**Fix:** Hook only in function component, not in class/hook

```
Too many re-renders
```

**Fix:** Remove circular dependency, use useMemo/useCallback

```
Component ... suspended
```

**Fix:** Add ErrorBoundary, check promise

### State Issues

```
State not updating
```

**Fix:** Use proper setter, check immutability

```
Stale data
```

**Fix:** Check dependency arrays, use proper selectors

```
Race conditions
```

**Fix:** Use proper async handling

## Common Fix Patterns

### Null Safety

```tsx
// Before
const name = user.name;

// After
const name = user?.name ?? '';
```

### Async Safety

```tsx
// Before
const data = await fetchData();
setValue(data);

// After
try {
  const data = await fetchData();
  if (mounted) setValue(data);
} catch (e) {
  if (mounted) setError(e.message);
}
```

### Dependency Array

```tsx
// Before
useEffect(() => {
  fetchData(value);
}, []);

// After
useEffect(() => {
  fetchData(value);
}, [value]);
```

### State Immutability

```tsx
// Before (WRONG)
items.push(newItem);
setItems(items);

// After
setItems([...items, newItem]);
```

## Platform-Specific

### React Native

- Check if error is iOS/Android specific
- Check native modules
- Check permissions
- Check async storage
- Check native driver issues

### Expo

- Check Expo config
- Check native directories
- Check EAS builds
- Check update channels

## KredBook Specific

- Supabase MCP for database errors
- Zustand stores for state issues
- MMKV for offline storage
- React Query for caching issues

## Output Format

```
## Debug: [Issue]

### Evidence
- Error: [Exact error]
- Location: [File:line]
- Steps: [How to reproduce]

### Hypothesis
[Root cause analysis]

### Fix
[Code change]

### Verify
[How to test]
```

---

*Loaded when: "fix", "bug", "debug", "error", "issue", "crash", "broken"*