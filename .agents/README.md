# OpenCode Agents & Skills Guide

Welcome to the **KredBook** AI-powered development environment.

---

## 🚀 Quick Start: Command Interface

| Command | Purpose | Default Skills Loaded |
| :--- | :--- | :--- |
| **`/plan`** | **Start here.** Scoped implementation plan. | `project-planner`, `writing-plans` |
| **`/build`** | Implement features after plan is approved. | `ui-ux-pro-max`, `frontend-design`, `building-native-ui` |
| **`/fix`** | Debug bugs with root-cause analysis. | `systematic-debugging`, `code-reviewer` |
| **`/refactor`** | Safe code improvements, no behavior change. | `refactor-engineer`, `code-reviewer` |
| **`/audit`** | Analyze codebase for debt or design drift. | `code-reviewer`, `verification-before-completion` |
| **`/doc`** | Write, update, or co-author documentation. | `doc-coauthoring`, `internal-comms`, `writing-plans` |
| **`/finish`** | Review, commit, and push changes safely. | `finishing-a-development-branch`, `verification-before-completion` |
| **`/upgrade`** | Upgrade Expo SDK or major dependencies. | `upgrading-expo`, `react-native-skills`, `expo-tailwind-setup` |

> **Tip:** Manually load skills with `load_skills=["skill-name", ...]` in your prompt.

---

## 🛠️ Specialized Skills (26)

### 📋 Planning & Documentation
1. **`project-planner`** — Scoped plans, task breakdowns, risk assessment.
2. **`writing-plans`** — Structured docs: PRDs, specs, requirements.
3. **`doc-coauthoring`** — Writing assistance, co-authoring any document.
4. **`internal-comms`** — Changelogs, announcements, status updates.

### 🎨 Design & Brand
5. **`ui-ux-pro-max`** — Design intelligence and aesthetic polish.
6. **`frontend-design`** — Frontend architecture and component design.
7. **`brand-guidelines`** — Brand identity, colors, typography consistency.
8. **`extract-design-system`** — Extract design tokens and components.
9. **`sleek-design-mobile-apps`** — Mobile-specific design polish.

### 📱 React Native & Expo
10. **`react-native-skills`** — Core RN/Expo best practices.
11. **`vercel-react-native-skills`** — RN patterns from Vercel Labs (high signal).
12. **`building-native-ui`** — Native UI components, official Expo skill.
13. **`native-data-fetching`** — Data fetching, React Query, offline patterns.
14. **`expo-tailwind-setup`** — NativeWind/Tailwind in Expo (your exact stack).
15. **`upgrading-expo`** — Expo SDK upgrades, migration guides.

### 🔷 TypeScript
16. **`typescript-advanced-types`** — Advanced type patterns and generics.

### 🗄️ Backend & Database
17. **`supabase`** — Official Supabase skill: auth, storage, realtime.
18. **`supabase-postgres-best-practices`** — Advanced Postgres: RLS, schema, performance.

### ✅ Code Quality & Engineering
19. **`code-reviewer`** — Bug detection and best practice enforcement.
20. **`refactor-engineer`** — Code reuse and cleanup.
21. **`systematic-debugging`** — Structured root-cause analysis.
22. **`verification-before-completion`** — Verify output before marking done.
23. **`finishing-a-development-branch`** — Clean branch/PR lifecycle.

### 🤖 Agent Infrastructure
24. **`context7-mcp`** — Real-time library/framework docs via MCP.
25. **`skill-creator`** — Build and manage new agent skills.

> Note: `react-native-skills`, `project-planner`, `code-reviewer`, `refactor-engineer`, `context7-mcp` are custom/unlisted skills — not on skills.sh leaderboard but actively used.

---

## 🔌 MCP Tools

- **Supabase MCP** — Direct database access, schema verification.
- **Context7** — Fetches current docs for any library (React, Expo, Supabase, etc.).
- **StitchMCP** — Design system generation.
- **Notion** — Project management & documentation sync.

---

## 📘 Developer Resources

### Adding a New Skill
Create `.agents/skills/<name>/SKILL.md` with YAML frontmatter:
```yaml
---
name: skill-name
description: Brief summary.
---
```

### Project Commands
- `npm run start` — Expo dev server
- `npm run lint` — `expo lint`
- `npm run ios` / `npm run android` — Device builds
- `npm ci` — Clean install

---

## 📜 Source of Truth
1. `SYSTEM_CONTEXT.md` — Primary operating rules
2. `AGENTS.md` — Canonical terms & product scope
3. `.agents/orchestration.md` — Agent pipeline rules
