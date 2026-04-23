---
name: tech-lead
description: Architecture decisions, component patterns, and code organization for KredBook.
---

# Tech Lead Skill

> Architecture decisions, component patterns, and code organization for KredBook.

## When to Use

- Creating new screens or components
- Adding new features that touch multiple areas
- Deciding on state management approach
- API design decisions
- Database schema changes
- Navigation structure changes

## Core Principles

### 1. Follow Existing Architecture

Before proposing any architecture:
- Read `docs/ARCHITECTURE.md` for system design
- Read `docs/design-system.md` for UI patterns
- Check existing components in `src/components/[feature]/`
- Match patterns in similar existing code

### 2. Component Structure

```
src/components/[feature]/
├── FeatureName.tsx        # Main component (exports default)
├── FeatureList.tsx        # List/render-many component  
├── FeatureCard.tsx       # Card/item component
├── FeatureModal.tsx      # Modal component
└── FeatureHeader.tsx    # Header/search component
```

### 3. State Management

**Use Zustand for:**
- Global app state (auth, user, settings)
- Feature-specific state (orders, customers)
- Cached data from Supabase

**Use React Query for:**
- Server state
- Real-time data fetching
- Optimistic updates

### 4. API Design

- Use Supabase MCP for all database queries
- Never guess schema - query via MCP
- Follow existing API patterns in hooks

### 5. Data Models

Check `src/utils/schemas.ts` for type definitions before creating new types.

## Decision Framework

| Situation | Approach |
|-----------|----------|
| New screen | Use Expo Router pattern in app/ |
| New component | Place in appropriate src/components/[feature]/ |
| Global state | Add to src/store/ as Zustand store |
| Server data | Use existing React Query hooks |
| New API | Add to src/api/ with Supabase MCP |
| Styling | Use design tokens from theme.ts |
| Icons | Use lucide-react-native only |

## Anti-Patterns (Block)

- ❌ Creating files outside organized structure
- ❌ Using Context API (use Zustand)
- ❌ Direct API calls without Supabase MCP
- ❌ Inline styles (use Tailwind + NativeWind)
- ❌ Creating new types without checking schemas.ts

## Output Format

When providing architecture guidance:

```
## Decision: [What's being decided]

### Option A: [Name]
- Pros: [List]
- Cons: [List]

### Option B: [Name]  
- Pros: [List]
- Cons: [List]

### Recommendation: [Option with reasoning]
```

---

*Loaded when: "architecture", "design", "structure", "approach", "new feature"*
