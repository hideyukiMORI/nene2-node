# Field Trial 166 — Multi-Step Workflow

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Patterns documented

- Sequential steps with `UNIQUE (workflow_id, step_order)` constraint
- `COALESCE(MAX(step_order), 0) + 1` for auto-ordered step append
- State machine: `pending → in_progress → completed | rejected`; 409 on already-finished runs
- Approve: advance to next step (or complete if last step)
- Reject: terminates the run immediately
- Full action history in `workflow_actions` table

## Version

No framework change. Docs-only (D0).
