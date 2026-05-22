# Middleware combinations

Validated stack in `createApp()` — see `middleware-pipeline.md` for order.

## Interaction matrix

| Pair                      | Behavior                                                                        |
| ------------------------- | ------------------------------------------------------------------------------- |
| Request id + logging      | Log lines should include request id from context                                |
| Size limit + throttle     | Oversized body rejected before throttle counter increments                      |
| CORS + Bearer             | Browser preflight on protected routes needs allowed origin + credentials policy |
| Throttle + health exclude | `/health` not counted when default exclude applies                              |
| API key + Bearer          | Different path prefixes — no double auth on same route in defaults              |

## Testing

| Module     | Test file                                                |
| ---------- | -------------------------------------------------------- |
| Throttle   | `tests/middleware/throttle.test.ts`                      |
| CORS       | `tests/middleware/cors.test.ts`                          |
| Logging    | `tests/middleware/request-logging.test.ts`               |
| Full stack | `tests/http/runtime.test.ts`, `bearer-protected.test.ts` |

## Custom forks

Reordering `app.use` invalidates the matrix — re-run HTTP tests and update `middleware-pipeline.md`.
