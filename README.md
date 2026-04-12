# Creditbook

<div align="center">

**A comprehensive React Native business management platform for small enterprises in India**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.73+-61DAFB.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-Latest-000020.svg)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Quick Start](#quick-start) • [Architecture](#architecture) • [Development](#development) • [Documentation](#documentation)

</div>

---

## Overview

Creditbook is a mobile-first business management application designed to help small enterprises and traders in India efficiently manage:

- **Customers & Suppliers** - Complete relationship management
- **Orders & Invoices** - Create, track, and manage transactions
- **Product Catalog** - Inventory and SKU management
- **Payments & Credits** - Track financial transactions
- **Offline-First** - Works seamlessly without internet connectivity
- **Real-time Sync** - Automatic data synchronization when online

### Key Features

✅ **Cross-Platform** - iOS, Android, and Web support  
✅ **Offline-First** - Full functionality without network  
✅ **Real-time** - Live data synchronization via Supabase  
✅ **Secure** - Row-level security and encrypted storage  
✅ **Accessible** - WCAG 2.1 compliance  
✅ **Fast** - Optimized performance and bundle size  
✅ **Scalable** - Production-ready architecture  

---

## Prerequisites

- **Node.js** 16+ and npm 8+
- **Expo CLI** - `npm install -g expo-cli`
- **iOS**: Xcode 14+ (macOS only)
- **Android**: Android Studio with SDK 31+
- **Git** - For version control

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-org/creditbook.git
cd creditbook
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Update with your Supabase credentials
```

### 4. Start Development

```bash
npm run dev:web          # Web
npm run dev:ios          # iOS simulator
npm run dev:android      # Android emulator
```

### 5. Run Tests

```bash
npm test                 # All tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────┐
│  React Native App (iOS/Android/Web) │
│  - State: Zustand                   │
│  - Styling: TailwindCSS + NativeWind│
│  - Offline: MMKV + Sync Queue       │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │   Supabase  │
        ├─────────────┤
        │ • PostgreSQL│
        │ • RLS       │
        │ • Auth      │
        │ • Realtime  │
        │ • Storage   │
        └─────────────┘
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React Native / Expo |
| **State Management** | Zustand |
| **Styling** | TailwindCSS + NativeWind |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Supabase Auth |
| **Real-time** | Supabase Realtime |
| **Storage** | Supabase Storage |
| **Offline** | MMKV + Sync Queue |
| **Testing** | Jest + RTL + Playwright |
| **Build** | Expo |

---

## Project Structure

```
creditbook/
├── app/                         # Expo Router
│   ├── (auth)/                 # Auth screens
│   ├── (main)/                 # Main app
│   └── _layout.tsx
├── src/
│   ├── api/                    # API clients
│   ├── components/             # Reusable components
│   ├── hooks/                  # Custom hooks
│   ├── store/                  # Zustand stores
│   ├── types/                  # TypeScript types
│   └── utils/                  # Helpers
├── assets/                     # Icons & images
├── designs/                    # Design mockups
├── docs/                       # Documentation
├── supabase/                   # Migrations
└── .github/                    # GitHub config
    ├── agents/                 # AI agents
    └── instructions/           # Code patterns
```

---

## Development

### Commands

```bash
# Development
npm run dev:web              # Web server
npm run dev:ios              # iOS simulator
npm run dev:android          # Android emulator

# Quality
npm run lint                 # ESLint
npm run type-check          # TypeScript check
npm run format              # Format code
npm run test                # Run tests

# Build
npm run build:web           # Web production
npm run build:ios           # iOS app
npm run build:android       # Android app
```

### Workflow

1. **Create branch**: `git checkout -b feature/xyz`
2. **Write code & tests**: Follow patterns in `.github/instructions/`
3. **Quality checks**: `npm run lint && npm run type-check && npm run test`
4. **Commit**: `git commit -m "feat: description"`
5. **Push & PR**: Submit for review

### Using AI Assistance

Open Copilot Chat (Ctrl+Shift+Alt+I) and use:

```
@builder /plan                 # Feature planning
@mobile-dev help with...       # Implementation
@qa-and-testing /tdd           # Test strategy
@code-reviewer /code-review    # Code quality
```

See `.github/README.md` for complete guide.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [`.github/README.md`](./.github/README.md) | AI agent setup & usage |
| [`.github/AGENTS.md`](./.github/AGENTS.md) | Agent catalog |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | System design |
| [`docs/design-system.md`](./docs/design-system.md) | UI guidelines |
| [`docs/prd.md`](./docs/prd.md) | Product specs |
| [`copilot-instructions.md`](./copilot-instructions.md) | Workspace guidelines |

### Code Patterns

- [React Components](./.github/instructions/react-native-components.instructions.md)
- [State Management](./.github/instructions/zustand-patterns.instructions.md)
- [API Integration](./.github/instructions/api-patterns.instructions.md)

---

## Contributing

### Code Standards

- **Language**: TypeScript (strict mode)
- **Components**: Functional with hooks
- **State**: Zustand for global state
- **Testing**: 80%+ coverage target
- **Naming**: Clear, descriptive names
- **Comments**: Complex logic only

### Commit Format

```
feat:     New feature
fix:      Bug fix
refactor: Code refactoring
perf:     Performance improvement
test:     Test updates
docs:     Documentation
```

---

## Support

- **Docs**: Check `docs/` and `.github/`
- **Issues**: Search GitHub
- **Questions**: Use Discussions
- **AI Help**: Copilot agents in Chat

---

## License

MIT - See LICENSE file

---

<div align="center">

**Built with ❤️ for Indian small businesses**

</div>
