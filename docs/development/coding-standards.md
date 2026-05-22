# Coding Standards

## TypeScript baseline

- **Strict** mode enabled in `tsconfig.json`.
- Prefer `readonly` properties and narrow types over `any`.
- Use explicit exports from package entry points (`src/index.ts` and subpath exports when added).
- Avoid default exports for library public API unless an ADR says otherwise.

## Architecture

- **Clean architecture** — domain and UseCase modules must not import HTTP framework types.
- **OpenAPI-compatible** — public JSON responses match NENE2 OpenAPI schemas for documented endpoints.
- **Problem Details** — use a single factory module; map domain exceptions in handler adapters.
- **Configuration** — read `process.env` only in config/bootstrap modules, not in domain or UseCase code.

## File layout (target)

```text
src/
  http/           # adapters, Problem Details, pagination helpers
  middleware/     # security, auth, throttle, logging
  config/         # typed settings
  database/       # executor, transactions, health
  auth/           # verifiers and middleware wiring
  example/        # Note/Tag reference (not stable public API)
  mcp/            # MCP integration (Phase 5)
tests/
  http/           # request-level tests
  fixtures/       # JSON from OpenAPI examples
```

## Testing

- Use **Vitest** for unit and HTTP-level tests.
- Prefer in-process server calls or handler invocation over flaky port binding in CI.
- Contract tests against pinned OpenAPI fixtures; optional live NENE2 comparison locally.

## Dependencies

- Minimize runtime dependencies; justify each in PR description.
- Pin dev tooling in `package-lock.json`.
- Target active Node.js LTS (`engines` in `package.json`).

## Documentation

- **English** for README, `docs/`, ADRs, and public TSDoc.
- Use TSDoc on **public** exports and non-obvious behavior.
- Do not repeat types already expressed in signatures.
