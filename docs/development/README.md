# Development documentation

English reference for framework contributors. Updated from **field trials** (docs-first); see `docs/field-trials/backlog.md`.

## Start here

| Doc                                                    | Topic                          |
| ------------------------------------------------------ | ------------------------------ |
| [engineering-policy.md](engineering-policy.md)         | Project rules                  |
| [coding-standards.md](coding-standards.md)             | TypeScript style               |
| [contributor-onboarding.md](contributor-onboarding.md) | Contributor fast path          |
| [commit-conventions.md](commit-conventions.md)         | Conventional Commits           |
| [self-review.md](self-review.md)                       | Pre-PR checklist               |
| [quality-tools.md](quality-tools.md)                   | lint / test / build / coverage |
| [field-trial-culture.md](field-trial-culture.md)       | FT loop rules                  |
| [release-process.md](release-process.md)               | npm OIDC release               |

## Architecture & domain

| Doc                                                    | Topic                        |
| ------------------------------------------------------ | ---------------------------- |
| [domain-layer.md](domain-layer.md)                     | UseCase / Repository         |
| [composition-root.md](composition-root.md)             | `createApp()` options        |
| [package-exports.md](package-exports.md)               | Published API surface        |
| [api-error-responses.md](api-error-responses.md)       | RFC 9457 Problem Details     |
| [error-handling.md](error-handling.md)                 | `resolveHttpError` order     |
| [request-validation.md](request-validation.md)         | Handler validation           |
| [http-status-patterns.md](http-status-patterns.md)     | 404 / 405 / 503 matrix       |
| [transactions.md](transactions.md)                     | `runTransaction`, abort      |
| [optimistic-concurrency.md](optimistic-concurrency.md) | Version / If-Match           |
| [timestamps.md](timestamps.md)                         | UTC ISO-8601 helpers         |
| [resource-ownership.md](resource-ownership.md)         | BOLA / `assertResourceOwner` |

## HTTP, middleware & auth

| Doc                                                          | Topic                   |
| ------------------------------------------------------------ | ----------------------- |
| [middleware-pipeline.md](middleware-pipeline.md)             | `createApp()` order     |
| [middleware-security.md](middleware-security.md)             | Security baseline       |
| [middleware-combinations.md](middleware-combinations.md)     | Middleware interactions |
| [composite-auth.md](composite-auth.md)                       | Auth path patterns      |
| [observability.md](observability.md)                         | Request id + logging    |
| [webhook-signatures.md](webhook-signatures.md)               | HMAC + replay window    |
| [throttle-storage-adapters.md](throttle-storage-adapters.md) | Memory / file / Redis   |

## Database & data plane

| Doc                                                            | Topic                         |
| -------------------------------------------------------------- | ----------------------------- |
| [database-layer.md](database-layer.md)                         | Executors, transactions       |
| [database-migrations.md](database-migrations.md)               | App-owned vs framework schema |
| [database-connection-pool.md](database-connection-pool.md)     | Pool settings                 |
| [database-read-replica.md](database-read-replica.md)           | Read URL / `readExecutor`     |
| [database-constraint-errors.md](database-constraint-errors.md) | 409 / 422 mapping             |
| [ci-mysql-service.md](ci-mysql-service.md)                     | CI MySQL 8.4 service job      |
| [ci-postgres-service.md](ci-postgres-service.md)               | CI Postgres 16 service job    |
| [mysql-read-replica-e2e.md](mysql-read-replica-e2e.md)         | Compose read-replica E2E      |
| [redis-compose-e2e.md](redis-compose-e2e.md)                   | Compose Redis E2E             |

## Production & security

| Doc                                                        | Topic                      |
| ---------------------------------------------------------- | -------------------------- |
| [production-deployment.md](production-deployment.md)       | Go-live checklist          |
| [deploy-checklist-real-db.md](deploy-checklist-real-db.md) | Deploy with MySQL/Postgres |
| [commercial-readiness.md](commercial-readiness.md)         | Production defaults        |
| [production-errors.md](production-errors.md)               | Prod error disclosure      |
| [security-policy.md](security-policy.md)                   | Security baseline policy   |
| [node-security-practices.md](node-security-practices.md)   | Node crypto, fetch, logs   |
| [environment-variables.md](environment-variables.md)       | All `NENE2_NODE_*` vars    |

## OpenAPI & local dev

| Doc                                                        | Topic             |
| ---------------------------------------------------------- | ----------------- |
| [openapi-contract-testing.md](openapi-contract-testing.md) | Contract fixtures |
| [local-development.md](local-development.md)               | `npm run dev`     |

## Field trials

Reports: `../field-trials/`. Index: `../field-trials/INDEX.md` (FT1–177). Backlog: `../field-trials/backlog.md`, `../field-trials/ft149-177-backlog.md`.
