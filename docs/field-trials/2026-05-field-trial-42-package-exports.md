# Field trial report — FT42: Package export surface

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** N/A

## Validated

- `src/index.ts` exports framework primitives only; example domains not exported.
- `npm run build` emits matching `dist/index.d.ts`.

## Doc updates (docs-first)

- **New:** `docs/development/package-exports.md`

## Security diagnosis (FT42 % 3 = 0)

| Area                        | Result                                                 |
| --------------------------- | ------------------------------------------------------ |
| Example code exposure       | pass — `src/example` not in package `files` or exports |
| Internal middleware leakage | pass — only listed symbols exported                    |

**Overall:** pass.

## Follow-up

- Issue before exporting example UseCases as public API.
