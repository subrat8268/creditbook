# KredBook

<div align="center">

**A simple digital khata** — Credit tracking app for Indian small businesses

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.73+-61DAFB.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-Latest-000020.svg)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E.svg)](https://supabase.com/)

</div>

---

## What is KredBook?

**KredBook is a simple digital khata** — replaces physical notebook for small businesses.

### Core Features (v3.0)

- **People** — Add customers (not suppliers)
- **Entries** — Record what they owe (not product catalog)
- **Payments** — Track what they paid
- **Dashboard** — See total outstanding at a glance
- **Offline-first** — Works without internet

### What's NOT in Scope

- Suppliers (removed)
- Product catalog (removed)
- Reports/Dashboards (simplified)
- GST calculations
- Multi-user

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo |
| Routing | Expo Router |
| Styling | TailwindCSS + NativeWind |
| State | Zustand |
| Server State | TanStack Query |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Offline | MMKV |
| AI System | OpenCode + oh-my-openagent |

---

## AI Development System

### Skills (12 installed)

Skills are loaded automatically based on task context. See `_agents/skills/README.md` for full list.

#### Frontend Skills

| Skill | Purpose |
|-------|---------|
| `ui-designer` | UI components, visual design |
| `code-reviewer` | Bug detection, quality |
| `mobile-patterns` | React Native / Expo |
| `debugger` | Issue fixing |
| `refactor-engineer` | Code cleanup |

#### Backend/Planning Skills

| Skill | Purpose |
|-------|---------|
| `supabase-expert` | Database, migrations |
| `project-planner` | Task breakdown |
| `tech-lead` | Architecture decisions |
| `thinker` | Complex reasoning |

### Workflow

```
User Request
    ↓
Project Planner → break into tasks
    ↓
Tech Lead → validate approach
    ↓
Implementation → write code
    ↓
Code Reviewer → detect issues
    ↓
Refactor Engineer → improve structure
    ↓
Auditor → check overall quality
```

---

## Project Structure

```
kredBook/
├── app/                    # Expo Router (5 tabs only now)
│   ├── (auth)/           # Auth screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   └── (main)/          # Main app
│       ├── dashboard/    # Home tab
│       ├── people/      # People/Customers tab
│       ├── entries/     # Entries tab + create + [id]
│       ├── profile/     # Profile tab + export + sign out
│       └── new-entry.tsx
├── src/
│   ├── api/            # API clients
│   ├── components/     # Reusable components
│   ├── hooks/         # TanStack Query hooks
│   ├── store/         # Zustand stores
│   ├── services/     # Supabase client
│   ├── types/        # TypeScript types
│   └── utils/        # Theme, helpers
├── docs/
│   ├── prd.md           # Product requirements (v3.0)
│   ├── ARCHITECTURE.md   # System design
│   ├── design-system.md # UI guidelines
│   └── STATUS.md       # Current implementation
├── _agents/
│   └── skills/        # AI skills
└── .cursorrules       # AI behavior rules
```

---

## Development

### Quick Commands

```bash
# Start
npm start          # Expo
npm run dev        # With dev server

# Quality
npm run lint       # ESLint
npm run type-check # TypeScript

# Build
npx expo export  # Web
```

### Using AI Assistance

Simply describe what you need:

```
"Use reviewer to fix UI bug"
"Use planner + tech-lead to build feature"
"Use backend to add new API"
```

AI will automatically load the appropriate skills.

---

## Documentation

| Document | Purpose |
|----------|---------|
| `docs/prd.md` | What the product is (v3.0 - simplified) |
| `docs/ARCHITECTURE.md` | System design |
| `docs/design-system.md` | UI colors, spacing, components |
| `docs/STATUS.md` | Current implementation status |
| `_agents/skills/README.md` | AI skill system |
| `.cursorrules` | AI behavior rules |

---

## Code Standards

- **TypeScript** (strict mode)
- **Functional components** with hooks only
- **Zustand** for global state, **TanStack Query** for server state
- **TailwindCSS** for styling (no hardcoded colors)
- **lucide-react-native** for icons
- **Colors from theme.ts** (never hardcoded)

---

## Anti-Patterns

**Never do:**
- ❌ `as any` type casting
- ❌ `@ts-ignore` or `@ts-expect-error`
- ❌ Hardcoded colors (use theme)
- ❌ Class components
- ❌ Empty catch blocks

---

## Key Changes (v3.0 Simplified)

| Before | After |
|--------|-------|
| 7 tabs | 5 tabs |
| Suppliers | Removed |
| Products | Removed |
| /orders route | /entries only |
| More sheet | Merged into Profile |

---

<div align="center">

**Simple digital khata — For Indian small businesses**

</div>