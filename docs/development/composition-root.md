# Composition root (`createApp`)

`createApp()` in `src/app/create-app.ts` is the **only** place that wires middleware, system routes, and example domains.

## Injectable options

| Option                             | Purpose                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| `settings`                         | Override `AppSettings` (tests use `loadAppSettings({ NODE_ENV: 'test', ... })`) |
| `healthChecks`                     | Extra `HealthCheck` probes (database added automatically when DB URL set)       |
| `machineApiKey`                    | Override API key for `/machine/health`                                          |
| `tokenVerifier`                    | Custom `TokenVerifier` (default: `LocalBearerTokenVerifier` when secret set)    |
| `domainHandlers`                   | Additional `DomainExceptionHandler` instances                                   |
| `noteRepository` / `tagRepository` | Swap in-memory vs SQLite vs test doubles                                        |

## Test pattern

```typescript
const { app } = createApp({
  settings: loadAppSettings({ NENE2_NODE_APP_ENV: 'test' }),
  noteRepository: new InMemoryNoteRepository(),
});
```

Do not construct `Hono` and middleware manually in app code — extend `createApp` or options instead.

## Health checks

Pass `healthChecks: [myCheck, ...]` — merged with auto-registered `database` check when `NENE2_NODE_DATABASE_URL` is set. `buildHealthResponse()` returns **503** when any check reports `error`.

## Returns

`Nene2App`: `{ app, settings, problems }` — pass `problems` into custom route registrars if you add example domains.

## References

- `middleware-pipeline.md`
- `environment-variables.md`
