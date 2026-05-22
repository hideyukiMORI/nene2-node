# OpenAPI contract testing

Public JSON shapes are validated against **pinned fixtures** derived from NENE2 `docs/openapi/openapi.yaml` examples — not by parsing YAML in CI (keeps CI independent of sibling checkout when fixtures are committed).

## Layout

```text
tests/fixtures/contract/*.json   # pinned example bodies
tests/contract/*-endpoints.test.ts
tests/fixtures/contract/README.md
```

## Workflow

1. Change behavior to match OpenAPI (NENE2 authoring when shared across runtimes).
2. Update fixture JSON from the OpenAPI example value.
3. Run `npm run check` — contract tests compare live `app.request()` output to fixtures.

## OpenAPI path resolution

For tooling that reads the live spec:

```typescript
import { resolveOpenApiPath, openApiFileExists } from '@hideyukimori/nene2-framework';
```

| Env                       | Default                                                  |
| ------------------------- | -------------------------------------------------------- |
| `NENE2_NODE_OPENAPI_PATH` | `../NENE2/docs/openapi/openapi.yaml` (relative to `cwd`) |

## Maintenance checklist (when OpenAPI changes)

1. Diff NENE2 `openapi.yaml` example values for affected operations.
2. Update matching `tests/fixtures/contract/*.json`.
3. Bump `tests/fixtures/contract/openapi-pin.txt` (upstream ref or date).
4. Run `npm run check`.
5. Note revision in PR description — no secrets in fixtures.

## Adding a new contract test

1. Add fixture under `tests/fixtures/contract/`.
2. Add Vitest in `tests/contract/` using `createApp()` and `app.request()`.
3. Document the operation id in the test describe block.

## References

- `docs/review/openapi-contract.md`
- FT#20 report: `../field-trials/2026-05-field-trial-20-openapi-contract.md`
