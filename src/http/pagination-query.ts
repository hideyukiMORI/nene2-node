import { ValidationError } from '../validation/validation-error.js';
import { ValidationException } from '../validation/validation-exception.js';

export interface PaginationQuery {
  readonly limit: number;
  readonly offset: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parseIntQuery(value: string | undefined, fallback: number): number {
  if (value === undefined || value === '') {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parsePaginationQuery(
  searchParams: URLSearchParams,
  defaults: { readonly defaultLimit?: number; readonly maxLimit?: number } = {},
): PaginationQuery {
  const defaultLimit = defaults.defaultLimit ?? DEFAULT_LIMIT;
  const maxLimit = defaults.maxLimit ?? MAX_LIMIT;
  const limit = parseIntQuery(searchParams.get('limit') ?? undefined, defaultLimit);
  const offset = parseIntQuery(searchParams.get('offset') ?? undefined, 0);

  const errors: ValidationError[] = [];

  if (limit < 1 || limit > maxLimit) {
    errors.push(
      new ValidationError(
        'limit',
        `limit must be between 1 and ${String(maxLimit)}.`,
        'out_of_range',
      ),
    );
  }

  if (offset < 0) {
    errors.push(new ValidationError('offset', 'offset must be 0 or greater.', 'out_of_range'));
  }

  if (errors.length > 0) {
    throw new ValidationException(errors);
  }

  return { limit, offset };
}
