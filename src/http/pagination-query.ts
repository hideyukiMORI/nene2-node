import { ValidationError } from '../validation/validation-error.js';
import { ValidationException } from '../validation/validation-exception.js';

export interface PaginationQuery {
  readonly limit: number;
  readonly offset: number;
}

const DEFAULT_LIMIT = 20;
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
 * Parse a query-string integer with strict validation.
 *
 * Returns:
 * - `{ ok: true, value: N }` for absent/empty (fallback) or valid digit strings
 * - `{ ok: false }` for non-digit strings or strings exceeding 18 characters
 *
 * Strings longer than 18 characters are rejected to prevent integer overflow
 * (all safe JavaScript integers have ≤ 16 digits; 18 provides a safe margin).
 *
 * Non-digit strings include: floats ("10.5"), signed ("+10", "-1"),
 * padded (" 10"), hex ("0x10"), scientific ("1e2").
 */
function parseIntQuery(
  value: string | undefined,
  fallback: number,
): { ok: true; value: number } | { ok: false } {
  if (value === undefined || value === '') {
    return { ok: true, value: fallback };
  }
  if (value.length > 18 || !isDigitString(value)) {
    return { ok: false };
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return { ok: false };
  }
  return { ok: true, value: parsed };
}

export function parsePaginationQuery(
  searchParams: URLSearchParams,
  defaults: { readonly defaultLimit?: number; readonly maxLimit?: number } = {},
): PaginationQuery {
  const defaultLimit = defaults.defaultLimit ?? DEFAULT_LIMIT;
  const maxLimit = defaults.maxLimit ?? MAX_LIMIT;

  const limitResult = parseIntQuery(searchParams.get('limit') ?? undefined, defaultLimit);
  const offsetResult = parseIntQuery(searchParams.get('offset') ?? undefined, 0);

  const errors: ValidationError[] = [];

  if (!limitResult.ok) {
    errors.push(
      new ValidationError('limit', 'limit must be a non-negative integer.', 'invalid_type'),
    );
  } else if (limitResult.value < 1 || limitResult.value > maxLimit) {
    errors.push(
      new ValidationError(
        'limit',
        `limit must be between 1 and ${String(maxLimit)}.`,
        'out_of_range',
      ),
    );
  }

  if (!offsetResult.ok) {
    errors.push(
      new ValidationError('offset', 'offset must be a non-negative integer.', 'invalid_type'),
    );
  } else if (offsetResult.value < 0) {
    errors.push(new ValidationError('offset', 'offset must be 0 or greater.', 'out_of_range'));
  }

  if (errors.length > 0) {
    throw new ValidationException(errors);
  }

  // Type assertion safe: both results are ok at this point
  return {
    limit: (limitResult as { ok: true; value: number }).value,
    offset: (offsetResult as { ok: true; value: number }).value,
  };
}
