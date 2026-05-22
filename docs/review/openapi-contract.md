# OpenAPI Contract Self-Review

Use when changing public JSON shapes, contract tests, or OpenAPI pin policy.

**Policies:** `../scope.md`, `api-error-responses.md`, `../integrations/relationship-to-nene2.md`

## Checklist

- [ ] Contract source remains NENE2 `docs/openapi/openapi.yaml` (or pinned revision documented).
- [ ] `NENE2_NODE_OPENAPI_PATH` default documented if paths change.
- [ ] New public endpoints were added to NENE2 OpenAPI **before** or in the same coordinated release.
- [ ] Success and error response schemas match OpenAPI for the operation.
- [ ] Problem Details shared schemas used for documented error responses.
- [ ] Contract tests assert status, content-type, and `type` — not environment-specific noise.
- [ ] `npm run check` passed.
- [ ] PR mentions this checklist when contract-facing.
