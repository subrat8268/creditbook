# Master Index — GitHub Copilot Superpowers

Welcome to KredBook's comprehensive Copilot AI environment. This index helps you find what you need.

---

## 📋 Where to Start

### 🚀 New to Copilot? (First Time)

1. Read [SETUP.md](SETUP.md) (15 minutes)
2. Bookmark [QUICK_REF.md](QUICK_REF.md) for quick reference
3. Try your first task with `copilot:feature`

### ⏰ In a Hurry? (5 minutes)

1. Open [QUICK_REF.md](QUICK_REF.md)
2. Copy a command from "Common Tasks"
3. Paste into Copilot Chat and go

### 🎓 Learning All Features? (1-2 hours)

1. Read [README.md](README.md) — Overview
2. Read [SETUP.md](SETUP.md) — Installation & configuration
3. Read [QUICK_REF.md](QUICK_REF.md) — Keyboard shortcuts & commands
4. Read instruction guides in `instructions/`
5. Read skill guides in `skills/`

---

## 📚 Documentation Files

### Core Setup

- [README.md](README.md) — Feature overview and impact metrics
- [SETUP.md](SETUP.md) — Installation, configuration, troubleshooting
- [QUICK_REF.md](QUICK_REF.md) — Keyboard shortcuts, command reference
- [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) — Project organization guidance

### Configuration

- [agents.config.json](agents.config.json) — 15 agents + routing rules + command matchers

---

## 🤖 17 Available Agents

### 10 KredBook-Specific Agents

| Agent          | Command                | Best For                       |
| -------------- | ---------------------- | ------------------------------ |
| Documentation  | `copilot:docs`         | Writing guides, specs, README  |
| Architecture   | `copilot:architecture` | System design, database schema |
| Major Features | `copilot:feature`      | Build screens, complex logic   |
| React Native   | Auto (`.tsx` files)    | Components, mobile UI          |
| Backend        | Auto (`src/api/`)      | API development, SQL, Supabase |
| Testing        | `copilot:test`         | Write tests, QA strategy       |
| Security       | `copilot:security`     | Auth, RLS, vulnerability fixes |
| Performance    | Keyword trigger        | Optimization, bundle size      |
| Refactoring    | Keyword trigger        | Code cleanup, migrations       |
| Debugging      | `copilot:debug`        | Bug fixes, error analysis      |

### 5 Advanced Workflow Agents

| Agent                | Command                    | Best For                   | Skill File                               |
| -------------------- | -------------------------- | -------------------------- | ---------------------------------------- |
| TDD                  | `copilot:tdd`              | Test-driven development    | `skills/test-driven-development/`        |
| Systematic Debugging | `copilot:debug-systematic` | 5-step debugging process   | `skills/systematic-debugging/`           |
| Verification         | `copilot:verify`           | Quality gate before commit | `skills/verification-before-completion/` |
| Code Review          | `copilot:review`           | PR description generation  | `skills/requesting-code-review/`         |
| Git Worktree         | `copilot:git-worktree`     | Parallel task management   | `skills/using-git-worktrees/`            |

### 2 Smart Routing Agents (NEW)

| Agent                       | Command(s)                                                    | Best For                            | Skill File                               |
| --------------------------- | ------------------------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| Prompt Analyzer             | `copilot:analyze-prompt`                                      | Auto-route prompts to right skill   | `skills/prompt-analyzer/`                |
| UI Reference Screen Builder | `copilot:ui-reference-screen` or `copilot:screen-from-design` | Generate screens from design images | `skills/ui-reference-screen-generation/` |

---

## 📖 Instruction Guides

Teach Copilot (and you) KredBook conventions:

- [instructions/global.md](instructions/global.md) — Project context, principles, code style
- [instructions/react-native-components.md](instructions/react-native-components.md) — Component patterns
- [instructions/screen-development.md](instructions/screen-development.md) — Screen layout patterns
- [instructions/api-development.md](instructions/api-development.md) — API patterns
- [instructions/database-migrations.md](instructions/database-migrations.md) — Database patterns

---

## 🚀 Skill Guides (Advanced Workflows)

Deep-dive guides for advanced development patterns:

- [skills/test-driven-development/](skills/test-driven-development/) — TDD workflow with Copilot
- [skills/systematic-debugging/](skills/systematic-debugging/) — 5-step debugging process
- [skills/verification-before-completion/](skills/verification-before-completion/) — Quality checklist
- [skills/requesting-code-review/](skills/requesting-code-review/) — PR automation
- [skills/using-git-worktrees/](skills/using-git-worktrees/) — Parallel branch management

---

## 📝 Prompt Templates

Reusable prompts for common tasks:

[prompts/templates.md](prompts/templates.md) has 8+ templates for:

- Feature implementation
- Bug fixing
- Database migration
- Performance optimization
- Testing & QA
- Security audit
- Code review
- Documentation

---

## 🎯 Common Workflows by Task Type

### Building Features (Recommended: TDD)

```
1. copilot:tdd
2. Write failing tests
3. Implement functionality
4. Make tests pass
5. Refactor
6. copilot:verify
7. Commit
```

**Files**: `skills/test-driven-development/SKILL.md`

### Fixing Bugs (Recommended: 5-Step Process)

```
1. copilot:debug-systematic
2. Understand the problem
3. Locate root cause
4. Fix the issue
5. Verify the fix
6. copilot:verify
7. Commit
```

**Files**: `skills/systematic-debugging/SKILL.md`

### Code Quality Gate Before Commit

```
1. Make changes
2. copilot:verify
3. Review checklist
4. Fix any issues
5. Commit
```

**Files**: `skills/verification-before-completion/SKILL.md`

### Creating PR with Great Description

```
1. Complete feature/bugfix
2. copilot:review
3. Review auto-generated description
4. Create PR
```

**Files**: `skills/requesting-code-review/SKILL.md`

### Managing Multiple Tasks

```
1. copilot:git-worktree
2. Setup parallel branches
3. Switch between worktrees
4. Merge when complete
```

**Files**: `skills/using-git-worktrees/SKILL.md`

---

## 🔍 Quick Lookup by Problem

### "I want to build a new feature"

→ Use `copilot:tdd` with `skills/test-driven-development/`

### "I need to fix a bug"

→ Use `copilot:debug-systematic` with `skills/systematic-debugging/`

### "About to commit, want to ensure quality"

→ Use `copilot:verify` with `skills/verification-before-completion/`

### "Creating a PR, need good description"

→ Use `copilot:review` with `skills/requesting-code-review/`

### "Working on 2+ features at once"

→ Use `copilot:git-worktree` with `skills/using-git-worktrees/`

### "Building a new screen"

→ Use `copilot:feature` with `instructions/screen-development.md`

### "Creating an API function"

→ Use `copilot:debug` (auto-routes to Backend) with `instructions/api-development.md`

### "Writing tests"

→ Use `copilot:test` with project-specific patterns

### "Designing system/database"

→ Use `copilot:architecture` with `instructions/database-migrations.md`

### "Writing documentation"

→ Use `copilot:docs` with project README/docs folder

---

## 📊 Expected Impact

**Before**: 40-60% faster feature development
**After**: 50-70% faster with TDD + systematic debugging + verification

**Before**: Manual PR reviews
**After**: Auto-generated PR descriptions + verification checklist

**Before**: Bug fixes via trial-and-error
**After**: 5-step systematic process (2x faster)

---

## 🎓 Learning Path (Team)

### Week 1: Basics

- Install Copilot (15 min)
- Read SETUP.md (30 min)
- Read QUICK_REF.md (20 min)
- Try copilot:feature on simple task (30 min)

### Week 2: New Workflows

- Read skills/test-driven-development/ (1 hr)
- Try copilot:tdd on a feature (2 hrs)
- Read skills/systematic-debugging/ (1 hr)
- Try copilot:debug-systematic on a real bug (2 hrs)

### Week 3: Advanced

- Read skills/verification-before-completion/ (30 min)
- Run copilot:verify before every commit (1 week)
- Try copilot:review for PR generation (1 hr)
- Try copilot:git-worktree for parallel work (1 hr)

### Week 4+: Full Integration

- Use all 5 new commands regularly
- Track productivity gains
- Share learnings with team
- Update instructions if new patterns emerge

---

## 📞 Support

### Copilot Not Responding?

1. Check [SETUP.md](SETUP.md) → Troubleshooting
2. Verify GitHub authentication
3. Reload VS Code

### Wrong Agent Selected?

1. Use explicit command: `copilot:tdd` instead of relying on auto-routing
2. Check [agents.config.json](agents.config.json) routing rules

### Need Help with a Specific Workflow?

1. Jump to "Common Workflows by Task Type" section above
2. Click the linked skill file
3. Follow the detailed guide

---

## 🗂️ File Structure

```
.copilot/
├── README.md                   (Feature overview)
├── SETUP.md                    (Installation guide)
├── QUICK_REF.md                (Quick lookup)
├── FOLDER_STRUCTURE.md         (Project organization)
├── INDEX.md                    (This file)
├── agents.config.json          (15 agents + routing)
│
├── instructions/               (KredBook conventions)
│   ├── global.md
│   ├── react-native-components.md
│   ├── screen-development.md
│   ├── api-development.md
│   └── database-migrations.md
│
├── prompts/                    (Reusable templates)
│   └── templates.md
│
└── skills/                     (Advanced workflows)
    ├── test-driven-development/
    ├── systematic-debugging/
    ├── verification-before-completion/
    ├── requesting-code-review/
    └── using-git-worktrees/
```

---

## 🚀 Next Steps

1. **This minute**: Bookmark this INDEX.md in VS Code sidebar
2. **Next 15 min**: Read [SETUP.md](SETUP.md)
3. **Next 30 min**: Try `copilot:feature` on a simple task
4. **This week**: Try `copilot:tdd` on a real feature
5. **Always**: Use `copilot:verify` before committing

---

**Version**: 1.0  
**Last Updated**: April 7, 2026  
**Status**: Production ready! 🎉

---

💡 **Tip**: Use this INDEX.md as your central hub. Bookmark it in VS Code sidebar for quick access.
