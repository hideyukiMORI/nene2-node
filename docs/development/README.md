# Development documentation

English reference for framework contributors. Updated from **field trials** (docs-first); see `docs/field-trials/backlog.md`.

## Start here

| Doc                                                        | Topic                         |
| ---------------------------------------------------------- | ----------------------------- |
| [engineering-policy.md](engineering-policy.md)             | Project rules                 |
| [coding-standards.md](coding-standards.md)                 | TypeScript style              |
| [domain-layer.md](domain-layer.md)                         | UseCase / Repository          |
| [api-error-responses.md](api-error-responses.md)           | RFC 9457 Problem Details      |
| [error-handling.md](error-handling.md)                     | `resolveHttpError` order      |
| [openapi-contract-testing.md](openapi-contract-testing.md) | Contract fixtures             |
| [composition-root.md](composition-root.md)                 | `createApp()` options         |
| [observability.md](observability.md)                       | Request id + logging          |
| [request-validation.md](request-validation.md)             | Handler validation            |
| [middleware-pipeline.md](middleware-pipeline.md)           | `createApp()` order           |
| [middleware-security.md](middleware-security.md)           | Security baseline             |
| [environment-variables.md](environment-variables.md)       | All `NENE2_NODE_*` vars       |
| [production-deployment.md](production-deployment.md)       | Go-live checklist             |
| [database-layer.md](database-layer.md)                     | SQLite executor, transactions |
| [field-trial-culture.md](field-trial-culture.md)           | FT loop rules                 |
| [quality-tools.md](quality-tools.md)                       | lint / test / build           |

## Field trials

Reports: `../field-trials/`. Index: `../field-trials/INDEX.md`. Backlog FT2–100: `../field-trials/backlog.md`.
