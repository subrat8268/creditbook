---
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code
---

# Test-Driven Development (TDD)

## Overview

Write the test first. Watch it fail. Write minimal code to pass.

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

## When to Use

**Always:**

- New features
- Bug fixes
- Refactoring
- Behavior changes

**Exceptions (ask your team):**

- Throwaway prototypes
- Generated code
- Configuration files

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over.

**No exceptions:**

- Don't keep it as "reference"
- Don't "adapt" it while writing tests
- Delete means delete

Implement fresh from tests. Period.

## Red-Green-Refactor Cycle

```
RED → GREEN → REFACTOR → RED (repeat)

RED: Write failing test showing what should happen
GREEN: Write minimal code to pass test
REFACTOR: Clean up while keeping test green
```

### RED - Write Failing Test

Write one minimal test showing what should happen.

```typescript
✅ Good:
test('retries failed operations 3 times', async () => {
  let attempts = 0;
  const operation = () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };
  const result = await retryOperation(operation);
  expect(result).toBe('success');
  expect(attempts).toBe(3);
});

❌ Bad:
test('retry works', async () => {
  const mock = jest.fn().mockRejectedValueOnce(new Error());
  await retryOperation(mock);
  expect(mock).toHaveBeenCalledTimes(3);
});
```

**Requirements:**

- One behavior
- Clear name
- Real code (no mocks unless unavoidable)

### Verify RED - Watch It Fail

**MANDATORY. Never skip.**

```bash
npm test path/to/test.test.ts
```

Confirm:

- Test fails (not errors)
- Failure message is understandable
- Fails because feature missing (not typos)

**Test passes?** You're testing existing behavior. Fix test.

### GREEN - Minimal Code

Write simplest code to pass the test.

```typescript
✅ Good:
async function retryOperation<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 0; i < 3; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === 2) throw e;
    }
  }
  throw new Error('unreachable');
}

❌ Bad (over-engineered):
async function retryOperation<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    backoff?: 'linear' | 'exponential';
  }
): Promise<T> {
  // Don't add features beyond the test
}
```

Don't add features, refactor other code, or improve beyond what the test requires.

### Verify GREEN - Watch It Pass

**MANDATORY.**

```bash
npm test path/to/test.test.ts
```

Confirm:

- Test passes
- Other tests still pass
- Output pristine (no errors)

**Test fails?** Fix code, not test.

### REFACTOR - Clean Up

After green only:

- Remove duplication
- Improve names
- Extract helpers

Keep tests green. Don't add behavior.

## Good Test Qualities

| Quality          | Good                     | Bad                                                 |
| ---------------- | ------------------------ | --------------------------------------------------- |
| **Minimal**      | One thing                | `test('validates email and domain and whitespace')` |
| **Clear**        | Describes behavior       | `test('test1')`                                     |
| **Shows intent** | Demonstrates desired API | Obscures what code should do                        |

## Why Order Matters

**"I'll write tests after to verify it works"**

Tests written after code pass immediately. Passing immediately proves nothing:

- Might test wrong thing
- Might test implementation, not behavior
- Might miss edge cases

Test-first forces you to see the test fail, proving it actually tests something.

**"Already manually tested all edge cases"**

Manual testing is ad-hoc. You think you tested everything but:

- No record of what you tested
- Can't re-run when code changes
- Easy to forget cases under pressure

Automated tests are systematic.

**"Deleting X hours of work is wasteful"**

Sunk cost fallacy. The time is already gone. Working code without real tests is technical debt.

## Common Rationalizations

| Excuse                         | Reality                                                     |
| ------------------------------ | ----------------------------------------------------------- |
| "Too simple to test"           | Simple code breaks. Test takes 30 seconds.                  |
| "I'll test after"              | Tests passing immediately prove nothing.                    |
| "Already manually tested"      | Ad-hoc ≠ systematic. No record, can't re-run.               |
| "Deleting X hours is wasteful" | Keeping unverified code is technical debt.                  |
| "Keep as reference"            | You'll adapt it. That's testing after. Delete means delete. |
| "Test hard = design unclear"   | Listen to test. Hard to test = hard to use.                 |
| "TDD will slow me down"        | TDD faster than debugging.                                  |
| "This is different because..." | No exceptions. Delete code. Start with TDD.                 |

## Red Flags - STOP and Start Over

- Code before test
- Test after implementation
- Test passes immediately
- Can't explain why test failed
- Tests added "later"
- "Keep as reference" or "adapt existing code"
- "Already spent X hours, deleting is wasteful"
- "TDD is dogmatic, I'm being pragmatic"

**All of these mean: Delete code. Start over with TDD.**

## Example: Bug Fix

**Bug:** Empty email accepted

**RED**

```typescript
test("rejects empty email", async () => {
  const result = await submitForm({ email: "" });
  expect(result.error).toBe("Email required");
});
```

**Verify RED**

```bash
$ npm test
FAIL: expected 'Email required', got undefined
```

**GREEN**

```typescript
function submitForm(data: FormData) {
  if (!data.email?.trim()) {
    return { error: "Email required" };
  }
  // ...
}
```

**Verify GREEN**

```bash
$ npm test
PASS
```

**REFACTOR**
Extract validation for multiple fields if needed.

## Verification Checklist

Before marking work complete:

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output pristine (no errors, warnings)
- [ ] Tests use real code (mocks only if unavoidable)
- [ ] Edge cases covered

Can't check all boxes? You skipped TDD. Start over.

## When Stuck

| Problem                | Solution                                         |
| ---------------------- | ------------------------------------------------ |
| Don't know how to test | Write wished-for API. Write assertion first.     |
| Test too complicated   | Design too complicated. Simplify interface.      |
| Must mock everything   | Code too coupled. Use dependency injection.      |
| Test setup huge        | Extract helpers. Still complex? Simplify design. |

## Final Rule

```
Production code → test exists and failed first
Otherwise → not TDD
```

No exceptions without your team's permission.
