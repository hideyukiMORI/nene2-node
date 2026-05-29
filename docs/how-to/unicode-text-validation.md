# How-to: Unicode-safe text validation

Text length limits must count **Unicode code points**, not bytes or UTF-16
units, and null bytes must be rejected. `validateTextField` does both and
composes with the validation collector.

> Parity: PHP NENE2 FT345 (`unicodelog`). node FT184.

## The JavaScript pitfall

`string.length` counts **UTF-16 code units**, so an astral emoji is 2:

```ts
'🎉'.length; // 2  ❌ — would reject a 50-emoji name under a 50-char limit
countCodePoints('🎉'); // 1  ✅
```

This is the exact analogue of PHP `strlen` vs `mb_strlen`. Always use
`countCodePoints` for character limits.

## Usage

```ts
import { createValidationCollector, validateTextField } from '@hideyukimori/nene2-framework';

app.post('/profiles', async (c) => {
  const body = await c.req.json();
  const v = createValidationCollector();

  validateTextField(v, 'name', body.name, { min: 1, max: 50 });
  validateTextField(v, 'bio', body.bio, { max: 500 }); // optional (min 0)
  v.throwIfAny(); // → 422 with every failure

  // … all text fields are within code-point limits and null-byte-free
});
```

## Rules and codes

| Condition               | Code           |
| ----------------------- | -------------- |
| not a string            | `invalid_type` |
| contains `U+0000`       | `null_byte`    |
| empty and `min >= 1`    | `required`     |
| fewer than `min` points | `too_short`    |
| more than `max` points  | `too_long`     |

## Accepted input (no normalisation)

```ts
validateTextField(v, 'name', '田中太郎', { min: 1, max: 50 }); // ✅ Japanese
validateTextField(v, 'name', '🎉 Yuki 🎊', { min: 1, max: 50 }); // ✅ emoji
validateTextField(v, 'name', 'محمد علي', { min: 1, max: 50 }); // ✅ Arabic
validateTextField(v, 'name', 'André García 鈴木', { max: 100 }); // ✅ mixed
```

A ZWJ emoji like `👨‍👩‍👧` counts as **5 code points** (not 1 grapheme cluster) —
`countCodePoints` does not collapse grapheme clusters. Store and return text
verbatim; do not `normalize()` user input unless your domain requires it.

## Why reject null bytes

`U+0000` can truncate strings in C-backed libraries and slip past some parsers —
a classic injection/validation-bypass vector. Reject it outright rather than
stripping it.

## What NOT to do

| Anti-pattern                          | Risk                                                 |
| ------------------------------------- | ---------------------------------------------------- |
| `value.length` for limits             | Rejects valid emoji/CJK; the byte/unit-count trap    |
| Strip null bytes instead of rejecting | Hidden truncation; inconsistent stored vs sent value |
| `normalize()` silently                | Changes the user's input; breaks round-trip equality |
| Count bytes (`Buffer.byteLength`)     | Penalises non-ASCII scripts unfairly                 |
