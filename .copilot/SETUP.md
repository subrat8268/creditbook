# GitHub Copilot Superpowers Setup Guide

## Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration Files](#configuration-files)
3. [Agent Types & Auto-Routing](#agent-types--auto-routing)
4. [Custom Commands](#custom-commands)
5. [Prompt Templates](#prompt-templates)
6. [Integration with Your Workflow](#integration-with-your-workflow)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Install Dependencies

```bash
# Install GitHub Copilot in VS Code
# Search for "GitHub Copilot" in Extensions (github.copilot)
# Search for "GitHub Copilot Chat" in Extensions (github.copilot-chat)

# Install recommended extensions
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
code --install-extension inferrinjabot.expo-tools
```

### 2. Project Setup

```bash
# Configuration is already in .copilot/ and .vscode/
# Verify structure
ls -la .copilot/
# Should show:
# - agents.config.json
# - instructions/
# - prompts/
# - skills/

# Reload VS Code
# Press: Cmd+Shift+P → "Developer: Reload Window"
```

### 3. Authenticate with GitHub

1. Open Copilot Chat (Cmd+Shift+I on Mac, Ctrl+Shift+I on Windows/Linux)
2. Click "Sign in with GitHub"
3. Authorize Copilot to access your GitHub account

---

## Configuration Files

### `.copilot/agents.config.json`

Defines 17 specialized agents, each with:

- **Model**: `gpt-4-turbo` or `claude-sonnet-4-20250514`
- **Temperature**: 0.2 (deterministic) to 0.5 (creative)
- **Max tokens**: 4000–16000 depending on task type
- **Triggers**: File patterns that automatically route to this agent

### `.copilot/instructions/`

Task-specific guides that teach Copilot KredBook conventions.

### `.copilot/prompts/templates.md`

Reusable prompt templates for common task types.

### `.copilot/skills/`

Advanced workflow skills:

- `systematic-debugging/` — 5-step debugging process
- `test-driven-development/` — TDD workflow
- `verification-before-completion/` — Quality checklist
- `requesting-code-review/` — PR automation
- `using-git-worktrees/` — Parallel task management
- `prompt-analyzer/` — Auto-route prompts to right skill (NEW)
- `ui-reference-screen-generation/` — Generate screens from design images (NEW)

---

## Agent Types & Auto-Routing

### 10 KredBook-Specific Agents

1. **Documentation** (GPT-4) — Writing guides, specs, comments
2. **Architecture** (GPT-4) — System design, database schema
3. **Major Features** (Sonnet) — Implement screens, complex logic
4. **React Native** (Sonnet) — Component & mobile UI development
5. **Backend** (Sonnet) — API development, SQL, Supabase
6. **Testing** (GPT-4) — Write tests, QA strategy
7. **Security** (GPT-4) — Auth audits, RLS, vulnerabilities
8. **Performance** (Sonnet) — Optimization, profiling, bundle size
9. **Refactoring** (Sonnet) — Code cleanup, migrations
10. **Debugging** (Sonnet) — Bug fixes, error analysis, troubleshooting

### 5 Advanced Workflow Agents

11. **TDD** (Sonnet) — Test-driven development with `copilot:tdd`
12. **Systematic Debugging** (Sonnet) — 5-step process with `copilot:debug-systematic`
13. **Verification** (GPT-4) — Quality gate with `copilot:verify`
14. **Code Review** (GPT-4) — PR generation with `copilot:review`
15. **Git Worktree** (Sonnet) — Parallel work with `copilot:git-worktree`

### 2 Smart Routing Agents (NEW)

16. **Prompt Analyzer** (Sonnet) — Auto-detect intent from natural language with `copilot:analyze-prompt`
17. **UI Reference Screen Generator** (Sonnet) — Generate screens from design images with `copilot:ui-reference-screen` or `copilot:screen-from-design`

---

## Custom Commands

| Command                       | Agent                | Use Case                          |
| ----------------------------- | -------------------- | --------------------------------- |
| `copilot:docs`                | Documentation        | Writing guides, specs, comments   |
| `copilot:architecture`        | Architecture         | System design, DB schema          |
| `copilot:feature`             | Major Features       | Implement new screens, features   |
| `copilot:test`                | Testing              | Write tests, QA strategy          |
| `copilot:security`            | Security             | Auth audit, RLS, vulnerabilities  |
| `copilot:debug`               | Debugging            | General debugging                 |
| `copilot:tdd`                 | TDD                  | TDD workflow for features         |
| `copilot:debug-systematic`    | Systematic Debugging | 5-step debugging process          |
| `copilot:verify`              | Verification         | Quality gate before commit        |
| `copilot:review`              | Code Review          | Generate PR description           |
| `copilot:git-worktree`        | Git Worktree         | Setup parallel worktrees          |
| `copilot:analyze-prompt`      | Prompt Analyzer      | Auto-route to right skill (NEW)   |
| `copilot:ui-reference-screen` | UI Reference Screen  | Generate from design image (NEW)  |
| `copilot:screen-from-design`  | UI Reference Screen  | Alias: Generate from design (NEW) |

---

## Prompt Templates

Use templates from `.copilot/prompts/templates.md` for common tasks.

### Example: TDD Workflow

```
copilot:tdd

@context /docs/ux-context.md
@context /docs/design-system.md

Task: Implement "Download Customer Statement" feature

Step 1: Write failing tests
Step 2: Implement functionality
Step 3: Make tests pass
Step 4: Refactor for clarity

Requirements:
- User taps "Download" on Customer Detail
- Export all transactions as PDF
- Share via native share sheet
- Show success toast
```

### Example: Systematic Debugging

```
copilot:debug-systematic

Task: Fix "Payment lost on slow network" bug

Symptoms:
- User records payment on slow 2G network
- Payment completes but doesn't show in list
- Reloading list shows payment was saved

Steps to reproduce:
1. Enable network throttling (2G/3G)
2. Open Customer Detail
3. Record payment
4. Observe payment missing from list
5. Reload page
6. Payment appears
```

---

## Integration with Your Workflow

### Daily Development Workflow

```
Morning:
1. Pick task from sprint
2. Use copilot:tdd for TDD workflow
3. Use copilot:verify before committing
4. Use copilot:review before PR

When fixing bugs:
1. Use copilot:debug-systematic for 5-step process
2. Use copilot:verify before committing

When juggling multiple tasks:
1. Use copilot:git-worktree to setup parallel worktrees
2. Switch between branches instantly
```

---

## Best Practices

1. **Use @context directives** to give Copilot relevant documentation
2. **Break large tasks** into smaller steps
3. **Review all generated code** before committing
4. **Test on both iOS and Android** for React Native code
5. **Use systematic debugging** for bugs, not trial-and-error
6. **Follow TDD workflow** for new features
7. **Run verification checklist** before every commit

---

## Troubleshooting

### "Copilot not responding"

1. Check GitHub Copilot is authenticated
2. Verify VS Code extensions are installed
3. Reload VS Code (Cmd+Shift+P → "Developer: Reload Window")

### "Wrong agent selected"

Use explicit command: `copilot:tdd` instead of relying on file-based routing

### "Generated code doesn't match style"

Review generated code and:

1. Fix color tokens (use `theme.ts`, not raw hex)
2. Fix imports (lucide-react-native, not @expo/vector-icons)
3. Add missing error handling

---

**Last Updated**: April 7, 2026  
**Version**: 1.0  
**Status**: Ready to use 🚀
