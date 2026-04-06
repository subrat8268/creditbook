---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or when juggling multiple tasks
---

# Using Git Worktrees

## Overview

Git worktrees create isolated workspaces sharing the same repository, allowing work on multiple branches simultaneously without switching.

**Core principle:** Isolated workspace = clean context = fewer mistakes.

## When to Use

- Starting work on new feature while current branch has uncommitted changes
- Juggling 2+ features/bugs simultaneously
- Testing on multiple branches at once
- Pairing on different branches

**NOT needed when:**

- Single task, no interruptions
- Can commit/stash current work easily

## Quick Setup

### 1. Identify Base Directory

```bash
# Check if preferred directory exists
if [ -d ".worktrees" ]; then
  WORKTREE_DIR=".worktrees"
elif [ -d "worktrees" ]; then
  WORKTREE_DIR="worktrees"
else
  WORKTREE_DIR=".worktrees"  # Create this
fi
```

### 2. Create Worktree

```bash
# Create directory if needed
mkdir -p "$WORKTREE_DIR"

# Add to .gitignore if it's project-local
if [ "$WORKTREE_DIR" != "$HOME"/* ]; then
  grep -q "^$WORKTREE_DIR$" .gitignore || echo "$WORKTREE_DIR" >> .gitignore
  git add .gitignore
  git commit -m "Add worktree directory to gitignore"
fi

# Create worktree with new branch
git worktree add "$WORKTREE_DIR/feature-name" -b "feature/feature-name"
cd "$WORKTREE_DIR/feature-name"
```

### 3. Setup Project

Auto-run initial setup:

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi
```

### 4. Verify Clean Baseline

```bash
# Run tests to ensure worktree starts clean
npm test          # or pytest, cargo test, go test ./..., etc.
```

**If tests fail:**

- Report failures
- Ask whether to proceed or investigate

**If tests pass:**

- Ready to implement feature

### 5. Report Location

```
Worktree ready at: [path]
Tests passing: [N] tests, 0 failures
Ready to implement [feature]
```

## Using Multiple Worktrees

### Switch Between Worktrees

```bash
# From main repo, list worktrees
git worktree list

# Output:
# /path/to/repo                   abcdef1 [main]
# /path/to/repo/.worktrees/feature-a  1a2b3c4 [feature/feature-a]
# /path/to/repo/.worktrees/feature-b  5d6e7f8 [feature/feature-b]

# Switch to worktree
cd .worktrees/feature-a

# Work on
[implement feature]

# Switch back to main
cd ../..

# Switch to another worktree
cd .worktrees/feature-b
```

## Cleanup

### After Feature is Merged

```bash
# From main repo (NOT from worktree)
git worktree remove .worktrees/feature-a

# Or force remove if worktree is corrupted
git worktree remove --force .worktrees/feature-a

# Verify cleaned up
git worktree list
```

## Common Scenarios

### Scenario 1: New Feature While Fixing Bug

```
Main repo: On main (uncommitted work)
Task: Start new feature in isolation

1. git worktree add .worktrees/feature-new -b feature/new
   cd .worktrees/feature-new
   [implement feature]

2. From main repo:
   git worktree add .worktrees/bugfix-urgent -b bugfix/urgent
   cd .worktrees/bugfix-urgent
   [fix bug, commit, push]

3. Merge bug fix
   cd ../..
   git pull

4. Back to feature
   cd .worktrees/feature-new
   [continue feature]

5. Cleanup
   cd ../..
   git worktree remove .worktrees/bugfix-urgent
```

### Scenario 2: Testing Multiple Branches

```
Main repo: current branch
Task: Test feature on main, test on previous version

1. git worktree add .worktrees/test-main -b main
   cd .worktrees/test-main
   npm install && npm test

2. From main:
   git worktree add .worktrees/test-v1 main~20
   cd .worktrees/test-v1
   npm install && npm test

3. Compare results both worktrees
```

## Red Flags

- ❌ Forgetting which worktree you're in
- ❌ Confusing file edits across worktrees
- ❌ Not committing changes before switching
- ❌ Editing same files in multiple worktrees (merge conflicts)

**Solution:** Use branch names that match directory names:

```bash
# Do this:
git worktree add .worktrees/feature-auth -b feature/auth

# Not this:
git worktree add .worktrees/feature1 -b bugfix/something-else
```

## Workflow Integration

**TDD Feature in Worktree:**

```bash
git worktree add .worktrees/feature-export -b feature/customer-export
cd .worktrees/feature-export

# TDD cycle
npm test -- --watch

# Make failing test
npm test
# RED: test fails

npm run build
# Add minimal code
# GREEN: test passes

# Refactor
npm test
# Verify still green

# Before committing
copilot:verify
# Check everything

git add .
git commit -m "feat: customer export"
```

## Advantages Over Branch Switching

| Activity             | Branch Switch    | Worktree         |
| -------------------- | ---------------- | ---------------- |
| Node modules install | Every time ✗     | Once ✓           |
| Build cache          | Lost ✗           | Cached ✓         |
| Running tests        | Restart needed ✗ | Instant switch ✓ |
| Uncommitted work     | Stash/pop ✗      | Coexist ✓        |
| Mental context       | Rebuild ✗        | Already there ✓  |

## Summary

Git worktrees let you:

- ✓ Work on multiple features without switching
- ✓ Keep uncommitted work safe
- ✓ Avoid repeated npm install, builds
- ✓ Maintain mental context per branch
- ✓ Test on multiple branches simultaneously

Use them whenever juggling multiple tasks.
