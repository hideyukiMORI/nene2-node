# Backend API Self-Review

Use for endpoints, handlers, UseCases, validation, and HTTP-facing behavior.

**Policies:** `domain-layer.md`, `request-validation.md`, `api-error-responses.md`, `coding-standards.md`, `../scope.md`

## Checklist

- [ ] Stable public behavior is reflected in NENE2 OpenAPI (or Issue exists to update OpenAPI first).
- [ ] Handlers map requests to **readonly** input DTOs before calling UseCases.
- [ ] UseCases do not import HTTP framework types or read `process.env`.
- [ ] Business logic lives in UseCases, not handlers or middleware.
- [ ] Repositories are injected via interfaces; handlers do not query SQL directly.
- [ ] SQL exists only in repository/adapter modules.
- [ ] Domain errors map to Problem Details at the HTTP boundary.
- [ ] Validation failures use `validation-failed` with structured `errors[]`.
- [ ] Problem `type` uses `https://nene2.dev/problems/{problem-name}`.
- [ ] Public error text is **English**; no stack traces, SQL, paths, or secrets in JSON.
- [ ] `npm run check` passed (or narrowest equivalent if docs-only sibling change).
- [ ] PR mentions this checklist when API-facing.
