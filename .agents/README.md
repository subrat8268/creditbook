# OpenCode Agents & Skills Guide

Welcome to the **KredBook** AI-powered development environment. This guide explains how to use our agent system, specialized skills, and MCP tools effectively.

---

## 🚀 Quick Start: Command Interface

We use a command-first workflow to ensure safety and consistency. Use these commands as your primary prompts:

| Command | Purpose | Default Skills Loaded |
| :--- | :--- | :--- |
| **`/plan`** | **Start here.** Turns a request into a scoped implementation plan. | `project-planner`, `writing-plans` |
| **`/build`** | Implement features after a plan is approved. | `ui-ux-pro-max`, `frontend-design`, `react-native-skills` |
| **`/fix`** | Debug and fix specific bugs with root-cause analysis. | `systematic-debugging`, `code-reviewer` |
| **`/refactor`** | Safe code structure improvements without behavior change. | `refactor-engineer`, `code-reviewer` |
| **`/audit`** | Analyze the codebase for technical debt or design drift. | `code-reviewer`, `verification-before-completion` |
| **`/doc`** | Write, update, or co-author any documentation. | `doc-coauthoring`, `internal-comms`, `writing-plans` |
| **`/finish`** | Review, commit, and push completed changes safely. | `finishing-a-development-branch`, `verification-before-completion` |

> [!TIP]
> You can manually load specific skills by adding `load_skills=["skill-name", ...]` to your request.

---

## 🛠️ Specialized Skills (20)

Our system discovers skills located in `.agents/skills/`. Each skill is a specialized persona with its own instructions and focus areas.

### Planning & Documentation
1. **`project-planner`** — Scoped plans, task breakdowns, and risk assessment.
2. **`writing-plans`** — Structured planning docs: PRDs, specs, requirements.
3. **`doc-coauthoring`** — Writing assistance and co-authoring for any document.
4. **`internal-comms`** — Changelogs, announcements, and status updates.

### Design & Brand
5. **`ui-ux-pro-max`** — Design intelligence and aesthetic polish.
6. **`frontend-design`** — Frontend architecture and component design.
7. **`brand-guidelines`** — Brand identity, colors, and typography consistency.
8. **`extract-design-system`** — Extract design tokens and components into a system.
9. **`sleek-design-mobile-apps`** — Mobile-specific design polish.

### React Native & TypeScript
10. **`react-native-skills`** — Best practices for Expo and React Native.
11. **`typescript-advanced-types`** — Advanced TypeScript type patterns and generics.

### Backend & Database
12. **`supabase-expert`** — Database schema, RLS, and migrations.
13. **`supabase-postgres-best-practices`** — Advanced Supabase/Postgres performance patterns.

### Code Quality & Engineering
14. **`code-reviewer`** — Bug detection and best practice enforcement.
15. **`refactor-engineer`** — Code reuse and cleanup.
16. **`systematic-debugging`** — Structured root-cause analysis and debugging.
17. **`verification-before-completion`** — Agents verify output before marking a task done.
18. **`finishing-a-development-branch`** — Clean branch/PR lifecycle and commit flow.

### Agent Infrastructure
19. **`context7-mcp`** — Real-time documentation for libraries and frameworks.
20. **`skill-creator`** — Build and manage new agent skills.

---

## 🔌 MCP Tools (Model Context Protocol)

We use MCP servers to bridge the gap between AI and external data sources:

- **Supabase**: Direct database access and schema verification. (No guessing!).
- **Context7**: Fetches current documentation for any library (React, Expo, etc.).
- **StitchMCP**: Design system generation and application.
- **Notion**: Project management and documentation sync.

---

## 📘 Developer Resources

### Adding a New Skill
To add a skill, create a new folder in `.agents/skills/` with a **`SKILL.md`** file.
The file **MUST** start with YAML frontmatter:
```yaml
---
name: skill-name
description: Brief summary of what this skill does.
---
```
> [!IMPORTANT]
> Ensure the file is encoded in **UTF-8** and uses only standard ASCII characters for maximum compatibility with the discovery engine.

### Useful Project Commands
- `npm run start`: Start the Expo dev server.
- `npm run lint`: Check for code style issues.
- `npm run ios` / `npm run android`: Run on a device/emulator.
- `npm ci`: Clean install dependencies.

---

## 📜 Source of Truth
1. **`SYSTEM_CONTEXT.md`**: The primary operating rules.
2. **`AGENTS.md`**: Canonical terms and product scope.
3. **`.agents/orchestration.md`**: How the agent pipelines work.
