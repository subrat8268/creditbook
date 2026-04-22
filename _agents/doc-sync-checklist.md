# Doc Sync Checklist (Short)

Use this checklist before closing any **non-trivial** change.

## Product + naming

- [ ] Language matches `SYSTEM_CONTEXT.md` (Customer / Entry / Payment)
- [ ] Legacy terms are labeled **legacy/transitional** (if present)
- [ ] Out-of-scope features are not described as active

## Architecture + tokens

- [ ] Route/state changes are reflected in relevant docs (if changed)
- [ ] UI uses tokens from `src/utils/theme.ts` (no hardcoded colors)

## Database (if applicable)

- [ ] Schema/RLS decisions were verified with Supabase MCP
- [ ] Migration added under `supabase/migrations/` (if schema changed)

## Verification

- [ ] `lsp_diagnostics` clean for changed files
- [ ] `npm run lint` passes

## Closeout summary

- [ ] Files changed listed + why
- [ ] Risks/edge cases noted
