# FT184 — Unicode-safe text validation (`validateTextField`)

**Date:** 2026-05-29
**Status:** ✅ Complete
**Source FT:** PHP NENE2 FT345 (`unicodelog`)
**Catalog row:** [ft178-349-catalog.md](ft178-349-catalog.md) → 🎯 do 🔒 (first of the security bucket)
**Tier:** pure validation helper — in-tree unit tests (attack matrix runs as tests)

## Objective

Length limits on text fields must count Unicode **code points**, not bytes/UTF-16
units, and null bytes must be rejected. node had no helper and the JS
`string.length` pitfall (`'🎉'.length === 2`) makes hand-rolled limits wrong.

## Deliverable (🔒 framework)

`src/validation/validate-text.ts`, exported from `src/index.ts`:

- `countCodePoints(value)` — code-point count via string iteration
  (`'🎉'` → 1; ZWJ family `👨‍👩‍👧` → 5; no grapheme collapsing/normalisation).
- `hasNullByte(value)` — detect `U+0000`.
- `validateTextField(collector, field, value, { min?, max? })` — records into a
  `ValidationCollector` (FT182): `invalid_type` (non-string), `null_byte`,
  `required` (empty + `min>=1`), `too_short`, `too_long`. Composes across fields.

## Why this is the JS parity of FT345

PHP's lesson was `strlen` (bytes) vs `mb_strlen` (chars). The JS equivalent is
`String.length` (UTF-16 units) vs **code points**. A 50-emoji name has
`length === 100` but `countCodePoints === 50`; using `.length` would wrongly
reject valid input. The helper makes the correct count the easy path.

## Verification

`npm run check` green. 17 in-tree tests (`tests/validation/validate-text.test.ts`):
code-point counting (ASCII/CJK/emoji/ZWJ), the `.length === 2` pitfall, null-byte
rejection, multi-script acceptance, byte-vs-codepoint limit, `required` /
`too_short` / `too_long` / `invalid_type`, optional (`min 0`) fields, and
collector composition.

## Design notes

- **Code points, not graphemes** — matches `mb_strlen` semantics; grapheme-cluster
  counting would need `Intl.Segmenter` and is a different (rarely-needed) limit.
- **Reject, don't strip, null bytes** — stripping causes silent truncation and
  stored-vs-sent drift.
- **No normalisation** — input is stored verbatim; round-trip equality preserved.
- **Self-bug caught in-loop** — first draft had `hasNullByte` testing for a space;
  the in-tree null-byte test surfaced it immediately (executable proof working as
  intended).

## Friction

None. Pure addition under `src/validation/`.

## How-to

[docs/how-to/unicode-text-validation.md](../how-to/unicode-text-validation.md)
