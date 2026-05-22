# Production deployment checklist

Use this checklist when moving from `npm run dev` / tests to a real Node deployment. Complements `middleware-pipeline.md` and `environment-variables.md`.

## Before go-live

| Area                | Check                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| **Environment**     | `NENE2_NODE_APP_ENV=production`, `NENE2_NODE_APP_DEBUG=false`                                      |
| **Secrets**         | `NENE2_MACHINE_API_KEY` and `NENE2_LOCAL_JWT_SECRET` from a secret store — never in git            |
| **CORS**            | `NENE2_NODE_CORS_ORIGINS` is an explicit comma-separated list — no `*`                             |
| **Throttle**        | `NENE2_NODE_THROTTLE_LIMIT` set; plan Redis or edge rate limit (in-memory is single-process only)  |
| **Body size**       | `NENE2_NODE_REQUEST_MAX_BODY_BYTES` matches largest OpenAPI request body                           |
| **Database**        | `NENE2_NODE_DATABASE_URL` points to persistent SQLite file or future adapter; health check enabled |
| **Examples**        | `NENE2_NODE_INCLUDE_EXAMPLES=false` in production (see `commercial-readiness.md`)                  |
| **JWT**             | Inject `createJoseJwtVerifier` via `createApp({ tokenVerifier })` — not `NENE2_LOCAL_JWT_SECRET`   |
| **Shutdown**        | `registerProcessShutdown(shutdown)` in production entrypoint                                       |
| **Logging**         | `NENE2_NODE_REQUEST_LOGGING=true`; ship JSON logs to your aggregator; tune exclude paths           |
| **Problem Details** | `PROBLEM_DETAILS_BASE_URL` matches your public problem URI namespace                               |

## Middleware order

Do **not** reorder `app.use` in a forked `createApp()` without re-reading `middleware-pipeline.md`. Authentication and size limits depend on position.

## Throttle storage

Default `InMemoryRateLimitStorage` is correct for:

- Local development
- Vitest
- Single-process demos

For horizontal scale, inject a shared store implementing `RateLimitStorage` (see `src/middleware/rate-limit-storage.ts`) or terminate rate limits at a reverse proxy / API gateway.

## Health endpoints

- `/health` — public; may return **503** when database check fails (degraded).
- `/machine/health` — requires API key; use for orchestrators only.

## References

- `environment-variables.md`
- `commercial-readiness.md`
- `middleware-security.md`
- `docs/field-trials/backlog.md` (FT cadence)
