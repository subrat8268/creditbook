---
name: ui-designer
description: Apply the KredBook design system with **zero token drift**.
---

# UI Designer Skill (Token-first)

> Apply the KredBook design system with **zero token drift**.

## Source of truth

1) **Tokens:** `src/utils/theme.ts` (always wins)
2) **Docs:** `docs/design-system.md` (must match tokens)

If any doc or skill contradicts `theme.ts`, update the doc/skill to match `theme.ts`.

## When to use

- building or changing UI screens/components
- fixing visual inconsistencies
- adding loading/empty/error states

## Rules

- No hardcoded colors if a token exists.
- Prefer existing UI primitives in `src/components/ui/` before creating new components.
- Always implement:
  - loading state
  - empty state (lists)
  - error state (network)

## Quick checklist

- [ ] Colors come from `theme.ts` (semantic tokens)
- [ ] Spacing uses tokenized values / existing patterns
- [ ] Financial amounts are visually prominent and readable
- [ ] Touch targets are usable (â‰ˆ44pt min)
- [ ] Icons use `lucide-react-native`

---

*Loaded when: "UI", "design", "visual", "component", "screen", "mockup"*
