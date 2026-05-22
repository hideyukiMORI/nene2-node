# Commercial readiness

This framework is **production-grade material**, not a turnkey product. Treat it as composable infrastructure — correct assembly is the consumer's responsibility.

## Ready for production use

| Area                   | Notes                                                                            |
| ---------------------- | -------------------------------------------------------------------------------- |
| Security baseline      | npm audit discipline, timing-safe compares, CORS `*` rejected, parameterized SQL |
| Errors                 | RFC 9457 Problem Details, no stack traces in production, DB constraint → 409/422 |
| Auth middleware        | Bearer / API key / composite patterns; `TokenVerifier` injection point           |
| Throttle & idempotency | Memory / file / Redis; in-flight dedupe; SHA-256 body fingerprint (v0.1.14+)     |
| Database               | MySQL / Postgres / SQLite, pools, read replica URL, transaction managers         |
| Logging                | Structured JSON, redaction, request-id correlation                               |

## Before go-live — three blockers

### 1. JWT verifier (high)

`LocalBearerTokenVerifier` is **HS256 for local/test only**. Production must inject a library-backed verifier:

```ts
import { createApp, createJoseJwtVerifier } from '@hideyukimori/nene2-framework';

const tokenVerifier = await createJoseJwtVerifier({
  jwksUri: 'https://your-idp.example/.well-known/jwks.json',
  issuer: 'https://your-idp.example/',
  audience: 'your-api',
});

const { app, shutdown } = await createApp({ tokenVerifier });
```

Requires optional peer: `npm install jose`.

### 2. Semver 0.x (medium)

Public API is still forming (`docs/scope.md`). Pin exact versions in consumer `package.json` and review CHANGELOG on upgrade.

### 3. Example routes (medium)

`createApp()` registers reference `/examples/*` routes by default in **non-production** environments. For production APIs:

```bash
NENE2_NODE_INCLUDE_EXAMPLES=false
```

Or:

```ts
await createApp({ includeExamples: false, tokenVerifier, ... });
```

Register your own routes on `app` with app-owned repositories using `database.executor`.

## Recommended production conditions

1. `NENE2_NODE_APP_ENV=production`, `NENE2_NODE_APP_DEBUG=false`
2. `createJoseJwtVerifier` (or custom `TokenVerifier`) — not `NENE2_LOCAL_JWT_SECRET`
3. `NENE2_NODE_INCLUDE_EXAMPLES=false`
4. Pin `@hideyukimori/nene2-framework` version; upgrade deliberately
5. Horizontal scale: Redis throttle/idempotency or edge rate limits
6. Call `registerProcessShutdown(shutdown)` in your entrypoint (see `dev-server.ts`)

## Acceptable with awareness

| Topic                      | Mitigation                                                    |
| -------------------------- | ------------------------------------------------------------- |
| In-memory throttle         | Redis / edge proxy                                            |
| No auto read/write routing | Choose `executor` vs `readExecutor` in repos                  |
| Coverage gate evolving     | `npm run test:coverage` in CI; thresholds rise toward 80%/90% |

## References

- [production-deployment.md](production-deployment.md)
- [composite-auth.md](composite-auth.md)
- [throttle-storage-adapters.md](throttle-storage-adapters.md)
- [docs/scope.md](../scope.md) — versioning policy
