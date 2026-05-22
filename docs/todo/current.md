# Current work

Last updated: 2026-05-22

## Active

- [x] Governance, engineering policy, FT culture, Issue-driven workflow
- [x] Phase 1 core: Hono runtime, Problem Details, `/health`, `/examples/ping`, smoke `/`, machine health + API key
- [x] ADR 0002 Accepted (Hono on Node)
- [x] `npm run check` — 9 HTTP runtime tests

## Next Issues

| Priority | Title                                                                    |
| -------- | ------------------------------------------------------------------------ |
| High     | OpenAPI contract test harness (pin `../NENE2/docs/openapi/openapi.yaml`) |
| High     | Error handler middleware + domain exception mapping pattern              |
| High     | Validation layer + `validation-failed` Problem Details                   |
| Medium   | Bearer token middleware + `/examples/protected`                          |
| Medium   | Throttle, CORS, structured logging (Phase 2)                             |
| Medium   | Note example domain — UseCase / Repository / Handler (Phase 3)           |

## Handoff

- Contract source: `../NENE2/docs/openapi/openapi.yaml`
- Parity reference: `../nene2-python/src/nene2/`
- Runtime entry: `createApp()` in `src/app/create-app.ts`
- Client library: `../nene2-js` — do not duplicate here
