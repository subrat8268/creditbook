# Creditbook Copilot Instructions

System-wide guidelines, patterns, and best practices for Copilot in the creditbook project.

## 📋 Project Context

**Project**: Creditbook - A React Native business management app for small enterprises
**Stack**: React Native, Next.js, TypeScript, Supabase, TailwindCSS, Expo
**Platforms**: iOS, Android, Web

The app helps businesses manage customers, orders, products, and suppliers with offline-first capabilities.

## 🎯 Core Principles

1. **Type Safety First** - Use TypeScript strictly, avoid `any` types
2. **Offline-First** - Design features to work without network connectivity
3. **Accessible Design** - Follow WCAG guidelines, test on multiple screen sizes
4. **Security by Default** - Implement RLS policies, validate inputs, protect user data
5. **Testing as Foundation** - Test-driven development with 80%+ coverage
6. **Performance Matters** - Monitor bundle size, optimize rendering, cache efficiently

## 📁 Project Structure

```
app/                      # Next.js/Expo router (App Router)
  (auth)/                 # Authentication routes
  (main)/                 # Main app routes
  l/                      # Link handling

src/
  api/                    # API client functions
  components/             # Reusable UI components
  hooks/                  # Custom React hooks
  i18n/                   # Internationalization
  lib/                    # Utilities & helpers
  services/               # External service integrations (Supabase, Sentry)
  store/                  # Zustand state management
  types/                  # TypeScript type definitions
  utils/                  # Helper functions

supabase/
  migrations/             # Database migrations
```

## 🔧 Tech Stack Guidelines

### Frontend (React Native)

- Component: Functional components with hooks-first approach
- State: Zustand for global state, React Context for local
- Styling: TailwindCSS + NativeWind for style consistency
- Forms: Use controlled components with proper validation
- Async: Suspend errors with error boundaries, use error.tsx routes

### Backend (Supabase)

- Database: PostgreSQL with Row-Level Security (RLS)
- Auth: Supabase Auth with JWT tokens
- Real-time: Leverage Supabase subscriptions for live data
- Storage: Use Supabase Object Storage for files
- Edge Functions: Deploy serverless functions when needed

### Testing

- Unit: Jest for logic testing
- Component: React Testing Library for UI components
- E2E: Playwright for critical user flows
- Target: 80%+ coverage on business logic

## 🚀 When to Route to Specialists

Use `/plan` command or mention specific agents:

| Need                        | Agent                             | Command             |
| --------------------------- | --------------------------------- | ------------------- |
| Multi-step feature planning | `/builder` or `@builder`          | `/plan`             |
| React Native implementation | `@mobile-dev`                     | -                   |
| Component & UX design       | `@ui-ux-master`                   | -                   |
| Testing & verification      | `@qa-and-testing`                 | `/tdd` or `/verify` |
| Code quality & review       | `@code-reviewer`                  | `/code-review`      |
| Security audit              | `@security-engineer`              | `/security`         |
| Backend/Database            | `@backend-patterns` + `@supabase` | -                   |
| Performance tuning          | `@performance-agent`              | -                   |
| Architecture decisions      | `@tech-lead`                      | -                   |

## 📝 Code Style

### Naming Conventions

- Components: `PascalCase` (e.g., `CustomerCard`)
- Hooks: `camelCase` with `use` prefix (e.g., `useCustomers`)
- Utils: `camelCase` (e.g., `formatCurrency`)
- Types: `PascalCase` (e.g., `Customer`, `OrderStatus`)
- Constants: `UPPER_CASE` (e.g., `MAX_RETRY_COUNT`)

### TypeScript Patterns

```typescript
// ✅ Use explicit types
interface Customer {
  id: string;
  name: string;
  email: string | null;
  createdAt: Date;
}

// ✅ Use type guards
function isCustomer(obj: unknown): obj is Customer {
  return typeof obj === "object" && obj !== null && "id" in obj;
}

// ✅ Use discriminated unions
type Result<T> = { success: true; data: T } | { success: false; error: string };
```

### React Patterns

```typescript
// ✅ Functional components with hooks
export function UserCard({ user }: { user: User }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return <div>...</div>;
}

// ✅ Use proper error boundaries
<ErrorBoundary fallback={<ErrorUI />}>
  <Component />
</ErrorBoundary>
```

## 🔐 Security Guidelines

1. **RLS Policies** - Always define Row-Level Security policies for sensitive data
2. **Input Validation** - Validate all user inputs on client and server
3. **Secrets** - Use environment variables, never commit secrets
4. **Auth Flows** - Use Supabase Auth for authentication, validate JWTs
5. **API Routes** - Secure with auth checks and input validation
6. **Storage** - Implement access controls for uploaded files

## 🧪 Testing Strategy

### Unit Tests

- Logic functions and utilities
- Hook behavior in isolation
- Type definitions

### Component Tests

- User interactions (clicks, inputs)
- Conditional rendering
- Props validation

### Integration Tests

- API interactions
- State updates across components
- Navigation flows

### E2E Tests

- Critical user journeys
- Authentication flows
- Data persistence

## 📱 Mobile-Specific Guidelines

1. **Screen Sizes** - Test on small (iPhone SE), medium (iPhone 12), large (iPad)
2. **Safe Area** - Use `useSafeAreaInsets()` for notch/home indicator handling
3. **Touch Targets** - Ensure minimum 44x44pt touch targets
4. **Network** - Handle slow/offline scenarios gracefully
5. **Performance** - Keep animations at 60fps, optimize image loading

## 🌐 Web-Specific Guidelines

1. **Responsive** - Mobile-first approach, test on 375px+
2. **Keyboard** - Full keyboard navigation support
3. **Accessibility** - ARIA labels, semantic HTML
4. **SEO** - Proper title/meta tags for indexing

## 📊 Performance Targets

- Mobile bundle: < 500KB gzipped
- Web Time to Interactive: < 3s on 4G
- Lighthouse: 80+ for Performance, Accessibility
- Image loading: < 2s for critical images

## 🚧 Common Patterns

### Error Handling

```typescript
try {
  const data = await fetchData();
} catch (error) {
  if (error instanceof NetworkError) {
    // Handle offline
  } else if (error instanceof ValidationError) {
    // Handle validation
  }
}
```

### State Management

Use Zustand for global state that needs persistence or cross-component access.

### Data Fetching

Use React Query/SWR for caching, background updates, and retry logic.

## 🔄 Git Workflow

1. Create feature branch: `feature/description`
2. Commit with conventional commits: `feat:`, `fix:`, `refactor:`
3. Create PR with clear description
4. Pass all checks: tests, linting, type checks
5. Get review before merging to main

## 📚 Resources

- **Docs**: See `/docs` folder for architecture and design system
- **Design System**: [design-system.md](../docs/design-system.md)
- **Architecture**: [ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- **Status**: [STATUS.md](../docs/STATUS.md)

---

## Quick Commands

```bash
# Development
npm run dev               # Start dev server
npm run dev:ios          # Start iOS simulator
npm run dev:android      # Start Android emulator
npm run dev:web          # Start web version

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Quality
npm run lint             # Run ESLint
npm run type-check       # Check types
npm run format           # Format code

# Build
npm run build            # Build for production
npm run build:ios        # Build iOS app
npm run build:android    # Build Android app
npm run build:web        # Build web version
```
