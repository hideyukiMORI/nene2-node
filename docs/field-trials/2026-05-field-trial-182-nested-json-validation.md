# FT182 — Nested JSON Validation (`createValidationCollector`)

**Date:** 2026-05-29
**Status:** ✅ Complete
**Source FT:** PHP NENE2 FT322 (`nestedlog`)
**Catalog row:** [ft178-349-catalog.md](ft178-349-catalog.md) → 🎯 do 🔧new
**Tier:** framework helper — in-tree unit tests

## Objective

Validating nested JSON (order line items) needs indexed error paths
(`items.0.product_id`) and **all** errors in one `422`. node had
`ValidationError` / `ValidationException` but no ergonomic accumulator for nested
paths — building `items.${i}.${field}` by hand is drift-prone.

## Deliverable (🔧new framework)

`src/validation/validation-collector.ts`, exported from `src/index.ts`:

- `createValidationCollector()` → `ValidationCollector`:
  - `add(field, message, code)` — record an error at the current scope.
  - `scope(prefix)` — child collector prefixing field paths
    (`scope('items.0').add('product_id', …)` → `items.0.product_id`), writing
    into the **same** underlying list; scopes nest.
  - `errors`, `hasErrors`, `throwIfAny()` (→ `ValidationException` → 422).

This is a thin, composable layer over the existing validation types — not a new
validation DSL. It captures exactly the FT322 pattern (top-level + nested,
single response) while leaving the per-field rules to the caller.

## Verification

`npm run check` green. 7 in-tree tests
(`tests/validation/validation-collector.test.ts`) cover empty state, top-level
add, scope prefixing, shared list across scopes, nested scopes, `throwIfAny`,
and an end-to-end nested-order payload producing
`[customer, items.0.product_id, items.1.quantity, items.1.unit_price]`.

## Design notes

- **Shared sink** — `scope()` children push into the parent's array, so one
  `throwIfAny()` reports everything; no manual merging.
- **No fail-fast** — collect all errors so a client fixes the whole payload at
  once, not one field per round-trip.
- **snake_case codes** — `ValidationError` rejects codes with spaces; the how-to
  standardises on `required` / `min_value` / `max_length` / `invalid_type`
  (PHP's hyphenated `min-value` mapped to node house style).

## Friction

None. Pure addition under `src/validation/`.

## How-to

[docs/how-to/nested-json-validation.md](../how-to/nested-json-validation.md)
