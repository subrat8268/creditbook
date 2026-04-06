---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing - requires running verification commands and confirming output before making any success claims
---

# Verification Before Completion

## Overview

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command, you cannot claim it passes.

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = not verifying
```

## Common Failures

| Claim            | Requires                            | Not Sufficient               |
| ---------------- | ----------------------------------- | ---------------------------- |
| Tests pass       | Test command output: 0 failures     | Previous run, "should pass"  |
| Linter clean     | Linter output: 0 errors             | Partial check, extrapolation |
| Build succeeds   | Build command: exit 0               | Logs look good               |
| Bug fixed        | Test original symptom: passes       | Code changed, assumed fixed  |
| Requirements met | Checklist verification: all checked | Tests passing                |

## Red Flags - STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!")
- About to commit/push/PR without verification
- Trusting agent success reports without checking
- Relying on partial verification
- **ANY wording implying success without having run verification**

## Rationalization Prevention

| Excuse                    | Reality                |
| ------------------------- | ---------------------- |
| "Should work now"         | RUN the verification   |
| "I'm confident"           | Confidence ≠ evidence  |
| "Just this once"          | No exceptions          |
| "Linter passed"           | Linter ≠ compiler      |
| "Agent said success"      | Verify independently   |
| "Partial check is enough" | Partial proves nothing |

## Key Patterns

**Tests:**

```
✅ [Run test command] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

**Regression tests (TDD):**

```
✅ Write → Run (pass) → Revert fix → Run (must fail) → Restore → Run (pass)
❌ "I've written a regression test" (without verification)
```

**Build:**

```
✅ [Run build] [See: exit 0] "Build passes"
❌ "Linter passed"
```

**Requirements:**

```
✅ Re-read plan → Checklist → Verify each → Report
❌ "Tests pass, phase complete"
```

## Why This Matters

- Trust is built on verification
- Unverified claims break credibility
- 95% of "done" claims without verification have issues

## When To Apply

**ALWAYS before:**

- ANY variation of success/completion claims
- ANY expression of satisfaction
- ANY positive statement about work state
- Committing, PR creation, task completion
- Moving to next task

**Rule applies to:**

- Exact phrases
- Paraphrases and synonyms
- Implications of success
- ANY communication suggesting completion

## The Bottom Line

**No shortcuts for verification.**

Run the command. Read the output. THEN claim the result.

This is non-negotiable.
