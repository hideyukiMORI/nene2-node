# Quality Tools Policy

Quality checks are explicit, fast, and required before merge. This policy mirrors NENE2 `docs/development/quality-tools.md`, adapted for Node.js.

**Note:** Vitest uses `node:sqlite`. On the supported Node 24 LTS baseline it is
stable (no `ExperimentalWarning`); on older Node 22 it emits one (FT#16).

## Public API surface guard

`tests/api/public-surface.test.ts` snapshots every name exported from
`src/index.ts` (values + `type`-only) and cross-checks runtime reachability. Any
added, removed, or renamed public export **fails the test** — so surface changes
are deliberate and reviewable (ADR 0003 / roadmap Phase 9 A1).

When a public-API change is intentional, regenerate the snapshot and review the
diff in the PR:

```sh
npx vitest run -u tests/api/public-surface.test.ts
```

New exports must be assigned a stability tier in [`docs/STABILITY.md`](../STABILITY.md)
(Stable vs Experimental); `tests/api/stability.test.ts` enforces that the
Experimental list stays in sync with the live export surface.

## Doc integrity

`npm run docs:check` (`scripts/check-docs.mjs`, part of `npm run check`) fails on
an unindexed field-trial report, a "current release" string that drifts from
`package.json`, or a broken intra-repo Markdown link.

## Dependency audit

Before release PRs, run `npm audit` and address or document critical/high findings (`node-security-practices.md`, FT#53).

## Position

Tools are part of framework design. They must make changes safer without hiding behavior from tests or static analysis.

**Standard direction:**

- **TypeScript:** `tsc --noEmit` with strict compiler options.
- **Lint:** ESLint with `typescript-eslint` strict type-checked rules on `src/`.
- **Format:** Prettier (check in CI, fix locally).
- **Tests:** Vitest for unit and HTTP-level tests.
- **Contract:** Pinned OpenAPI fixture tests in CI (`openapi-contract-testing.md`).
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

Coverage is measured separately (`npm run test:coverage`) and enforced in CI with **≥80%** lines/statements/branches and **≥90%** for example UseCase modules (see `vitest.config.ts`). Barrel `src/index.ts` and `dev-server.ts` are excluded from the denominator. MySQL/PostgreSQL integration tests live under `tests/integration/`.

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

## OpenAPI contract testing (implemented)

Fixture-based contract tests run in CI via `npm test` (no live NENE2 checkout required):

- Pinned revision: `tests/fixtures/contract/openapi-pin.txt`
- Fixtures: `tests/fixtures/contract/*.json` (system routes + example note/tag)
- Tests: `tests/contract/system-endpoints.test.ts`, `note-endpoints.test.ts`, `tag-endpoints.test.ts`
- Policy: `openapi-contract-testing.md`

HTTP contract tests assert status, `Content-Type`, and Problem Details shape — not full stack traces. Full OpenAPI schema validation against live YAML is **not** automated in CI; refresh fixtures when NENE2 examples change.

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
- Bundling frontend lint tooling (no `frontend/` in this repo).
- Full OpenAPI schema validator in CI (fixture-based contract tests are the adopted baseline).

## References

- NENE2: `../NENE2/docs/development/quality-tools.md`
- nene2-python: `../nene2-python/CLAUDE.md` (§4 tests, §5 dependencies)
