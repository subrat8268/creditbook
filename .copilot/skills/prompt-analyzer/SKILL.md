---
name: prompt-analyzer
description: Use this to automatically route your prompt to the right skill or agent - just describe what you want to do and this will figure out which tool to use
---

# Smart Prompt Analyzer & Router

## How It Works

Instead of remembering which command to use (`copilot:tdd` vs `copilot:debug-systematic` etc.), just **describe what you want to do** in natural language. This skill analyzes your intent and routes you to the right agent/skill.

## What You Say vs What Happens

### Building Features → TDD Workflow

**You say:**

```
I need to implement a "Download Customer Statement" feature

Requirements:
- User taps Download
- Export all transactions as PDF
- etc.
```

**Router detects:** Feature implementation + needs tests
**Automatically routes to:** `copilot:tdd`

### Fixing Bugs → Systematic Debugging

**You say:**

```
There's a bug where payments disappear when network is slow

Steps to reproduce:
1. Turn on 2G throttling
2. Record payment
3. Payment doesn't show up
```

**Router detects:** Bug fix + debugging needed
**Automatically routes to:** `copilot:debug-systematic`

### Quality Check → Verification

**You say:**

```
I just finished my feature and want to make sure it's ready to merge
```

**Router detects:** Pre-commit quality check
**Automatically routes to:** `copilot:verify`

### Building Screens from Design → UI Reference

**You say:**

```
Look at the design image in screens/customer-detail.png and build the screen
```

**Router detects:** Screen generation from UI reference
**Automatically routes to:** `copilot:ui-reference-screen`

## Pattern Detection

The router analyzes keywords in your prompt:

| Keywords                                                  | Detected Intent  | Routes To                     |
| --------------------------------------------------------- | ---------------- | ----------------------------- |
| "implement", "build", "feature", "new screen"             | Feature building | `copilot:tdd`                 |
| "fix", "bug", "crash", "error", "doesn't work"            | Bug fixing       | `copilot:debug-systematic`    |
| "design image", "look at", "screens/", "png", "reference" | UI generation    | `copilot:ui-reference-screen` |
| "ready to commit", "quality check", "verify", "before PR" | Quality gate     | `copilot:verify`              |
| "review", "description", "before PR", "review code"       | Code review      | `copilot:review`              |
| "multiple tasks", "parallel", "branches", "switch"        | Parallel work    | `copilot:git-worktree`        |
| "test", "test cases", "QA", "coverage"                    | Testing          | `copilot:test`                |
| "slow", "optimize", "performance"                         | Performance      | `copilot:performance`         |
| "security", "auth", "encryption", "vulnerability"         | Security         | `copilot:security`            |
| "document", "guide", "readme", "spec"                     | Documentation    | `copilot:docs`                |

## How to Use

### Option 1: Direct Natural Language (Recommended)

Just describe what you want. Don't worry about remembering commands:

```
I'm building a "Send Payment Reminder" feature.

User taps a button on the customer detail screen.
It should open WhatsApp with a pre-filled message.

I need to:
1. Add button to CustomerDetail screen
2. Create WhatsApp deep link function
3. Test edge cases

What should I do?
```

**Router automatically detects:** Feature implementation
**Routes to:** `copilot:tdd`
**Agent starts:** TDD workflow

### Option 2: Explicit Command (If You Know)

If you know which workflow you want, use it directly:

```
copilot:tdd

@context /docs/ux-context.md
Task: [your feature]
```

### Option 3: Ask for Router Recommendation

If unsure:

```
I need to work on [describe task].

What's the best workflow for this?
```

**Router responds** with recommended skill + workflow

## Workflow Decision Tree

```
START: What do you want to do?

├─ Build something new?
│  └─ Use copilot:tdd (write tests first)
│
├─ Fix a broken feature?
│  └─ Use copilot:debug-systematic (5-step process)
│
├─ Ready to commit?
│  └─ Use copilot:verify (quality checklist)
│
├─ Need code reviewed?
│  └─ Use copilot:review (generate PR description)
│
├─ Working on multiple features?
│  └─ Use copilot:git-worktree (parallel branches)
│
├─ Build screen from design image?
│  └─ Use copilot:ui-reference-screen (image to code)
│
├─ Performance problem?
│  └─ Use copilot:performance (optimization)
│
├─ Security concern?
│  └─ Use copilot:security (audit)
│
└─ Writing docs?
   └─ Use copilot:docs (documentation)
```

## Examples: What to Say

### ✅ Good Prompts (Router Understands)

```
"I need to build a 'Bulk Import Customers' feature.
User selects CSV file, we parse it, validate, and import.
Need tests, error handling, and feedback."
→ Router: copilot:tdd

"Customers say sometimes orders don't save.
It works 90% of the time but occasionally fails.
I need to debug this consistently."
→ Router: copilot:debug-systematic

"About to commit my feature. Want to verify quality."
→ Router: copilot:verify

"Look at /designs/order-detail.png and build that screen."
→ Router: copilot:ui-reference-screen
```

### ❌ Vague Prompts (Router Confused)

```
"Help me code"
→ Router: Not sure. Ask for more context.

"What should I do?"
→ Router: Not enough info. Describe the task.

"Make it better"
→ Router: What are you building? What's the problem?
```

## Smart Features

### 1. Context Awareness

Router reads your message and automatically suggests relevant documentation:

```
You: "Build customer import feature"

Router: "I'll use copilot:tdd workflow
  Attaching: /docs/ux-context.md (for UX patterns)
  Attaching: instructions/screen-development.md (for screens)
  Attaching: instructions/api-development.md (for API)"
```

### 2. Follow-up Understanding

If you're unclear, router helps clarify:

```
You: "Build a feature"

Router: "What feature? Choose:
  1. New screen
  2. API endpoint
  3. Component
  4. Utility function"
```

### 3. Multi-Step Detection

Router understands complex requests:

```
You: "Build feature + add tests + verify + review"

Router: "This is a full cycle!
  Step 1: copilot:tdd (build with tests)
  Step 2: copilot:verify (quality gate)
  Step 3: copilot:review (PR description)"
```

## Hidden Power: Image Analysis

### Screen Generation from Images

```
You: "Look at /designs/dashboard.png and build that screen"

Router detects: Design image → Screen generation
Routes to: copilot:ui-reference-screen

This skill:
1. Analyzes the design image
2. Extracts components, layout, colors
3. Reads your design system
4. Generates screen code matching the design
```

Use this for:

- Converting Figma designs to React Native screens
- Rebuilding screens from photo references
- Prototyping new features from sketches

## Team Workflow

### For New Team Members

"Don't memorize commands. Just describe what you want to build."

```
New person: "I need to add a payment form"

Router: "Let's use copilot:tdd workflow.
  1. Write test showing what form should do
  2. Build form code
  3. Verify tests pass

Attaching: instructions/react-native-components.md
Ready to start?"
```

### For Code Reviews

"Always verify before committing":

```
You: "I finished the feature"

Router: "Great! Before committing:

  copilot:verify

  This checks:
  ✓ All tests passing
  ✓ No console.logs
  ✓ Error handling included
  ✓ Code follows style guide"
```

## Saved Time

By auto-routing, you save:

- ❌ Remembering 15 different commands
- ❌ Navigating documentation
- ❌ Choosing wrong agent
- ✅ Just describe what you want
- ✅ Router handles the rest

**Average per task:** 2-3 minutes saved
**Per sprint (20 tasks):** 40-60 minutes saved

---

## Summary

| Instead Of                 | Just Say            | And Router           |
| -------------------------- | ------------------- | -------------------- |
| `copilot:tdd`              | "Build new feature" | Automatically routes |
| `copilot:debug-systematic` | "Fix bug"           | Automatically routes |
| `copilot:verify`           | "Quality check"     | Automatically routes |
| Remembering 15 commands    | Describe intent     | Finds right skill    |

**Start using it now:**

```
Open Copilot Chat (Cmd+Shift+I)

Describe what you want to build, fix, or ship.
Don't worry about commands.
Router handles the rest.
```

---

**Use this skill when:** You're not sure which agent to use, or you want to describe your task in natural language
**Use explicit commands when:** You know exactly which workflow to use
**Always available:** Simple prompts understand routing automatically
