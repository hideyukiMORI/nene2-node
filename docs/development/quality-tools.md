# Quality Tools Policy

Quality checks are explicit, fast, and required before merge. This policy mirrors NENE2 `docs/development/quality-tools.md`, adapted for Node.js.

**Note:** Vitest uses `node:sqlite` on Node 22+. You may see `ExperimentalWarning: SQLite is an experimental feature` in test output (FT#16).

## Dependency audit

Before release PRs, run `npm audit` and address or document critical/high findings (`node-security-practices.md`, FT#53).

## Position

Tools are part of framework design. They must make changes safer without hiding behavior from tests or static analysis.

**Standard direction:**

- **TypeScript:** `tsc --noEmit` with strict compiler options.
- **Lint:** ESLint with `typescript-eslint` strict type-checked rules on `src/`.
- **Format:** Prettier (check in CI, fix locally).
- **Tests:** Vitest for unit and HTTP-level tests.
- **Contract:** OpenAPI validation and response contract tests (Phase 1+).
- **Dependencies:** `npm audit` at high/critical severity before merge (when runtime deps exist).

Do not add a script to `npm run check` until its configuration is committed and verified locally.

## Adopted baseline

| Tool       | Role                                                                             | Command                                 |
| ---------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| TypeScript | Type safety (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | `npm run type-check`                    |
| ESLint     | Lint + type-aware rules on `src/**/*.ts`                                         | `npm run lint`                          |
| Prettier   | Format consistency                                                               | `npm run format` / `npm run format:fix` |
| Vitest     | Unit and HTTP tests                                                              | `npm run test`                          |
| Coverage   | V8 coverage report (thresholds in `vitest.config.ts`)                            | `npm run test:coverage`                 |

Aggregated gate:

```bash
npm run check
```

Equivalent to:

```text
type-check → lint → format → test
```

Coverage is measured separately (`npm run test:coverage`) and enforced in CI with **≥80%** lines/statements (see `vitest.config.ts`). Barrel `src/index.ts` and `dev-server.ts` are excluded from the denominator. MySQL/PostgreSQL integration tests live under `tests/integration/`.

## TypeScript strictness (parity target)

Align with nene2-python `mypy --strict` intent:

| Rule                                             | Enforcement                                                            |
| ------------------------------------------------ | ---------------------------------------------------------------------- |
| No `any` in `src/`                               | ESLint `@typescript-eslint/no-explicit-any` (enable when `src/` grows) |
| Explicit function return types on public exports | ESLint + review                                                        |
| No non-null assertion (`!`) without comment      | Review + prefer narrowing                                              |
| `unknown` at untrusted boundaries                | Required pattern in handlers                                           |
| No `@ts-ignore`                                  | Use `@ts-expect-error` with ticket/issue reference only                |

Current `tsconfig.json` already enables `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`. Tightening ESLint for `src/` is tracked as tooling matures.

## OpenAPI validation (planned)

After Phase 1 contract harness:

- Parse pinned `openapi.yaml` (from `NENE2_NODE_OPENAPI_PATH`).
- Validate shared schemas and documented examples.
- HTTP contract tests assert status, `Content-Type`, and Problem Details shape — not full stack traces.

## CI policy

- Every PR that touches `src/` or `tests/` must pass `npm run check`.
- Lockfile `package-lock.json` is committed for reproducible installs.
- Node version: active LTS per `package.json` `engines`.

## Dependency policy

Mirrors nene2-python dependency rules:

1. Prefer stdlib or existing framework modules before new packages.
2. Justify each **runtime** dependency in the PR (Issue link + why alternatives fail).
3. License: MIT, Apache-2.0, BSD-2/3-Clause, ISC preferred; others need Issue discussion.
4. Run `npm audit` before merge; **do not** merge with unmitigated critical/high issues in production dependencies.
5. Pin dev tooling in lockfile; avoid floating major versions in `package.json` without review.

## Non-goals

- Adding every possible linter plugin before there is code to check.
- Mandatory 80% coverage gate in Phase 0 (target documented in `coding-standards.md` for Phase 3+).
- **Implemented (v0.1.14+):** `npm run test:coverage` with CI gate at **80%** lines/statements; per-file UseCase floors in `vitest.config.ts`.
- Bundling frontend lint tooling (no `frontend/` in this repo).

## References

- NENE2: `../NENE2/docs/development/quality-tools.md`
- nene2-python: `../nene2-python/CLAUDE.md` (§4 tests, §5 dependencies)
