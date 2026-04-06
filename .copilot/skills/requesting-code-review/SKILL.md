---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
---

# Requesting Code Review

Get fresh perspective on your work before merging. A good review catches issues early.

**Core principle:** Review early, review often, review thoroughly.

## When to Request Review

**Mandatory:**

- After completing major feature
- Before merge to main
- When stuck on implementation

**Optional but valuable:**

- Before refactoring (baseline check)
- After fixing complex bug
- When learning new patterns

## How to Request

**1. Prepare context:**

```
What you built:
[1-2 sentence summary]

Why you built it:
[Problem solved, requirement addressed]

How it works:
[Technical overview]

Files changed:
- [File 1]
- [File 2]

Testing:
- [Tests added/modified]
- [Manual testing done]

Issues found & fixed:
- [Issue 1]: [how fixed]
- [Issue 2]: [how fixed]
```

**2. Prepare for feedback:**

- Design: Can architecture be improved?
- Code: Does it follow conventions?
- Tests: Is coverage adequate?
- Performance: Any bottlenecks?
- Security: Any vulnerabilities?

## Integration with Workflows

**Feature Development:**

- Build with TDD
- Run verification checklist
- Request code review
- Fix feedback
- Merge

**Bug Fixes:**

- Use systematic debugging
- Create regression test (TDD)
- Request code review
- Fix feedback
- Merge

**Before Refactoring:**

- Request review of existing code
- Get feedback on goals
- Refactor with tests
- Request review again

## Red Flags

**Never:**

- Skip review because "it's simple"
- Ignore critical feedback
- Proceed with major issues unfixed
- Argue with valid technical feedback

**If reviewer wrong:**

- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

## Code Review Checklist

**For reviewer to check:**

- [ ] Follows project conventions (style, naming, patterns)
- [ ] All new code has tests
- [ ] Tests actually test something (failed first)
- [ ] No console.logs or debug code
- [ ] Error handling included
- [ ] No hardcoded values (use constants)
- [ ] Performance acceptable
- [ ] No security issues
- [ ] Comments explain why (not what)
- [ ] Requirements met

**As author, ensure these before requesting:**

- [ ] All tests pass
- [ ] Linter passes
- [ ] Build succeeds
- [ ] Manual testing complete
- [ ] Requirements checklist done
- [ ] No known issues remaining
