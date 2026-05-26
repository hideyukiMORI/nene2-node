import { ValidationError } from '../validation/validation-error.js';
import { ValidationException } from '../validation/validation-exception.js';

export interface CursorQuery {
  /** `undefined` means "first page" (no cursor supplied or cursor was invalid). */
  readonly cursor: number | undefined;
  readonly limit: number;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * O(n) digit-only check — no regex, immune to ReDoS.
 * Rejects floats, signed, padded, hex, scientific notation, and empty strings.
 */
function isDigitString(value: string): boolean {
  if (value.length === 0) return false;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 48 || code > 57) return false; // '0'..'9'
  }
  return true;
}

/**
 * Parse cursor-based pagination query parameters from a URLSearchParams instance.
 *
 * - `cursor` (`?cursor=N`): must be a positive integer when present.
 *   An absent, empty, non-numeric, zero, or negative value is silently treated
 *   as `undefined` (first page). This follows the same "ctype_digit" convention
 *   used in NENE2 PHP — invalid cursors degrade gracefully to page one.
 *
 * - `limit` (`?limit=N`): must be a pure digit string in the range [1, maxLimit].
 *   Non-digit inputs (floats, signed, padded, hex, overflow) throw `ValidationException`
 *   with code `invalid_type`. Out-of-range values throw with code `out_of_range`.
 *   Defaults to 10 when absent.
 *
 * @example
 * ```ts
 * const { cursor, limit } = parseCursorQuery(new URL(req.url).searchParams);
 * const sql = cursor
 *   ? 'SELECT * FROM events WHERE id < ? ORDER BY id DESC LIMIT ?'
 *   : 'SELECT * FROM events ORDER BY id DESC LIMIT ?';
 * ```
 */
export function parseCursorQuery(
  searchParams: URLSearchParams,
  defaults: { readonly defaultLimit?: number; readonly maxLimit?: number } = {},
): CursorQuery {
  const defaultLimit = defaults.defaultLimit ?? DEFAULT_LIMIT;
  const maxLimit = defaults.maxLimit ?? MAX_LIMIT;

  // --- cursor: silent fallback to undefined on any invalid input ---
  const cursorRaw = searchParams.get('cursor');
  let cursor: number | undefined;
  if (cursorRaw !== null && cursorRaw !== '') {
    // Overflow guard + digit-only check (same as isDigitString but also checks length)
    if (cursorRaw.length <= 18 && isDigitString(cursorRaw)) {
      const parsed = Number.parseInt(cursorRaw, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        cursor = parsed;
      }
    }
    // else: fall through — cursor stays undefined (first page)
  }

  // --- limit: strict digit-only parsing; throws on invalid or out-of-range ---
  const limitRaw = searchParams.get('limit');
  let limit: number;
  if (limitRaw === null || limitRaw === '') {
    limit = defaultLimit;
  } else if (limitRaw.length > 18 || !isDigitString(limitRaw)) {
    // Non-digit strings (floats, signed, hex, padded, overflow) → 422
    throw new ValidationException([
      new ValidationError('limit', 'limit must be a non-negative integer.', 'invalid_type'),
    ]);
  } else {
    limit = Number.parseInt(limitRaw, 10);
  }

  if (limit < 1 || limit > maxLimit) {
    throw new ValidationException([
      new ValidationError(
        'limit',
        `limit must be between 1 and ${String(maxLimit)}.`,
        'out_of_range',
      ),
    ]);
  }

  return { cursor, limit };
}
