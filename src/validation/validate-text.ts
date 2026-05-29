import type { ValidationCollector } from './validation-collector.js';

const NULL_CHAR = String.fromCharCode(0);

/**
 * Count Unicode **code points** in `value` (not UTF-16 code units).
 *
 * JavaScript's `string.length` counts UTF-16 units, so `'🎉'.length === 2` —
 * the same trap as PHP `strlen` vs `mb_strlen`. Iterating the string yields one
 * step per code point.
 *
 * Note: this counts code points, not grapheme clusters. A ZWJ emoji such as
 * `👨‍👩‍👧` (`U+1F468 U+200D U+1F469 U+200D U+1F467`) is 5 code points. Text is
 * never normalised — store and return it verbatim.
 */
export function countCodePoints(value: string): number {
  // Array.from uses the string iterator, which steps by code point (not UTF-16
  // unit) — intentionally counts ZWJ sequences as multiple code points.
  return Array.from(value).length;
}

/** True when `value` contains a NUL (`U+0000`) — an injection/truncation vector. */
export function hasNullByte(value: string): boolean {
  return value.includes(NULL_CHAR);
}

export interface TextFieldRule {
  /** Minimum code points. Default 0. `min: 1` enforces non-empty. */
  readonly min?: number;
  /** Maximum code points. Omit for no upper bound. */
  readonly max?: number;
}

/**
 * Validate a Unicode text field by **code-point** length and reject null bytes,
 * recording any failure in the {@link ValidationCollector} (so it composes with
 * nested/batch validation and returns a single 422).
 *
 * Codes: `invalid_type` (not a string), `null_byte`, `required` (empty when
 * `min >= 1`), `too_short` (below `min`), `too_long` (above `max`).
 * Multi-script input (Japanese, emoji, Arabic, accents, mixed) passes; nothing
 * is normalised.
 *
 * @example
 *   const v = createValidationCollector();
 *   validateTextField(v, 'name', body.name, { min: 1, max: 50 });
 *   validateTextField(v, 'bio', body.bio, { max: 500 });
 *   v.throwIfAny();
 */
export function validateTextField(
  collector: ValidationCollector,
  field: string,
  value: unknown,
  rule: TextFieldRule,
): void {
  if (typeof value !== 'string') {
    collector.add(field, `${field} must be a string`, 'invalid_type');
    return;
  }
  if (hasNullByte(value)) {
    collector.add(field, `${field} must not contain null bytes`, 'null_byte');
    return;
  }

  const length = countCodePoints(value);
  const min = rule.min ?? 0;

  if (length < min) {
    if (length === 0) {
      collector.add(field, `${field} is required`, 'required');
    } else {
      collector.add(field, `${field} must be at least ${String(min)} characters`, 'too_short');
    }
    return;
  }
  if (rule.max !== undefined && length > rule.max) {
    collector.add(field, `${field} must be at most ${String(rule.max)} characters`, 'too_long');
  }
}
