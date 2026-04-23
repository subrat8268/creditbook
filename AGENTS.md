# Agent Notes (KredBook)

If any repo instruction conflicts, `SYSTEM_CONTEXT.md` wins.

## Non-negotiables

- Canonical product nouns: Customer / Entry / Payment. Screens: Dashboard / People / Entries / Profile.
- Legacy/transitional terms exist in code (ex: `order`, `party`); label them `legacy`/`transitional` if you must mention them.
- Design tokens: `src/utils/theme.ts` is source of truth (Tailwind/NativeWind derives from it via `tailwind.config.js`).
- Database/schema: don't guess; use Supabase MCP and put DDL in `supabase/migrations/`.

## How To Run

- Package manager is npm (repo has `package-lock.json`): `npm ci`.
- Dev server: `npm run start`.
- Device builds (generates gitignored `/ios` + `/android`): `npm run ios` / `npm run android`.
- Lint: `npm run lint` (runs `expo lint`).
- Tests: none are currently checked in (no `*.test.*`/`*.spec.*` files and no `test` script).

## Repo Wiring That Bites

- Expo Router entrypoint is `app/_layout.tsx`; it owns the auth/profile/phone/onboarding redirect logic. Be careful when changing login/onboarding flows.
- Offline-first is real: React Query cache persists to MMKV, and Supabase mutations may be wrapped/queued on network failure (`src/services/supabase.ts`, `src/lib/syncQueue.ts`). Don't "fix" errors by removing queue behavior.
- Required runtime env vars (from code): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Optional: `EXPO_PUBLIC_SENTRY_DSN`.
- `.env*` is gitignored; never commit it.
- `.github/` is gitignored in this repo; don't rely on CI workflows being present.

## Toolchain Quirks

- NativeWind is enabled via `global.css` + `tailwind.config.js`; Babel uses `nativewind/babel`.
- `react-native-reanimated/plugin` must stay last in `babel.config.js`.
- Metro is configured for SVG imports as React components (`react-native-svg-transformer`) in `metro.config.js`.

## OpenCode Workflow

- Command-first prompts: `/plan`, `/build`, `/fix`, `/refactor`, `/audit` (reference: `_agents/commands.md`).
- Deterministic pipelines: `_agents/orchestration.md`. Closeout gate for non-trivial changes: `_agents/doc-sync-checklist.md`.

<!-- context7 -->
Use Context7 MCP to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service -- even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot. This includes API syntax, configuration, version migration, library-specific debugging, setup instructions, and CLI tool usage. Use even when you think you know the answer -- your training data may not reflect recent changes. Prefer this over web search for library docs.

Do not use for: refactoring, writing scripts from scratch, debugging business logic, code review, or general programming concepts.

## Steps

1. Always start with `resolve-library-id` using the library name and the user's question, unless the user provides an exact library ID in `/org/project` format
2. Pick the best match (ID format: `/org/project`) by: exact name match, description relevance, code snippet count, source reputation (High/Medium preferred), and benchmark score (higher is better). If results don't look right, try alternate names or queries (e.g., "next.js" not "nextjs", or rephrase the question). Use version-specific IDs when the user mentions a version
3. `query-docs` with the selected library ID and the user's full question (not single words)
4. Answer using the fetched docs
<!-- context7 -->
