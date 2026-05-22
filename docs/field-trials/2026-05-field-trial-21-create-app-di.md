# Field trial report — FT21: createApp DI options

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** N/A | **Adversarial:** N/A

## Validated

- `CreateAppOptions` injects settings, repos, health checks, verifiers, domain handlers.
- Used across HTTP and contract tests.

## Doc updates (docs-first)

- **New:** `docs/development/composition-root.md`

## Friction

- _None blocking._

## DX

Tests swap in-memory repos without SQLite; production uses env-driven defaults.

## Follow-up

- None.
