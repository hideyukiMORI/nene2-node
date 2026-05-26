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
 * Parse cursor-based pagination query parameters from a URLSearchParams instance.
 *
 * - `cursor` (`?cursor=N`): must be a positive integer when present.
 *   An absent, empty, non-numeric, zero, or negative value is silently treated
 *   as `undefined` (first page). This follows the same "ctype_digit" convention
 *   used in NENE2 PHP — invalid cursors degrade gracefully to page one.
 *
 * - `limit` (`?limit=N`): must be in the range [1, maxLimit].
 *   Throws `ValidationException` if the supplied value is out of range.
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
    const parsed = Number.parseInt(cursorRaw, 10);
    // Only accept a finite positive integer whose string form matches the input
    // (rejects "12abc" → parseInt gives 12, but "12abc" !== "12" so we reject)
    if (Number.isFinite(parsed) && parsed > 0 && String(parsed) === cursorRaw.trim()) {
      cursor = parsed;
    }
    // else: fall through — cursor stays undefined (first page)
  }

  // --- limit: throws on invalid ---
  const limitRaw = searchParams.get('limit');
  let limit: number;
  if (limitRaw === null || limitRaw === '') {
    limit = defaultLimit;
  } else {
    const parsed = Number.parseInt(limitRaw, 10);
    limit = Number.isFinite(parsed) ? parsed : 0;
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
