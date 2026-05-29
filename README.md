# nene2-node

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D24%20LTS-339933)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)](https://www.typescriptlang.org/)

**NENE2-compatible API framework for Node.js** — a TypeScript port of the [NENE2](https://github.com/hideyukiMORI/NENE2) design philosophy, optimized for the Node ecosystem (not a wrapper around the PHP runtime).

Published as [`@hideyukimori/nene2-framework`](https://www.npmjs.com/package/@hideyukimori/nene2-framework).

## Install (in your Node API project)

Use this when you **build and run** a NENE2-compatible API server on Node.js. If you only **call** an existing API, use [nene2-js](https://github.com/hideyukiMORI/nene2-js) (`@hideyukimori/nene2-client`) instead — you do not need this package.

```bash
npm install @hideyukimori/nene2-framework @hono/node-server
```

`@hono/node-server` is required to call `serve()` — it is not re-exported from the framework package.

New project walkthrough: [docs/how-to/consumer-quickstart.md](docs/how-to/consumer-quickstart.md) (install as a dependency in your Node API project).

## What this repository is

- HTTP runtime, routing, and middleware aligned with NENE2 behavior
- RFC 9457 Problem Details, validation errors, and auth patterns (Bearer, API key)
- UseCase → Repository → Handler layering (clean architecture)
- SQLite, MySQL, and PostgreSQL database adapters
- Example Note/Tag domains as **reference implementations** (not a stable public API)
- OpenAPI **compatibility** with NENE2 `docs/openapi/openapi.yaml` (contract tests use pinned fixtures)
- English docs and tooling friendly to contributors and AI agents

## What this repository is not

- Replacing or embedding the PHP NENE2 runtime
- A typed HTTP client — use [nene2-js](https://github.com/hideyukiMORI/nene2-js) (`@hideyukimori/nene2-client`)
- A duplicate of [nene-mcp](https://github.com/hideyukiMORI/nene-mcp) stdio MCP servers (HTTP MCP client only; see [docs/integrations/mcp-boundary.md](docs/integrations/mcp-boundary.md))
- Application-specific business logic (belongs in your product repo)

Full boundary: [docs/scope.md](docs/scope.md). Engineering rules: [docs/development/engineering-policy.md](docs/development/engineering-policy.md).

## Develop this repository

**You only need to clone `nene2-node`.** Sibling repositories are not dependencies of `npm install`, `npm run check`, or CI.

### Prerequisites

- Node.js **24+** (LTS) — `node:sqlite` is stable; no `--experimental-sqlite` flag
- npm **10+**

### Clone and verify

```bash
git clone git@github.com:hideyukiMORI/nene2-node.git
cd nene2-node
npm install
npm run check    # type-check, lint, format, test, build
npm run dev      # local Hono server on :3000
```

Coverage gate (also run in CI): `npm run test:coverage`. MySQL/PostgreSQL integration tests: `npm run test:integration` (requires DB URLs — see [docs/development/ci-mysql-service.md](docs/development/ci-mysql-service.md)).

### Optional: live OpenAPI file on disk

Contract tests in CI use **pinned JSON fixtures** under `tests/fixtures/contract/` — they do **not** require a NENE2 checkout.

Clone [NENE2](https://github.com/hideyukiMORI/NENE2) only when you want to point at the live contract file locally (e.g. diff against upstream yaml):

```bash
cp .env.example .env
# NENE2_NODE_OPENAPI_PATH=../NENE2/docs/openapi/openapi.yaml
```

Policy: [docs/development/openapi-contract-testing.md](docs/development/openapi-contract-testing.md).

## Sibling repositories (NENE2 ecosystem)

These projects share the NENE2 **contract story**. They are **not** all required to hack on nene2-node.

| Repository                                                       | Role                                                                   | Clone for nene2-node dev?                                       |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| **[NENE2](https://github.com/hideyukiMORI/NENE2)**               | PHP framework; **authors** `docs/openapi/openapi.yaml`                 | **Optional** — live OpenAPI path only (see above)               |
| **nene2-node** (this repo)                                       | Node.js framework server (`@hideyukimori/nene2-framework`)             | **Yes**                                                         |
| **[nene2-python](https://github.com/hideyukiMORI/nene2-python)** | Python port — **parity benchmark** for behavior and module layout      | **No** — consult when aligning design; not a build dependency   |
| **[nene2-js](https://github.com/hideyukiMORI/nene2-js)**         | Typed **HTTP client** for API consumers (`@hideyukimori/nene2-client`) | **No** — separate product; sync after public JSON shape changes |
| **[nene-mcp](https://github.com/hideyukiMORI/nene-mcp)**         | PHP **stdio** MCP server                                               | **No** — out of scope; do not duplicate here                    |

Cross-repo checklist (when changing public API behavior): [docs/integrations/cross-repo-parity.md](docs/integrations/cross-repo-parity.md).

### Optional side-by-side layout

Some maintainers keep siblings in one parent directory for convenience. **This layout is not required** — only `nene2-node` is needed for day-to-day framework work.

```text
parent/                    # e.g. ../docker/ — your choice
├── NENE2/                 # optional: OpenAPI yaml author
├── nene2-node/            # this repository (required)
├── nene2-python/          # optional: parity reference (read-only)
├── nene2-js/              # optional: client repo (separate workflow)
└── nene-mcp/              # optional: PHP stdio MCP (not used by nene2-node)
```

Relationship details: [docs/integrations/relationship-to-nene2.md](docs/integrations/relationship-to-nene2.md), [relationship-to-nene2-js.md](docs/integrations/relationship-to-nene2-js.md).

## Current release

**Latest (npm): [v0.2.0](https://github.com/hideyukiMORI/nene2-node/releases/tag/v0.2.0)** (2026-05-29) — first breaking release; **requires Node 24+**. See [CHANGELOG](CHANGELOG.md) for migration.

Highlights at `0.1.x`:

- Hono `createApp()`, middleware stack, Problem Details, Bearer + API key auth
- MySQL / PostgreSQL executors, transactions, read-replica URL, CI integration jobs
- Example note/tag CRUD with Bearer + row ownership (BOLA) when `includeExamples` is enabled
- HTTP helpers: `parsePaginationQuery` (hardened), `parseCursorQuery`, `parseSortQuery` (ORDER BY allowlist), ETag conditional requests, `applyMergePatch` (RFC 7396)
- Validation: `createValidationCollector` (nested paths), `validateTextField` (Unicode-safe)
- Security: `checkUrlSafety` (SSRF guard), `assertTenantScope` (multi-tenant 404), `escapeLikePattern`
- Resilience / concurrency: `createCircuitBreaker`, `createLockManager`
- Production defaults: `includeExamples=false`, optional `jose` JWKS verifier, graceful shutdown
- Field-trial parity with NENE2 PHP v1.5.111 (FT1–177 complete; FT178+ in progress)
- Vitest coverage gates (80% global, 90% example UseCases)

Roadmap: [docs/roadmap.md](docs/roadmap.md). Changelog: [CHANGELOG.md](CHANGELOG.md).

## Documentation

| Audience                | Start here                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------- |
| Contributors            | [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md), [docs/workflow.md](docs/workflow.md) |
| AI agents               | [AGENTS.md](AGENTS.md)                                                             |
| Framework internals     | [docs/development/README.md](docs/development/README.md)                           |
| Local dev routes & auth | [docs/development/local-development.md](docs/development/local-development.md)     |

## Contributing

Work is **GitHub Issue driven**. Branch: `type/issue-number-summary`. Do not commit directly to `main`.

```bash
npm run check   # required before opening a PR
```

## License

MIT — see [LICENSE](LICENSE).
