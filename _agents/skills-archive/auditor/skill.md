# Auditor Skill

> Code auditing, tech debt detection, and health analysis for KredBook.

## When to Use

- Periodic code health checks
- Before major releases
- Identifying cleanup opportunities
- Finding unused code
- Security audits
- Performance audits

## Audit Categories

### 1. Unused Code

**Find:**
- Unused imports (run lint)
- Unused variables
- Dead code paths
- Unused components
- Unused hooks

**Tools:**
- ESLint (no-unused-vars)
- LSP find references
- Grep for usage

### 2. Technical Debt

**Find:**
- TODO/FIXME comments
- Long functions (>100 lines)
- Complex components (>300 lines)
- Repeated patterns
- Missing types

**Tools:**
- AST size analysis
- Comment grep
- Complexity tools

### 3. Security

**Check:**
- Sensitive data in logs
- Hardcoded secrets
- API keys exposed
- Missing auth checks
- Error message leaks

### 4. Performance

**Check:**
- Large bundles
- Missing memoization
- Inefficient lists
- Large images
- Memory leaks

### 5. Accessibility

**Check:**
- Missing labels
- Low contrast
- Touch targets <44pt
- No keyboard navigation

## Audit Report Format

```
## Audit: [Area]

### Issues Found

| Severity | File | Issue | Recommendation |
|----------|------|------|-------------|
| [High] | [File] | [Issue] | [Fix] |

### Recommendations

1. [Priority fix]
2. [Secondary fix]

### Health Score
- [Area]: [X]/10
```

## Common Issues

| Issue | Severity | Fix |
|-------|----------|-----|
| Unused import | Low | Remove |
| Any type | High | Add proper type |
| TODO comment | Medium | Address or track |
| Large component | Medium | Split |
| Missing error handling | High | Add try/catch |
| Hardcoded string | Low | Extract to constants |
| Magic number | Medium | Extract to constant |

## Cleanup Commands

```bash
# Find all TODOs
rg "TODO|FIXME|HACK" --type tsx

# Find all console.log
rg "console\.log" --type tsx

# Find all any types
rg ": any" --type tsx

# Find all any returns
rg "as any" --type tsx

# Find unused exports
# (Use LSP or external tool)
```

## Priority Framework

### Critical (Fix Now)
- Security vulnerabilities
- Data loss risks
- Crash bugs

### High (This Sprint)
- Type safety issues
- Major tech debt
- Performance problems

### Medium (This Month)
- Minor code cleanup
- Documentation
- Test coverage

### Low (Backlog)
- Style improvements
- Minor refactors
- Nice-to-haves

## KredBook Specific

### Check List

- [ ] Uses theme colors (not hardcoded)
- [ ] Uses spacing tokens
- [ ] Status properly colored
- [ ] Amounts are bold + color coded
- [ ] Loading states present
- [ ] Error states present
- [ ] Empty states present

### Migration Items

Track items needing migration:
- Old patterns to replace
- Deprecated APIs
- Breaking changes to prepare for

## Output Format

```
## Audit Report: [Date]

### Summary
- Files checked: [N]
- Issues found: [N]
- Critical: [N]
- High: [N]
- Medium: [N]

### Top Issues
1. [Issue] - [Severity]
2. [Issue] - [Severity]

### Recommendations
1. [Priority action]
2. [Secondary action]
```

---

*Loaded when: "audit", "tech debt", "cleanup", "health", "unused"*
