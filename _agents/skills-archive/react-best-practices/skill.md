# React Best Practices Skill

> React and Next.js performance optimization guidelines from Vercel Engineering.
> Adapted from Vercel's agent-skills with 70 rules across 8 categories.

## When to Use

- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times
- "React", "Next.js", "performance", "optimize", "bundle"

## Rule Categories (Priority Order)

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | Eliminating Waterfalls | CRITICAL |
| 2 | Bundle Size Optimization | CRITICAL |
| 3 | Server-Side Performance | HIGH |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH |
| 5 | Re-render Optimization | MEDIUM |
| 6 | Rendering Performance | MEDIUM |
| 7 | JavaScript Performance | LOW-MEDIUM |
| 8 | Advanced Patterns | LOW |

## Quick Reference

### 1. Eliminating Waterfalls (CRITICAL) - `async-`

| Rule | Description |
|------|-------------|
| `async-cheap-condition-before-await` | Check cheap sync conditions before awaiting flags or remote values |
| `async-defer-await` | Move await into branches where actually used |
| `async-parallel` | Use Promise.all() for independent operations |
| `async-dependencies` | Use better-all for partial dependencies |
| `async-api-routes` | Start promises early, await late in API routes |
| `async-suspense-boundaries` | Use Suspense to stream content |

### 2. Bundle Size Optimization (CRITICAL) - `bundle-`

| Rule | Description |
|------|-------------|
| `bundle-barrel-imports` | Import directly, avoid barrel files |
| `bundle-analyzable-paths` | Prefer statically analyzable import paths |
| `bundle-dynamic-imports` | Use next/dynamic for heavy components |
| `bundle-defer-third-party` | Load analytics/logging after hydration |
| `bundle-conditional` | Load modules only when feature is activated |
| `bundle-preload` | Preload on hover/focus for perceived speed |

### 3. Server-Side Performance (HIGH) - `server-`

| Rule | Description |
|------|-------------|
| `server-auth-actions` | Authenticate server actions like API routes |
| `server-cache-react` | Use React.cache() for per-request deduplication |
| `server-cache-lru` | Use LRU cache for cross-request caching |
| `server-dedup-props` | Avoid duplicate serialization in RSC props |
| `server-hoist-static-io` | Hoist static I/O to module level |
| `server-no-shared-module-state` | Avoid module-level mutable request state |
| `server-serialization` | Minimize data passed to client components |
| `server-parallel-fetching` | Restructure components to parallelize fetches |

### 4. Client-Side Data Fetching (MEDIUM-HIGH) - `client-`

| Rule | Description |
|------|-------------|
| `client-swr-dedup` | Use SWR for automatic request deduplication |
| `client-event-listeners` | Deduplicate global event listeners |
| `client-passive-event-listeners` | Use passive listeners for scroll |
| `client-localstorage-schema` | Version and minimize localStorage data |

### 5. Re-render Optimization (MEDIUM) - `rerender-`

| Rule | Description |
|------|-------------|
| `rerender-defer-reads` | Don't subscribe to state only used in callbacks |
| `rerender-memo` | Extract expensive work into memoized components |
| `rerender-memo-with-default-value` | Hoist default non-primitive props |
| `rerender-dependencies` | Use primitive dependencies in effects |
| `rerender-derived-state` | Subscribe to derived booleans, not raw values |
| `rerender-derived-state-no-effect` | Derive state during render, not effects |
| `rerender-functional-setstate` | Use functional setState for stable callbacks |
| `rerender-lazy-state-init` | Pass function to useState for expensive values |
| `rerender-split-combined-hooks` | Split hooks with independent dependencies |
| `rerender-transitions` | Use startTransition for non-urgent updates |
| `rerender-use-deferred-value` | Defer expensive renders to keep input responsive |
| `rerender-no-inline-components` | Don't define components inside components |

### 6. Rendering Performance (MEDIUM) - `rendering-`

| Rule | Description |
|------|-------------|
| `rendering-animate-svg-wrapper` | Animate div wrapper, not SVG element |
| `rendering-content-visibility` | Use content-visibility for long lists |
| `rendering-hoist-jsx` | Extract static JSX outside components |
| `rendering-svg-precision` | Reduce SVG coordinate precision |
| `rendering-hydration-no-flicker` | Use inline script for client-only data |
| `rendering-conditional-render` | Use ternary, not && for conditionals |

### 7. JavaScript Performance (LOW-MEDIUM) - `js-`

| Rule | Description |
|------|-------------|
| `js-batch-dom-css` | Group CSS changes via classes |
| `js-index-maps` | Build Map for repeated lookups |
| `js-cache-property-access` | Cache object properties in loops |
| `js-cache-function-results` | Cache function results in module-level Map |
| `js-combine-iterations` | Combine multiple filter/map into one loop |
| `js-early-exit` | Return early from functions |
| `js-set-map-lookups` | Use Set/Map for O(1) lookups |

### 8. Advanced Patterns (LOW) - `advanced-`

| Rule | Description |
|------|-------------|
| `advanced-effect-event-deps` | Don't put useEffectEvent results in effect deps |
| `advanced-event-handler-refs` | Store event handlers in refs |
| `advanced-init-once` | Initialize app once per app load |
| `advanced-use-latest` | useLatest for stable callback refs |

## React Native / KredBook Specific

For React Native (not Next.js web), adapt these:

| Vercel Rule | KredBook Adaptation |
|------------|-------------------|
| `bundle-dynamic-imports` | Use `React.lazy` + `Suspense` |
| `bundle-barrel-imports` | Import directly from source, not index |
| `client-swr-dedup` | Use TanStack Query deduplication |
| `rerender-memo` | Use `useMemo` / `useCallback` |
| `server-cache-react` | Use Zustand with middleware |

## Non-Applicable (Web/Next.js Only)

These rules are web-specific, skip for React Native:

- `server-auth-actions` (Server Actions)
- `server-cache-react` (React.cache - RSC)
- `server-dedup-props` (RSC props)
- `server-parallel-fetching` (React Server Components)
- `bundle-dynamic-imports` (next/dynamic)
- `bundle-preload` (Next.js preloading)

---

*Loaded when: "React", "Next.js", "performance", "optimize", "bundle", "refactor"*
