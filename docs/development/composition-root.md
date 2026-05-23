# Composition root (`createApp`)

`createApp()` in `src/app/create-app.ts` is the **only** place that wires middleware, system routes, and example domains. It is **async** (database connect + schema bootstrap).

## Injectable options

| Option                             | Purpose                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| `settings`                         | Override `AppSettings` (tests use `loadAppSettings({ NENE2_NODE_APP_ENV: 'test', ... })`)         |
| `healthChecks`                     | Extra `HealthCheck` probes (database added automatically when DB URL set)                         |
| `machineApiKey`                    | Override API key for `/machine/health`                                                            |
| `tokenVerifier`                    | Custom `TokenVerifier` (default: `LocalBearerTokenVerifier`; production: `createJoseJwtVerifier`) |
| `domainHandlers`                   | Additional `DomainExceptionHandler` instances (defaults include 422/409/403 since v0.1.20)        |
| `noteRepository` / `tagRepository` | Swap in-memory vs SQLite vs test doubles                                                          |
| `bearerIncludePaths`               | Extra path prefixes for Bearer middleware (e.g. `/orders`)                                        |
| `includeExamples`                  | Register `/examples/*` routes (default from `NENE2_NODE_INCLUDE_EXAMPLES` / env)                  |

## Test pattern

```typescript
const { app } = await createApp({
  settings: loadAppSettings({ NENE2_NODE_APP_ENV: 'test' }),
  noteRepository: new InMemoryNoteRepository(),
});
```

Do not construct `Hono` and middleware manually in app code — extend `createApp` or options instead.

## Health checks

Pass `healthChecks: [myCheck, ...]` — merged with auto-registered `database` check when `NENE2_NODE_DATABASE_URL` is set. `buildHealthResponse()` returns **503** when any check reports `error`.

## Returns

`Nene2App`:

| Field       | Purpose                                                                        |
| ----------- | ------------------------------------------------------------------------------ |
| `app`       | Configured `Hono` instance                                                     |
| `settings`  | Resolved `AppSettings`                                                         |
| `problems`  | `ProblemDetailsFactory` for custom route registrars                            |
| `database?` | `{ executor, readExecutor?, backend, transactionManager? }` when URL set       |
| `shutdown?` | Close pools — call from production entrypoint with `registerProcessShutdown()` |

## References

- `middleware-pipeline.md`
- `environment-variables.md`
- `commercial-readiness.md`
