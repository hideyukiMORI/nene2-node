# Migration notes — PHP NENE2 → nene2-node

High-level mapping for teams moving an example app from the PHP runtime to the Node framework port.

## Runtime

| PHP NENE2                         | nene2-node                                               |
| --------------------------------- | -------------------------------------------------------- |
| `RuntimeApplicationFactory`       | `createApp()`                                            |
| `ProblemDetailsResponseFactory`   | `createProblemDetailsFactory()`                          |
| `ErrorHandlerMiddleware`          | `app.onError` + `resolveHttpError()`                     |
| `DomainExceptionHandlerInterface` | `DomainExceptionHandler` / `createSimpleDomainHandler()` |
| `ValidationException`             | `ValidationException` (same Problem Details shape)       |

## Middleware

See `docs/development/middleware-pipeline.md`. Environment variables use the `NENE2_NODE_*` prefix (see `AppSettings`).

## Database

| PHP                                   | Node                                                                |
| ------------------------------------- | ------------------------------------------------------------------- |
| `DatabaseQueryExecutorInterface`      | `DatabaseQueryExecutor`                                             |
| `DatabaseTransactionManagerInterface` | `DatabaseTransactionManager`                                        |
| `PdoDatabaseQueryExecutor`            | `SqliteQueryExecutor` (local/tests; production: inject your driver) |
| `DatabaseHealthCheck`                 | `createDatabaseHealthCheck()`                                       |

Set `NENE2_NODE_DATABASE_URL=:memory:` or `file:./var/dev.sqlite` for persistent local notes.

## Example domain

| PHP `Nene2\Example\Note` | Node `src/example/note/`                          |
| ------------------------ | ------------------------------------------------- |
| `*UseCase` + `*Handler`  | `*UseCase` + `registerNoteRoutes()`               |
| `PdoNoteRepository`      | `SqliteNoteRepository` + `InMemoryNoteRepository` |

## MCP

PHP `LocalMcpHttpClientInterface` → `FetchMcpHttpClient`. Stdio MCP remains in nene-mcp / NENE2 PHP tooling.

## Client applications

Use [nene2-js](https://github.com/hideyukiMORI/nene2-js) for browser/Node fetch clients — not this package.
