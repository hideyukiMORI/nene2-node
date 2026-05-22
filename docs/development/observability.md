# Observability (request id + logging)

## Request ID

- Middleware: `requestIdMiddleware` — first in the `app.use` chain after hooks.
- Header: `X-Request-Id` on request and response.
- Access in handlers via Hono context (`src/hono-context.ts`).

## Request logging

- Middleware: `requestLoggingMiddleware` when `NENE2_NODE_REQUEST_LOGGING` is enabled (default on except `test`).
- JSON lines to stdout: method, path, status, duration, request id.
- Default exclude: `/health` (override with `NENE2_NODE_REQUEST_LOGGING_EXCLUDE_PATHS`).

## Correlation

Use the same request id in application logs by reading it from context after middleware runs. Do not generate a second id in handlers.

## Production

- Ship stdout to your log aggregator.
- Exclude high-cardinality health paths to reduce noise.
- Never log `Authorization`, API keys, or full JWTs.
- Redact or omit request bodies in custom loggers — framework default does not log bodies.

## Redaction checklist

| Data                           | Log?                                                 |
| ------------------------------ | ---------------------------------------------------- |
| `X-Request-Id`                 | yes                                                  |
| Method, path, status, duration | yes                                                  |
| `Authorization` / API keys     | **no**                                               |
| Full JSON body                 | **no** (unless dedicated audit pipeline with policy) |

## References

- `environment-variables.md`
- `middleware-pipeline.md`
