# Package exports (`src/index.ts`)

Published surface: `@hideyukimori/nene2-framework` — **framework primitives only**.

## Included

- `createApp`, `loadAppSettings`, health helpers
- Problem Details factory + `resolveHttpError`
- Domain error helpers (`DomainError`, `createSimpleDomainHandler`)
- Validation types (`ValidationError`, `ValidationException`)
- Auth middleware + `LocalBearerTokenVerifier`
- Database ports + SQLite adapters
- MCP `FetchMcpHttpClient`
- OpenAPI path helpers

## Not exported (intentional)

- `src/example/*` — reference domains; copy patterns into your app
- `src/server/dev-server.ts` — use `npm run dev` in this repo only
- Internal middleware not re-exported unless listed in `index.ts`

## Adding exports

1. Needs a GitHub Issue (public API change).
2. Export from `src/index.ts` and rebuild `dist/`.
3. Document in CHANGELOG; consider ADR for breaking changes.

## References

- `docs/scope.md` — example code is not stability-guaranteed
