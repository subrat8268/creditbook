# OpenCode Agents & Skills Guide

Welcome to the **KredBook** AI-powered development environment. This guide explains how to use our agent system, specialized skills, and MCP tools effectively.

---

## 🚀 Quick Start: Command Interface

We use a command-first workflow to ensure safety and consistency. Use these commands as your primary prompts:

| Command | Purpose | Default Skills Loaded |
| :--- | :--- | :--- |
| **`/plan`** | **Start here.** Turns a request into a scoped implementation plan. | `project-planner`, `tech-lead` |
| **`/build`** | Implement features after a plan is approved. | `ui-ux-pro-max`, `ui-designer`, `react-native-skills` |
| **`/fix`** | Debug and fix specific bugs with root-cause analysis. | `debugger`, `thinker` |
| **`/refactor`** | Safe code structure improvements without behavior change. | `refactor-engineer` |
| **`/audit`** | Analyze the codebase for technical debt or design drift. | `code-reviewer`, `tech-lead` |
| **`/git-push`** | Review, commit, and push completed changes safely. | `code-reviewer`, `git-push` |

> [!TIP]
> You can manually load specific skills by adding `load_skills=["skill-name", ...]` to your request.

---

## 🛠️ Specialized Skills

Our system discovers skills located in `.agents/skills/`. Each skill is a specialized persona with its own instructions and focus areas.

### Available Skills:

1.  **`project-planner`**: Scoped plans, task breakdowns, and risk assessment.
2.  **`tech-lead`**: Architecture decisions and component patterns.
3.  **`ui-ux-pro-max`**: Design intelligence and aesthetic polish.
4.  **`ui-designer`**: Enforces zero-token drift using `src/utils/theme.ts`.
5.  **`react-native-skills`**: Best practices for Expo and React Native.
6.  **`debugger`**: Systematic diagnosis and issue fixing.
7.  **`thinker`**: Deep analysis for complex architectural problems.
8.  **`code-reviewer`**: Bug detection and best practice enforcement.
9.  **`refactor-engineer`**: Code reuse and cleanup.
10. **`supabase-expert`**: Database schema, RLS, and migrations.
11. **`context7-mcp`**: Real-time documentation for libraries and frameworks.
12. **`git-push`**: Review-first commit message generation and safe push flow.

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
