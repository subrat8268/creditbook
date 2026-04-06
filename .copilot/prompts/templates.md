# Prompt Templates for Common Tasks

Copy and paste these templates into Copilot Chat (Cmd+Shift+I) and customize for your needs.

---

## 1. Feature Implementation (TDD Approach)

```
copilot:tdd

@context /docs/ux-context.md
@context /docs/design-system.md

Task: [Feature Name / User Story]

Description:
[What the user wants to do, why it matters]

Requirements:
- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Requirement 3]

UI/UX:
[Describe layout, buttons, modals, navigation]

Edge Cases:
- [Edge case 1]
- [Edge case 2]

Files to create/modify:
- Create: [new file]
- Modify: [existing file]

Reference:
- Design: /docs/design-system.md
- UX flow: /docs/ux-context.md section [N]

Step 1: Write failing tests
Step 2: Implement functionality
Step 3: Make tests pass
Step 4: Refactor for clarity
```

---

## 2. Bug Fix (Systematic Debugging)

```
copilot:debug-systematic

@context /docs/ARCHITECTURE.md

Task: Fix [Bug Title]

Symptoms:
- User sees [error/behavior]
- Expected: [correct behavior]
- Actually happens: [incorrect behavior]

Severity: [Critical/High/Medium/Low]
Frequency: [Always/Sometimes/Intermittent]

Steps to reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Environment:
- OS: [iOS/Android/Both]
- Network: [WiFi/4G/2G/Offline]
- Device: [phone/tablet]

Stack trace (if available):
[Paste error message here]

Files involved:
- [File 1]
- [File 2]

Recent changes:
[Any changes that might be related?]

Step 1: Understand the problem
Step 2: Locate the root cause
Step 3: Fix the issue
Step 4: Verify the fix
Step 5: Test edge cases
```

---

## 3. Database Migration

```
copilot:architecture

@context /schema.sql
@context /docs/prd.md

Task: Create migration for [feature/change]

Description:
[What business requirement needs this schema change?]

Changes needed:
- [ ] Add table [table_name]
- [ ] Add column [column] to [table]
- [ ] Create trigger [trigger_name]
- [ ] Add RLS policy [policy_name]

Schema details:
- Table: [name]
  - Columns: [list columns with types]
  - Relationships: [foreign keys]
  - Indexes: [if performance-critical]

RLS policies:
- [Policy 1]: [description]
- [Policy 2]: [description]

Backward compatibility:
[Will this break existing queries? How do we handle it?]

Testing:
- [ ] New RLS policy blocks unauthorized access
- [ ] Existing queries still work
- [ ] Performance is acceptable (< [Xms] for [operation])

Reference:
follow /docs/.copilot/instructions/database-migrations.md
```

---

## 4. Performance Optimization

```
copilot:performance

@context /docs/ARCHITECTURE.md
@context /docs/design-system.md

Task: [Optimize [slow component/query/feature]]

Current Performance:
- Load time: [X seconds]
- Render time: [X ms]
- Bundle size: [X MB]
- Target: [Y seconds/ms/MB]

Problem:
[Describe what's slow]

Expected solution:
[Describe desired outcome]

Constraints:
- Must work offline
- Cannot change database schema
- Must support iOS [version]+

Files to optimize:
- [File 1]
- [File 2]

Measurements:
- Before: [current metrics]
- After: [target metrics]

Reference:
follow /docs/.copilot/instructions/screen-development.md
```

---

## 5. Testing & QA

```
copilot:test

@context /docs/prd.md
@context /docs/ux-context.md

Task: Write test cases for [Feature / Component]

Component/feature:
[Name and location]

Happy path:
1. [Happy path step 1]
2. [Happy path step 2]

Edge cases to test:
- [Edge case 1]
- [Edge case 2]

Error scenarios:
- Network failure
- [Other error 1]

Test framework:
[Jest/Detox/other]

Test examples:
- Test 1: [describe]
- Test 2: [describe]

Reference:
follow existing tests in [reference file]
```

---

## 6. Security Audit

```
copilot:security

@context /docs/ARCHITECTURE.md
@context /schema.sql

Task: Security audit of [Feature / Flow / Component]

Areas to check:
- [ ] Authentication (are users verified?)
- [ ] Authorization (can users access data they shouldn't?)
- [ ] RLS policies (database rows properly isolated?)
- [ ] Token storage (secure storage for auth tokens?)
- [ ] Input validation (XSS, SQL injection protection?)
- [ ] Sensitive data (PII handling, encryption)

Feature/Flow:
[Describe the feature or flow]

Current implementation:
[Link to files or describe implementation]

Potential risks:
- [Risk 1]
- [Risk 2]

Questions:
- [Question 1]
- [Question 2]

Reference:
follow /docs/.copilot/instructions/api-development.md security section
```

---

## 7. Code Review (Before Creating PR)

```
copilot:review

@context /docs/ARCHITECTURE.md
@context /docs/design-system.md

Changes summary:
[1-2 sentence summary of what changed]

Type:
- [ ] Feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Other

Files changed:
- [File 1]
- [File 2]

What was added:
- [Addition 1]
- [Addition 2]

What was fixed:
- [Fix 1]
- [Fix 2]

Testing done:
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

Checklist:
- [ ] Follows KredBook conventions (colors, imports, patterns)
- [ ] No console.logs left
- [ ] Error handling included
- [ ] Comments added where needed
- [ ] No breaking changes

Known issues:
[Any known issues or follow-ups?]

Generate comprehensive PR description covering:
- Summary
- Changes
- Testing
- How to review
```

---

## 8. React Component Development

```
copilot:feature

@context /docs/design-system.md
@context /docs/ux-context.md

Task: [Create / Modify] [Component Name]

Purpose:
[What does this component do?]

Props:
interface [ComponentName]Props {
  [prop1]: [type];
  [prop2]: [type];
}

Behavior:
- [Behavior 1]
- [Behavior 2]

Styling:
- Use colors from [theme.ts path]
- Use icons from [lucide-react-native]
- Layout: [flex/grid/other]

Edge cases:
- Empty state: [describe]
- Loading state: [describe]
- Error state: [describe]

Example usage:
<[ComponentName] [prop1]={...} [prop2]={...} />

Reference:
follow /docs/.copilot/instructions/react-native-components.md
```

---

## 9. API Function Development

```
copilot:backend

@context /schema.sql
@context /docs/ARCHITECTURE.md

Task: Create/Update API function: [function_name]

Purpose:
[What does this function do?]

Input:
interface [FunctionNameInput] {
  [param1]: [type];
  [param2]: [type];
}

Output:
interface [FunctionNameOutput] {
  [field1]: [type];
  [field2]: [type];
}

Logic:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Edge cases:
- [Edge case 1]
- [Edge case 2]

Error handling:
- [Error 1]: throw new Error('[message]')
- [Error 2]: throw new Error('[message]')

Performance:
- Avoid N+1 queries
- Use indexes for filtering
- Budget: < [Xms] per request

Database operations:
- READ: [tables needed]
- WRITE: [tables modified]
- RLS: [RLS policies to verify]

Reference:
follow /docs/.copilot/instructions/api-development.md
```

---

## 10. Git Worktree Setup (Multi-Task)

```
copilot:git-worktree

Current branch: [current-branch]

Task 1 (Feature):
- Description: [description]
- Branch: [feature/...]
- Expected duration: [1-2 days]

Task 2 (Bug fix):
- Description: [description]
- Branch: [bugfix/...]
- Expected duration: [2-4 hours]

Priority:
[Which task to start with?]

When to switch:
[When will you switch between tasks?]

Merge strategy:
[How to handle merging back? Rebase? Merge commit?]
```

---

## 11. Quality Verification (Before Commit)

```
copilot:verify

Files changed:
- [File 1]
- [File 2]

Type of change:
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation

Quality checklist:
- [ ] Code follows KredBook conventions
- [ ] Color tokens used (not hardcoded hex)
- [ ] Icons from lucide-react-native (not @expo/vector-icons)
- [ ] Error handling with try-catch + Sentry
- [ ] Comments explain why (not what)
- [ ] No console.logs left in code
- [ ] Tests added/updated
- [ ] No breaking changes

Testing:
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] Tested with slow network
- [ ] Tested edge cases

Documentation:
- [ ] Code comments updated
- [ ] README updated if needed
- [ ] Storybook updated if UI component

Reference:
follow /docs/.copilot/instructions/global.md conventions
```

---

## Quick Copy-Paste Cheat Sheet

```
# TDD Workflow
copilot:tdd
@context /docs/ux-context.md
Task: [feature]

# Debug Bug
copilot:debug-systematic
Task: Fix [bug]
Steps to reproduce: [list]

# Before Commit
copilot:verify
Files changed: [list]

# Before PR
copilot:review
Changes summary: [summary]

# Multiple Tasks
copilot:git-worktree
Task 1: [feature]
Task 2: [bugfix]

# Build API
copilot:backend
@context /schema.sql
Task: Create [function]

# Build Screen
copilot:feature
@context /docs/ux-context.md
Task: Build [screen]

# Security Check
copilot:security
Task: Audit [feature]

# Performance
copilot:performance
Task: Optimize [component]

# Tests
copilot:test
Task: Write tests for [feature]
```

---

**Tips**:

1. Copy these templates and customize for your specific task
2. Always include `@context` directives to guide Copilot
3. Be specific about requirements and edge cases
4. Follow the sections—don't skip important details
5. Review Copilot's response before committing

---

**Version**: 1.0  
**Last Updated**: April 7, 2026
