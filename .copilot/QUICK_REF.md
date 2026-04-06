# GitHub Copilot Quick Reference

## Keyboard Shortcuts

| Shortcut       | Action                                          |
| -------------- | ----------------------------------------------- |
| `Cmd+Shift+I`  | Open Copilot Chat (macOS)                       |
| `Ctrl+Shift+I` | Open Copilot Chat (Windows/Linux)               |
| `Cmd+K`        | Show Copilot inline suggestions (macOS)         |
| `Ctrl+K`       | Show Copilot inline suggestions (Windows/Linux) |
| `Tab`          | Accept suggestion                               |
| `Escape`       | Reject suggestion                               |
| `Alt+[`        | Previous suggestion                             |
| `Alt+]`        | Next suggestion                                 |

---

## 17 Available Agents & Commands

### 10+ KredBook Agents

```
copilot:docs        → Documentation (write guides)
copilot:architecture → Architecture (system design)
copilot:feature     → Major Features (build screens)
copilot:test        → Testing (write tests)
copilot:security    → Security (auth, RLS audits)
copilot:debug       → Debugging (fix bugs)
```

### 5 Advanced Workflow Agents

```
copilot:tdd                    → Test-Driven Development
copilot:debug-systematic       → 5-Step Debugging Process
copilot:verify                 → Quality Gate Checklist
copilot:review                 → PR Description Generator
copilot:git-worktree           → Parallel Task Manager
```

### 2 Smart Routing Agents (NEW)

```
copilot:analyze-prompt         → Auto-route prompts to right skill
copilot:ui-reference-screen    → Generate screen from design image
copilot:screen-from-design     → Alias: Generate screen from design image
```

---

## Common Tasks

### Build a Feature (TDD)

```
copilot:tdd

@context /docs/ux-context.md
@context /docs/design-system.md

Task: Implement [Feature Name]
Requirements: [List]
Files: [To create/modify]
```

### Fix a Bug

```
copilot:debug-systematic

Task: Fix [Bug Description]
Symptoms: [List]
Steps to reproduce: [List]
Files affected: [List]
```

### Before Committing

```
copilot:verify

Files changed: [paths]
Tests: [added/modified]
Checklist: [verify all items]
```

### Before Creating PR

```
copilot:review

Changes made: [description]
Files: [modified]
Testing: [tested on]
Description: [for PR body]
```

### Multiple Tasks in Parallel

```
copilot:git-worktree

Current task: [description]
Next task: [description]
Branch names: [feature/...] [bugfix/...]
```

### Generate Screen from Design Image (NEW)

```
copilot:ui-reference-screen

Design: /designs/new-screen.png
Screen name: NewScreenName
Requirements: [list feature requirements]
API endpoints: [list needed APIs]
```

### Auto-Route Prompt to Right Skill (NEW)

```
Just describe what you want, no command needed:

"Build a new customer filter feature"
→ Auto-routes to copilot:tdd

"My orders list is crashing on iOS"
→ Auto-routes to copilot:debug-systematic

"I have a design for the new checkout screen"
→ Auto-routes to copilot:ui-reference-screen
```

---

## File-Based Auto-Routing

When you edit these files, Copilot automatically switches agents:

| File Pattern           | Agent                               |
| ---------------------- | ----------------------------------- |
| `*.md`                 | Documentation                       |
| `ARCHITECTURE.md`      | Architecture                        |
| `schema.sql`           | Backend                             |
| `src/screens/**/*.tsx` | React Native                        |
| `src/api/**/*.ts`      | Backend                             |
| `*.test.tsx`           | Testing                             |
| `designs/*.png`        | UI Reference Screen Generator (NEW) |
| `designs/*.jpg`        | UI Reference Screen Generator (NEW) |
| `designs/*.figma`      | UI Reference Screen Generator (NEW) |

---

## Tips for Best Results

✅ **DO**:

- Use `@context /docs/...` to give Copilot relevant docs
- Include specific file paths in your prompts
- Reference design tokens from `theme.ts`
- Break large tasks into smaller steps
- Review and test all generated code

❌ **DON'T**:

- Accept code without review
- Hardcode colors (use theme.ts)
- Skip the verification checklist
- Deploy without testing on both iOS & Android

---

## Workflow Examples

### Morning: Implement Feature

```
1. copilot:tdd
   @context /docs/ux-context.md
   Task: Implement [feature]

2. [Write tests → implement → make green]

3. copilot:verify
   Files: [list changed files]

4. git commit

5. copilot:review
   Changes: [summary]

6. Create PR
```

### Afternoon: Fix Bug

```
1. copilot:debug-systematic
   Task: Fix [bug]
   Symptoms: [describe issue]

2. [Follow 5-step debugging process]

3. copilot:verify
   Files: [test files and implementation]

4. git commit
```

### Multi-Task Day

```
1. copilot:git-worktree
   Task 1: Feature A
   Task 2: Bug fix B

2. [Work on Task 1 in worktree 1]

3. [Switch to worktree 2 for Task 2]

4. [Merge back when complete]
```

---

## Resources

- **SETUP.md** — Installation & configuration
- **README.md** — Feature overview
- **FOLDER_STRUCTURE.md** — Project organization
- **instructions/** — Format guides and patterns
- **skills/** — Advanced workflows
- **prompts/templates.md** — Reusable prompt templates

---

**Quick Ref v1.0** — April 7, 2026
