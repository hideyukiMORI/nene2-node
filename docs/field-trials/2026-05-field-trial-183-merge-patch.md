# FT183 — PATCH partial update / JSON Merge Patch (`applyMergePatch`)

**Date:** 2026-05-29
**Status:** ✅ Complete
**Source FT:** PHP NENE2 FT326 (`patchlog`)
**Catalog row:** [ft178-349-catalog.md](ft178-349-catalog.md) → 🎯 do 🔧new (last of the bucket)
**Tier:** framework helper — in-tree unit tests

## Objective

node could check ETags (FT178) and ownership (`assertResourceOwner`) but had no
helper to apply a partial update body. Implement JSON Merge Patch (RFC 7396) with
immutable-field rejection so PATCH endpoints are safe and consistent.

## Deliverable (🔧new framework)

`src/http/merge-patch.ts`, exported from `src/index.ts`:

`applyMergePatch(target, patch, options?)` → new object:

- **RFC 7396** — only provided keys change; `null` deletes a key; nested plain
  objects merge recursively; arrays/scalars replace wholesale; `{}` is a no-op
  clone. Target never mutated.
- **`options.defaults`** — `null` on a key with a configured default resets to
  that default instead of deleting (the FT326 "reset to default" behaviour).
- **`options.immutable`** — forbidden keys → `ValidationException` (422, code
  `immutable`).
- **`options.allowed`** — optional allowlist; unknown keys → 422 (`unknown_field`).
- All offending keys collected into one exception via `createValidationCollector`
  (FT182). A non-object patch is itself a 422.

The owner-only-404, `If-Match`/412, and ETag parts of FT326 reuse existing
helpers (`assertResourceOwner`, `checkPreconditions`, `computeETag`) — shown in
the how-to, not re-implemented.

## Verification

`npm run check` green. 15 in-tree tests (`tests/http/merge-patch.test.ts`):
field-scoped update, no-op `{}`, non-mutation, `null` delete vs default-reset,
recursive object merge, array replace, each immutable field rejected, multi-key
violation collected together, allowlist, non-object patch.

## Design notes

- **RFC-faithful + API-friendly** — pure RFC 7396 deletes on `null`; the
  `defaults` option layers the common "reset to default" semantics without
  breaking the spec for keys that have no default.
- **Immutable guard is the security core** — blocks `id`/`owner_id`/`version`
  tampering (privilege escalation, lost-update) at the framework boundary.
- **Reuses FT182 collector** — every rejected key returns at once.
- **Closes the 🔧new bucket** — FT178 ETag, FT180 circuit-breaker, FT181
  distributed-lock, FT182 validation-collector, FT183 merge-patch. Remaining
  deep-FT work is the 🔒 security bucket (sandbox + attack tests).

## Friction

None. Pure addition under `src/http/`.

## How-to

[docs/how-to/patch-partial-update.md](../how-to/patch-partial-update.md)
