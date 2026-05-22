# Middleware pipeline (Hono)

Order in `createApp()` — outermost first. **Production:** see [production-deployment.md](production-deployment.md) and [environment-variables.md](environment-variables.md).

### Review checklist (FT#1)

- [ ] New `app.use` matches table order below
- [ ] Example route registrars listed in row 10 when adding domains
- [ ] Env vars documented in `environment-variables.md`

| #   | Middleware             | Notes                                                |
| --- | ---------------------- | ---------------------------------------------------- |
| 1   | `onError` / `notFound` | Problem Details (Hono hooks, not `use`)              |
| 2   | Request id             | `X-Request-Id`                                       |
| 3   | Security headers       | CSP, nosniff, etc.                                   |
| 4   | Request logging        | JSON lines; skippable via settings                   |
| 5   | CORS                   | Explicit `NENE2_NODE_CORS_ORIGINS` only              |
| 6   | Request size limit     | Default 1 MiB                                        |
| 7   | Throttle               | Optional; in-memory store for dev/tests              |
| 8   | API key auth           | `/machine/health`                                    |
| 9   | Bearer token           | `/examples/protected`                                |
| 10  | Routes                 | Handlers + `registerNoteRoutes`, `registerTagRoutes` |

Environment variables: [environment-variables.md](environment-variables.md) (`loadAppSettings` in `src/config/app-settings.ts`).

**Example registrars:** `registerNoteRoutes`, `registerTagRoutes` — add new ones to row 10 when introducing example domains.
