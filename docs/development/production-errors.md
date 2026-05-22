# Production error disclosure

Controls what clients see when `NENE2_NODE_APP_ENV=production` and `NENE2_NODE_APP_DEBUG=false`.

## Problem Details

| Field      | Production behavior                                                |
| ---------- | ------------------------------------------------------------------ |
| `type`     | Stable URI — always present                                        |
| `title`    | English summary                                                    |
| `status`   | HTTP code                                                          |
| `detail`   | Generic for 500 — **no** exception message from `resolveHttpError` |
| `errors[]` | Validation only — safe field messages                              |

## What never appears in JSON

- Stack traces
- SQL fragments
- File paths from Node internals
- JWT segments or API keys

## Debug mode

`NENE2_NODE_APP_DEBUG=true` may include `Error.message` in 500 `detail` and log stderr — **forbidden in production** deployments.

## References

- `error-handling.md`
- `api-error-responses.md`
- `production-deployment.md`
