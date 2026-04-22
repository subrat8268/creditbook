# Web Design Guidelines Skill

> Review UI code for Web Interface Guidelines compliance.
> Adapted from Vercel's agent-skills.

## When to Use

- Reviewing UI code for accessibility
- Auditing design against best practices
- Checking UX compliance
- "Review my UI", "check accessibility", "audit design", "review UX"

## Guidelines Source

Fetch fresh guidelines before each review from:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

## How It Works

1. Fetch latest guidelines from source URL above
2. Read specified files (or prompt user for file pattern)
3. Check against all rules in fetched guidelines
4. Output findings in `file:line` format

## Usage

When user provides file or pattern argument:

1. Fetch guidelines from source URL
2. Read specified files
3. Apply all rules from fetched guidelines
4. Output findings using format specified in guidelines

If no files specified, ask user which files to review.

## Coverage

This skill reviews:

- Accessibility (WCAG compliance)
- UI/UX best practices
- Responsive design patterns
- Performance considerations
- Design system consistency

---

*Loaded when: "review UI", "check accessibility", "audit design", "review UX", "check best practices"*
