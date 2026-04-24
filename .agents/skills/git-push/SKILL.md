---
name: git-push
description: Review-first workflow to prepare a clean commit message and push safely.
---

# Git Push Skill

> Review-first workflow to prepare a clean commit message and push safely.

## When to Use

- After implementation is complete and verified
- When the user explicitly asks to commit and push
- When you need a clean closeout with a strong commit message

## Core Workflow

1. Run a quality gate using `code-reviewer` rules
2. Check git context: `git status`, `git diff`, and recent commit style (`git log`)
3. Draft a commit message that explains the why, not just the what
4. Stage only in-scope files (never stage unrelated changes)
5. Commit
6. Push the current branch to remote

## Commit Message Rules

- Keep it concise and specific
- Match existing repository style
- Prefer intent-oriented prefixes: `add`, `update`, `fix`, `refactor`, `docs`, `chore`
- Include 1-2 lines focused on user/business impact

## Safety Rules

- Never commit secrets (`.env*`, credentials, tokens)
- Never use destructive git commands
- Never force-push to `main`/`master`
- Do not amend commits unless the user explicitly asks
- If code review finds critical or high issues, fix before committing

## Output Template

```text
Review status: [pass/fail]
Commit message: [final message]
Pushed to: [remote/branch]
Notes: [key risks or follow-ups]
```

---

*Loaded when: "git push", "commit and push", "ship changes", "publish branch"*
