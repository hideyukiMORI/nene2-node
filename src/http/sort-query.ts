import { ValidationError } from '../validation/validation-error.js';
import { ValidationException } from '../validation/validation-exception.js';

export type SortOrder = 'asc' | 'desc';

export interface SortQuery {
  readonly column: string;
  readonly order: SortOrder;
}

export interface SortQueryOptions {
  /**
   * Allowlist of sortable column names. Matched by exact, case-sensitive
   * equality — these values are interpolated into `ORDER BY`, so the list must
   * contain only trusted identifiers.
   */
  readonly columns: readonly string[];
  /** Column used when `sort` is absent or empty. Must be in `columns`. */
  readonly defaultColumn: string;
  /** Direction used when `order` is absent or empty. Defaults to `desc`. */
  readonly defaultOrder?: SortOrder;
}

const ORDERS: readonly SortOrder[] = ['asc', 'desc'];

/**
 * Parse and validate `sort` / `order` query parameters for a list endpoint
 * against a strict allowlist.
 *
 * `ORDER BY` clauses cannot use parameterized bind values — the column name is
 * interpolated directly into SQL. Allowlist validation is therefore the only
 * safe pattern. Matching uses `Array.includes` (O(n), case-sensitive, **no
 * regex**) so it is immune to ReDoS on long attacker-controlled payloads and
 * rejects injection, comments, null bytes, whitespace, and column indexes.
 *
 * Returns the validated `{ column, order }`. Throws `ValidationException`
 * (→ 422) when `sort` or `order` is present but not in the allowlist.
 *
 * @example
 *   const { column, order } = parseSortQuery(c.req.queries(), {
 *     columns: ['id', 'title', 'created_at'],
 *     defaultColumn: 'created_at',
 *   });
 *   const sql = `SELECT * FROM articles ORDER BY ${column} ${order} LIMIT ?`;
 */
export function parseSortQuery(
  searchParams: URLSearchParams,
  options: SortQueryOptions,
): SortQuery {
  const { columns, defaultColumn } = options;
  const defaultOrder = options.defaultOrder ?? 'desc';

  // Programmer error, not user input: a default outside the allowlist would
  // emit a column that the allowlist would itself reject.
  if (!columns.includes(defaultColumn)) {
    throw new Error(
      `parseSortQuery: defaultColumn "${defaultColumn}" is not in the columns allowlist.`,
    );
  }

  const sortRaw = searchParams.get('sort');
  const orderRaw = searchParams.get('order');

  const errors: ValidationError[] = [];

  let column = defaultColumn;
  if (sortRaw !== null && sortRaw !== '') {
    if (columns.includes(sortRaw)) {
      column = sortRaw;
    } else {
      errors.push(
        new ValidationError('sort', `sort must be one of: ${columns.join(', ')}.`, 'invalid_value'),
      );
    }
  }

  let order = defaultOrder;
  if (orderRaw !== null && orderRaw !== '') {
    if (ORDERS.includes(orderRaw as SortOrder)) {
      order = orderRaw as SortOrder;
    } else {
      errors.push(new ValidationError('order', "order must be 'asc' or 'desc'.", 'invalid_value'));
    }
  }

  if (errors.length > 0) {
    throw new ValidationException(errors);
  }

  return { column, order };
}
