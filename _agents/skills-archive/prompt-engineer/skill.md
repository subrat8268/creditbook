# Prompt Engineer Skill

> Writing effective prompts, specifying requirements, and maximizing AI agent productivity for KredBook.

## When to Use

- Creating tasks for agents
- Writing detailed instructions
- Specifying requirements
- Breaking down requests

## Prompt Structure

### 1. Task Prompt Template

```
## TASK: [Clear goal]
[1-2 sentence description]

## CONTEXT
- Project: KredBook
- Tech: React Native, Expo, Supabase, Zustand
- Location: [Files/components]

## REQUIREMENTS
1. [Specific requirement]
2. [Specific requirement]
3. [Specific requirement]

## CONSTRAINTS
- [What NOT to do]
- [Avoid patterns]

## OUTPUT
[Expected deliverable]
```

### 2. Component Prompt

```
Create [ComponentName] in src/components/[feature]/

WHAT:
- [Component purpose]

DESIGN (from design-system.md):
- Colors from theme.ts
- Spacing: xs=4, sm=8, md=16, lg=24, xl=32
- Border radius: cards=16, buttons=14, inputs=12
- Typography: Inter font

BEHAVIOR:
- [States: loading, error, empty]
- [Interactions]
- [Animations under 400ms]

TYPES:
- Use src/utils/schemas.ts

OUTPUT:
- Single file: src/components/[feature]/[ComponentName].tsx
```

### 3. Feature Prompt

```
Add [Feature Name] to KredBook

SCOPE:
- New screen: [Route]
- Components: [List]
- State: [Store or Query]
- API: [Supabase operations]

EXISTING TO FOLLOW:
- Components: src/components/[feature]/
- Store: src/store/
- Hooks: src/hooks/

API PATTERNS:
- Use Supabase MCP
- Use React Query for server state
- Use Zustand for client state

DESIGN:
- Follow docs/design-system.md

OUTPUT:
- Working feature with loading/error states
```

### 4. Bug Fix Prompt

```
Fix [Issue Description]

ERROR:
[Exact error message or behavior]

LOCATION:
[File:line or function]

STEPS TO REPRODUCE:
1. [Step 1]
2. [Step 2]

EXPECTED:
[What should happen]

ACTUAL:
[What happens instead]

ATTEMPTS:
[Any previous attempts]
```

### 5. Review Prompt

```
Review [File/Feature] for quality

CHECK:
- Type safety
- Error handling
- Loading states
- Performance
- Accessibility

KREDBOOK SPECIFIC:
- Uses theme colors (not hardcoded)
- Uses spacing tokens
- Financial amounts bold + color coded
- Status uses success/danger/warning

OUTPUT:
- Issues found with severity
- Suggestions for improvement
```

## Requirement Specification

### MUST Include

| Element | Why | Example |
|---------|-----|---------|
| **Goal** | Clear outcome | "Create login screen" |
| **Context** | Background | "React Native app using Zustand" |
| **Constraints** | Boundaries | "Must use existing theme" |
| **Examples** | Clarity | "Like Profile screen" |
| **Output** | Deliverable | "tsx file in src/" |

### MUST NOT Include

- ❌ Ambiguous terms ("make it nice")
- ❌ Vague scope ("do something cool")
- ❌ Missing context
- ❌ Assuming knowledge
- ❌ Overly complex instructions

## Prompt Patterns

### Good → Better

| Good | Better |
|------|--------|
| "Add a button" | "Add primary button with #22C55E background, 52dp height, 14dp radius" |
| "Fix the bug" | "Fix null reference on user?.name in CustomerCard.tsx:23" |
| "Improve UI" | "Add loading skeleton to CustomerList following design-system.md colors" |
| "Add validation" | "Add phone validation: 10 digits, Indian format +91" |

### Specificity Levels

| Level | Example | Use When |
|-------|---------|-----------|
| **Vague** | "Improve the UI" | ❌ Never |
| **Medium** | "Add loading state with spinner" | Small changes |
| **Specific** | "Add circular spinner matching #22C55E theme" | Component work |
| **Detailed** | "Add 24dp circular spinner, #22C55E color, 300ms rotation" | Precise output |

## Agent Communication

### Task Instructions

```
# Role: [Skill]
# Project: KredBook

## GOAL
[What to accomplish]

## FILE LOCATIONS
- [Where to work]
- [Reference files]

## PATTERNS TO FOLLOW
- [Existing similar code]

## QUALITY CHECKS
- [Must pass checks]
```

### Follow-up Questions

```
## QUESTION
[Specific question]

## CONTEXT
[Why it's asked]

## OPTIONS
1. [Option A]
2. [Option B]

## RECOMMENDATION
[Suggested approach with reason]
```

### Iteration

```
// First prompt - initial request
task(prompt="...")

// Follow-up - specific fix needed
session_id="ses_xxx"
task(prompt="Fix: [specific error]")

// More context
task(prompt="Also: [additional requirement]")
```

## Anti-Patterns

- ❌ One-word prompts
- ❌ Missing project context
- ❌ Not specifying output location
- ❌ No quality criteria
- ❌ Vague requirements

## Output Expectations

Always specify:

1. **Files to create/modify**
2. **Quality criteria** ("diagnostics clean")
3. **Test scenarios** (happy path, error cases)
4. **Reference files** to follow

## Example Prompts

### Prompt: New Screen

```
Create CustomerDetail screen in app/customers/[id].tsx

REQUIREMENTS:
- Header with customer name (bold, 24px)
- Balance card showing outstanding amount (green/red based on state)
- Order history list (FlatList with keyExtractor)
- Payment recording button
- Loading state during fetch
- Error state with retry

DESIGN:
- Follow docs/design-system.md
- Use Card component from ui/
- Status chips use success/danger/warning

TECH:
- Route params: { id: string }
- Fetch: useCustomer(id) hook
- Query: React Query cache

OUTPUT:
- Screen at app/customers/[id].tsx
- Type-safe, no 'any'
- lsp_diagnostics clean
```

### Prompt: API Change

```
Add order status update API

CONTEXT:
- Supabase table: orders
- Column: status (PENDING, PAID, OVERDUE)
- Need to update balance after change

REQUIREMENTS:
- Function: updateOrderStatus(id, status)
- Recalculate customer balance
- Emit realtime update
- Invalidate relevant queries

TRANSACTION:
- Use single transaction or RPC
- Rollback on failure

OUTPUT:
- Database function + migration
- TypeScript function using Supabase client
- Tests passing
```

---

*Loaded when: "prompt", "task", "delegate", "create", "specify"*
